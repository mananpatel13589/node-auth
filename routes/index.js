var express = require('express');
var router = express.Router();

const {
  isLoggedIn
} = require('../libs/middlewares/auth_checker');
const {
  login,
  register,
  getProfile,
  updateProfile
} = require('../api/user');


router.post('/register', register);
router.post('/login', login);
router.get('/profile', isLoggedIn, getProfile);
router.post('/profile', isLoggedIn, updateProfile);

module.exports = router;
