const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../controllers/userAuth');
const User = require('../models/user');

router.post('/create-user', [
    body('firstName', 'Please enter your first name').trim().not().isEmpty(),
    body('lastName', 'Please enter your last name').trim().not().isEmpty(),
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
    body('country').trim().not().isEmpty().withMessage('Please enter your country'),
    body('address').trim().not().isEmpty().withMessage('Please enter your address'),
    body('zip').trim().not().isEmpty().withMessage('Please enter your zip code')
], authController.createUser);

router.post('/login-user', [
    body('email', 'Please enter your email').trim().not().isEmpty(),
    body('password', 'Please enter your password').trim().not().isEmpty()
], authController.loginUser);

module.exports = router;