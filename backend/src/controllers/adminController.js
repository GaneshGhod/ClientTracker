const { Lead, Category, User, Subscription } = require('../models');

// Leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createLead = async (req, res) => {
  try {
    const { title, description, categoryId, budgetMin, budgetMax, clientContact, clientReference } = req.body;
    const lead = await Lead.create({
      title,
      description,
      categoryId,
      budgetMin,
      budgetMax,
      clientContact,
      clientReference,
      status: 'open',
      source: 'admin',
      postedBy: req.user.id
    });
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.update(req.body);
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.destroy();
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.status = 'open';
    await lead.save();
    res.json({ message: 'Lead approved', lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.update(req.body);
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Users
const getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.findAll({
      where: { role: 'freelancer' },
      attributes: ['id', 'name', 'email', 'createdAt'],
      include: [{ model: Subscription }]
    });
    res.json(freelancers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: ['id', 'name', 'email', 'createdAt'],
      include: [{ model: Lead, as: 'postedLeads', attributes: ['id'] }]
    });
    
    const formattedClients = clients.map(client => {
      const c = client.toJSON();
      c.leadCount = c.postedLeads ? c.postedLeads.length : 0;
      delete c.postedLeads;
      return c;
    });

    res.json(formattedClients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stats
const getStats = async (req, res) => {
  try {
    const totalLeads = await Lead.count();
    const openLeads = await Lead.count({ where: { status: 'open' } });
    const claimedLeads = await Lead.count({ where: { status: 'claimed' } });
    const closedLeads = await Lead.count({ where: { status: 'closed' } });
    const pendingLeads = await Lead.count({ where: { status: 'pending' } });
    
    const activeSubscribers = await Subscription.count({ where: { status: 'active' } });
    const totalFreelancers = await User.count({ where: { role: 'freelancer' } });
    const totalClients = await User.count({ where: { role: 'client' } });

    res.json({
      totalLeads,
      openLeads,
      claimedLeads,
      closedLeads,
      pendingLeads,
      activeSubscribers,
      totalFreelancers,
      totalClients
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  approveLead,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFreelancers,
  getClients,
  getStats
};
