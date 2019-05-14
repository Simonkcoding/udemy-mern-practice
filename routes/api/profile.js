const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  Get api/profile/userId
//@desc   get current user profile
//@access Private(need token)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'there is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.send(500).send('server error');
    }
});

//@route  post api/profile/
//@desc   create or update user profile
//@access Private(need token)
router.post("/", [auth, [
    check('status', 'status is require').not().isEmpty(),
    check('skills', 'skills is require').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;


    // build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        //create

        profile = new Profile(profileFields);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error')
    }

});

//@route  Get api/profile/
//@desc   get all profile
//@access Public

router.get("/", async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
})

//@route  Get api/profile/user/:user_id
//@desc   get profile by user id
//@access Public

router.get("/user/:user_id", async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (error) {
        console.error(error.message);

        if (error.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('server error');
    }
})

//@route  DELETE api/profile/
//@desc  Delete profile, user and posts
//@access Private

router.delete("/", auth, async (req, res) => {
    try {
        //@todo - remove users posts
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
})

//@route  Put api/profile/experience
//@desc  Add profile experience
//@access Private

router.put("/experience", [auth, [
    check('title', 'title is needed').not().isEmpty(),
    check('company', 'company is needed').not().isEmpty(),
    check('from', 'start date is needed').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
})

//@route  delete api/profile/experience/:exp_id
//@desc  delete expereince from profile
//@access Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
try {
    const profile = await Profile.findOne({user:req.user.id});

    //get remove index
    const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex,1);

    await profile.save();
    res.json(profile);

} catch (error) {
    console.error(error.message);
    res.status(500).json('server error');
}
})

//@route  Put api/profile/education
//@desc  Add profile education
//@access Private

router.put("/education", [auth, [
    check('school', 'school is needed').not().isEmpty(),
    check('degree', 'degree is needed').not().isEmpty(),
    check('fieldofstudy', 'Field of study is needed').not().isEmpty(),
    check('from', 'start date is needed').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
})

//@route  delete api/profile/education/:edu_id
//@desc  delete education from profile
//@access Private

router.delete("/education/:edu_id", auth, async (req, res) => {
try {
    const profile = await Profile.findOne({user:req.user.id});

    //get remove index
    const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex,1);

    await profile.save();
    res.json(profile);

} catch (error) {
    console.error(error.message);
    res.status(500).json('server error');
}
})



module.exports = router;