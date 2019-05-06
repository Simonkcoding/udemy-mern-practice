const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    //Get toekn from header
    const token = req.header('x-auth-token');

    //Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'no token, authoriztoion denied' });
    }

    //verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'not a valid token' });
    }
}