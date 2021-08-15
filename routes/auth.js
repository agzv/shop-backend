const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.post('/admin/create-admin-user', authController.createAdminUser);

module.exports = router;