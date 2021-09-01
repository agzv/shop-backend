const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../controllers/userAuth');
const User = require('../models/user');

router.post('/create-user', [
    body('firstName').trim().not().isEmpty(),
    body('lastName').trim().not().isEmpty(),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if(userDoc) {
                    return Promise.reject('Email already exists, try to login');
                }
            });
        })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }).withMessage('Your password is too short, min 5 characters'),
    body('country').trim().not().isEmpty().withMessage('Field is required'),
    body('address').trim().not().isEmpty().withMessage('Field is required'),
    body('zip').trim().not().isEmpty().withMessage('Field is required')
], authController.createUser);

router.post('/login-user', authController.loginUser);

module.exports = router;