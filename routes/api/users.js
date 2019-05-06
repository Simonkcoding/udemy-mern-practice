const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

//@route  POST api/users
//@desc   register user
//@access Public(need token)
router.post('/', [
    check('name', 'Name is requried').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password wit 6 or mreo characters').isLength({ min: 6 })
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { password, name, email } = req.body;

        try {
            let user = await User.findOne({ email });

            //see if user exits

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'user registered' }] });
            }

            //get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });

            //enctypt password

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password,salt);

            await user.save();

            res.send('user route')

            //return jwt to login rightaway

          

        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error')
        }

        
    });

module.exports = router;