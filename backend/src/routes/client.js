const express = require('express');
const { body } = require('express-validator');
const { postLead, getClientLeads } = require('../controllers/clientController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

const router = express.Router();

router.use(auth, requireRole('client'));

router.post('/leads', [
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('categoryId', 'Valid Category ID is required').isUUID(),
  body('budgetMin', 'Minimum budget is required').isNumeric(),
  body('budgetMax', 'Maximum budget is required').isNumeric()
], postLead);

router.get('/leads', getClientLeads);

module.exports = router;
