const express = require('express');
const {
  getClients,
  getReminders,
  getClientById,
  createClient,
  updateClient,
  updateClientStatus,
  deleteClient,
} = require('../controllers/clientTrackerController');

const router = express.Router();

router.get('/', getClients);
router.get('/reminders', getReminders);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.patch('/:id/status', updateClientStatus);
router.delete('/:id', deleteClient);

module.exports = router;
