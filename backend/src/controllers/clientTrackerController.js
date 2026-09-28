const { Client, sequelize } = require('../models');
const { Op } = require('sequelize');

// List clients with optional search, status filtering, and follow-up filtering
const getClients = async (req, res) => {
  try {
    const { search, status, remindersOnly } = req.query;
    const isPg = sequelize.getDialect() === 'postgres';
    const likeOp = isPg ? Op.iLike : Op.like;

    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [likeOp]: q } },
        { company: { [likeOp]: q } },
        { email: { [likeOp]: q } },
        { phone: { [likeOp]: q } },
        { projectTitle: { [likeOp]: q } },
      ];
    }

    if (remindersOnly === 'true') {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      where.followUpDate = {
        [Op.ne]: null,
        [Op.lte]: endOfToday,
      };
      where.status = {
        [Op.notIn]: ['completed', 'lost'],
      };
    }

    const clients = await Client.findAll({
      where,
      order: [
        ['followUpDate', 'ASC'],
        ['updatedAt', 'DESC'],
      ],
    });

    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Quick endpoint to get due and overdue reminders
const getReminders = async (req, res) => {
  try {
    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const clients = await Client.findAll({
      where: {
        followUpDate: {
          [Op.ne]: null,
          [Op.lte]: endOfToday,
        },
        status: {
          [Op.notIn]: ['completed', 'lost'],
        },
      },
      order: [['followUpDate', 'ASC']],
    });

    const overdue = [];
    const dueToday = [];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    clients.forEach((c) => {
      const fDate = new Date(c.followUpDate);
      if (fDate < startOfToday) {
        overdue.push(c);
      } else {
        dueToday.push(c);
      }
    });

    res.json({
      totalDue: clients.length,
      overdueCount: overdue.length,
      dueTodayCount: dueToday.length,
      clients,
    });
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createClient = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      projectTitle,
      projectDescription,
      budget,
      status,
      followUpDate,
      followUpNote,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client = await Client.create({
      name: name.trim(),
      company: company ? company.trim() : null,
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      projectTitle: projectTitle ? projectTitle.trim() : null,
      projectDescription: projectDescription ? projectDescription.trim() : null,
      budget: budget ? String(budget).trim() : null,
      status: status || 'new',
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpNote: followUpNote ? followUpNote.trim() : null,
      notes: notes ? notes.trim() : null,
    });

    res.status(201).json(client);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Server error creating client' });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const fields = [
      'name',
      'company',
      'email',
      'phone',
      'projectTitle',
      'projectDescription',
      'budget',
      'status',
      'followUpDate',
      'followUpNote',
      'notes',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'followUpDate') {
          client.followUpDate = req.body.followUpDate ? new Date(req.body.followUpDate) : null;
        } else {
          client[field] = req.body[field];
        }
      }
    });

    await client.save();
    res.json(client);
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ message: 'Server error updating client' });
  }
};

const updateClientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!['new', 'contacted', 'in_discussion', 'in_progress', 'completed', 'lost'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    client.status = status;
    await client.save();
    res.json(client);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    await client.destroy();
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getClients,
  getReminders,
  getClientById,
  createClient,
  updateClient,
  updateClientStatus,
  deleteClient,
};
