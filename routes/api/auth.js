const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

//@route  Get api/auth
//@desc   Test route
//@access Public(need token)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

//@route  POST api/auth
//@desc   authenticate user &get user token
//@access Public(need token)
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { password, email } = req.body;

        try {
            let user = await User.findOne({ email });

            //see if user exits

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'invild credentials' }] });
            }

            //match password

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json({ errors: [{ msg: 'invild credentials' }] });
            }

            //return jwt to login rightaway

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload,
                config.get('jwtToken'),
                { expiresIn: 360000 },
                (err,token)=>{
                    if(err) throw err;
                    res.json({token});
                }
            );

        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error')
        }

    });

module.exports = router;