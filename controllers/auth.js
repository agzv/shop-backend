const AdminUser = require('../models/adminUser');
const bcrypt = require('bcryptjs');

exports.createAdminUser = (req, res, next) => {
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
        .then(result => {
            res.status(200).json({ message: 'Admin user was successfully created', adminUserId: result._id });
        })
        .catch(err => {
            // if(!err.statusCode) {
            //     err.statusCode = 500;
            //     next(err);
            // }
            res.status(err.statusCode).json({ message: err.message, adminUserId: null });
        });
}; 