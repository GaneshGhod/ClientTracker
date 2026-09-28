const express = require('express');
const { body } = require('express-validator');
const { signup, login, adminLogin, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role must be freelancer or client').isIn(['freelancer', 'client'])
], signup);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], login);

router.post('/admin/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], adminLogin);

router.get('/me', auth, getMe);

module.exports = router;
