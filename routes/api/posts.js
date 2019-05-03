const express = require('express');
const router = express.Router();

//@route  Get api/posts
//@desc   Test route
//@access Public(need token)
router.get('/',(req,res)=> res.send('posts route'));

module.exports = router;