const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');

router.post('/signup',     ctrl.signup);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/login',      ctrl.login);
router.post('/logout',     ctrl.logout);
router.get ('/users',      ctrl.listUsers);


module.exports = router;
