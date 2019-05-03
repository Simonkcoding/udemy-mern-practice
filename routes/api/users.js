const express = require('express');
const router = express.Router();

//@route  Get api/users
//@desc   Test route
//@access Public(need token)
router.get('/',(req,res)=> res.send('user route'));

module.exports = router;