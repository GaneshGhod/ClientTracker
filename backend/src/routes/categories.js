const express = require('express');
const { Category } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { isActive: true } });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
