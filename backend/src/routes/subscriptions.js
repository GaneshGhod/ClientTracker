const express = require('express');
const { createSubscription, verifySubscriptionPayment, getSubscriptionStatus } = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

const router = express.Router();

router.use(auth, requireRole('freelancer'));

router.post('/create', createSubscription);
router.post('/verify', verifySubscriptionPayment);
router.get('/status', getSubscriptionStatus);

module.exports = router;
