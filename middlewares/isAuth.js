const JWT = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    
    if(!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
        decodedToken = JWT.verify(token, 'mysupersecret');
    } catch(e) {
        e.statusCode = 500;
        throw e;
    }

    if(!decodedToken) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }

    req.adminUserId = decodedToken.userId;
    next();
};