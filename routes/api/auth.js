const express = require('express');
const router = express.Router();

//@route  Get api/auth
//@desc   Test route
//@access Public(need token)
router.get('/',(req,res)=> res.send('auth route'));

module.exports = router;