const AdminUser = require('../models/adminUser');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.createAdminUser = (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { firstName, lastName, email, password, confirmPassword, country, address, zip } = req.body;
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            
            if(password !== confirmPassword) {
                const error = new Error();
                error.statusCode = 400;
                error.message = 'Passwords have to match!';
                throw error;
            }

            const adminUser = new AdminUser({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                country: country,
                address: address,
                zip: zip
            });
            return adminUser.save();
        })
        .then(() => {
            res.status(200).json({ message: 'Admin user was successfully created' });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.loginAdminUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    AdminUser.findOne({ email: email })
        .then(user => {
            if(!user) {
                const error = new Error('Validation failed');
                error.data = [{ param: 'email', msg: 'A user with this email doesn\'t exist' }];
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if(!isEqual) {
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            }

            const token = JWT.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'mysupersecret', { expiresIn: '1hr' });

            res.status(200).json({ adminToken: token, adminUserId: loadedUser._id.toString() });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};