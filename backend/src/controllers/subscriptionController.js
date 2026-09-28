const { Subscription } = require('../models');
const { createSubscription: createGatewaySubscription, verifyPayment } = require('../services/paymentService');

const createSubscription = async (req, res) => {
  const { plan } = req.body;
  
  if (!['basic', 'pro'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan' });
  }

  try {
    const gatewaySub = await createGatewaySubscription(req.user.id, plan);
    
    // For now, directly activate as placeholder
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscription.create({
      userId: req.user.id,
      plan,
      status: 'active',
      startDate,
      endDate,
      razorpaySubscriptionId: gatewaySub.razorpaySubscriptionId,
      claimsLimit: plan === 'basic' ? 10 : -1,
      claimsUsedThisMonth: 0
    });

    res.status(201).json({ message: 'Subscription created', subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifySubscriptionPayment = async (req, res) => {
  try {
    const isValid = await verifyPayment(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    res.json({ message: 'Payment verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' },
      order: [['endDate', 'DESC']]
    });

    if (!subscription) {
      return res.json({ status: 'inactive' });
    }

    res.json(subscription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSubscription,
  verifySubscriptionPayment,
  getSubscriptionStatus
};
