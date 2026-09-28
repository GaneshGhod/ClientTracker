const { Lead, Category, sequelize, Subscription } = require('../models');
const { Op } = require('sequelize');

const getLeads = async (req, res) => {
  try {
    const { category, budgetMin, budgetMax, search, page = 1, limit = 10 } = req.query;
    
    const where = { status: 'open' };

    if (category) where.categoryId = category;
    if (budgetMin) where.budgetMin = { [Op.gte]: budgetMin };
    if (budgetMax) where.budgetMax = { [Op.lte]: budgetMax };
    if (search) {
      const isPg = sequelize.getDialect() === 'postgres';
      where.title = { [isPg ? Op.iLike : Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const leads = await Lead.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['clientContact', 'clientReference'] }
    });

    res.json({
      totalItems: leads.count,
      leads: leads.rows,
      totalPages: Math.ceil(leads.count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    let hasAccess = false;
    // req.user might be available if authentication middleware doesn't strict-fail but continues
    // Let's assume auth middleware strictly fails if no token, so if we reach here without user, it's an error.
    // However, leads.js route might use optional auth. We'll check req.user.
    
    if (req.user && req.user.role === 'freelancer') {
      const sub = await Subscription.findOne({
        where: {
          userId: req.user.id,
          status: 'active',
          endDate: { [Op.gt]: new Date() }
        }
      });
      if (sub) hasAccess = true;
    } else if (req.user && ['admin', 'client'].includes(req.user.role)) {
      hasAccess = true;
    }

    const leadData = lead.toJSON();
    if (!hasAccess && leadData.status !== 'claimed' && req.user?.id !== leadData.claimedBy) {
      delete leadData.clientContact;
      delete leadData.clientReference;
    }

    res.json(leadData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const claimLead = async (req, res) => {
  const { id } = req.params;
  const freelancerId = req.user.id;
  const subscription = req.subscription;

  try {
    if (subscription.claimsLimit !== -1 && subscription.claimsUsedThisMonth >= subscription.claimsLimit) {
      return res.status(403).json({ message: 'Monthly claims limit reached' });
    }

    const claimedLead = await sequelize.transaction(async (t) => {
      const lead = await Lead.findByPk(id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!lead) {
        throw new Error('Lead not found');
      }
      
      if (lead.status !== 'open') {
        throw new Error('Lead is no longer available');
      }

      lead.status = 'claimed';
      lead.claimedBy = freelancerId;
      lead.claimedAt = new Date();
      await lead.save({ transaction: t });

      subscription.claimsUsedThisMonth += 1;
      await subscription.save({ transaction: t });

      return lead;
    });

    res.json({ message: 'Lead claimed successfully', lead: claimedLead });
  } catch (err) {
    console.error(err);
    if (err.message === 'Lead not found' || err.message === 'Lead is no longer available') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error during claiming process' });
  }
};

const getMyClaimedLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      where: { claimedBy: req.user.id },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['claimedAt', 'DESC']]
    });
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  claimLead,
  getMyClaimedLeads
};
