const { validationResult } = require('express-validator');
const { Lead, Category } = require('../models');

const postLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, categoryId, budgetMin, budgetMax, clientContact, clientReference } = req.body;

  try {
    const lead = await Lead.create({
      title,
      description,
      categoryId,
      budgetMin,
      budgetMax,
      clientContact,
      clientReference,
      status: 'pending',
      source: 'client',
      postedBy: req.user.id
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClientLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      where: { postedBy: req.user.id },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  postLead,
  getClientLeads
};
