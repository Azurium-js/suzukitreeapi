const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const Tokens = require('../models/Tokens');

router.route('/verifyUser').post(async function (req, res) {
    try {
        const token = await Tokens.findOne({ token: req.body.token });
        if (!token) return res.status(401).send({ message: "This verification link is expired or invalid" });
        const user = await Users.findOne({ _id: token.userId });
        if (!user) return res.status(401).send({ message: "This verification link is invalid" });

        console.log(user);

        await Users.findOneAndUpdate({ _id: user._id }, { verified: true });
        await token.remove();
        return res.status(203).send({ message: "You've been verified succesfully, you may now close out of this window" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again later" });
        console.log(err);
    }
});

module.exports = router;