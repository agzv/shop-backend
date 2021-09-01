const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const JWT = require('jsonwebtoken');

const User = require('../models/user');


exports.createUser = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { firstName, lastName, email, password, confirmPassword, country, address, zip } = req.body;

    if(password !== confirmPassword) {
        const error = new Error('Passwords have to match');
        error.statusCode = 422;
        throw error;
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({ 
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                country: country,
                address: address,
                zip: zip,
                cart: { items: [] }
             });
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'User was created successfully' });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.loginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                const error = new Error('A user with this email doesn\'t exist');
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
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
            }, 'usersecret', { expiresIn: '1hr' });

            res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};