const express = require('express');
const { 
  getAllLeads, createLead, updateLead, deleteLead, approveLead,
  getCategories, createCategory, updateCategory, deleteCategory,
  getFreelancers, getClients, getStats
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

const router = express.Router();

router.use(auth, requireRole('admin'));

// Leads
router.get('/leads', getAllLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);
router.put('/leads/:id/approve', approveLead);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Users
router.get('/freelancers', getFreelancers);
router.get('/clients', getClients);

// Stats
router.get('/stats', getStats);

module.exports = router;
