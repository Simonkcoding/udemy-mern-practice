const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

//@route  POST api/posts
//@desc   xreate a post
//@access Private (need token)
router.post('/', [auth, [
    check('text', 'text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post(
            {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }
        )

        const post = await newPost.save();
        res.json(post)

    } catch (error) {
        console.error(error.message);
        res.status(500).json('server error')
    }

});

//@route  GET api/posts
//@desc   get all post
//@access Private (need token)

router.get("/", auth, async (req, res) => {
    try {

        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);

    } catch (error) {
        console.error(error.message);
        res.status(500).json('server error')
    }
});

//@route  GET api/posts/:post_id
//@desc   get post by id
//@access Private (need token)

router.get("/:post_id", auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        console.error(error.message);
        res.status(500).json('server error')
    }
});

//@route  delete api/posts/:post_id
//@desc   delete post by id
//@access Private (need token)
router.delete("/:post_id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        // check post exist
        if (!post) {
            return res.status(401).json({ msg: 'post not exist' });
        }
        // check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'user not authorized' });
        }

        await post.remove();
        res.json({ msg: 'post removed' });

    } catch (error) {

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        console.error(error.message);
        res.status(500).json('server error');
    }
})
module.exports = router;