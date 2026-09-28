const express = require('express');
const { getLeads, getLeadById, claimLead, getMyClaimedLeads } = require('../controllers/leadController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const subscriptionCheck = require('../middleware/subscriptionCheck');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();
  const jwt = require('jsonwebtoken');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {}
  next();
};

router.get('/', getLeads);
router.get('/my', auth, requireRole('freelancer'), getMyClaimedLeads);
router.get('/:id', optionalAuth, getLeadById);
router.post('/:id/claim', auth, requireRole('freelancer'), subscriptionCheck, claimLead);

module.exports = router;
