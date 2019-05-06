const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

//@route  POST api/users
//@desc   register user
//@access Public(need token)
router.post('/', [
    check('name', 'Name is requried').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password wit 6 or mreo characters').isLength({ min: 6 })
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    res.send('user route')
});

module.exports = router;