const { Subscription } = require('../models');
const { Op } = require('sequelize');

const subscriptionCheck = async (req, res, next) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers need a subscription' });
    }

    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
        status: 'active',
        endDate: {
          [Op.gt]: new Date(),
        }
      }
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Active subscription required' });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription' });
  }
};

module.exports = subscriptionCheck;
