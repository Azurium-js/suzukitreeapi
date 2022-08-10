const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Users = require('../models/Users');
const Tokens = require('../models/Tokens');

router.route('/resetPassword').post(async function (req, res) {
    try {
        if (!req.body.password || !req.body.token) return res.status(406).send({ message: "You need a password and a token to reset your password" });
        const token = await Tokens.findOne({ token: req.body.token, usage: "resetPassword" });
        if (!token) return res.status(401).send({ message: "This reset password link is expired or invalid" });
        const user = await Users.findOne({ _id: token.userId });
        if (!user) return res.status(401).send({ message: "This reset password link is invalid" });
        user.password = await bcrypt.hash(req.body.password, 10);
        user.accessToken = "";
        user.refreshToken = "";
        await token.remove();

        await user.save();

        return res.status(203).send({ message: "Successfully reset password", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again later" });
        console.log(err);
    }
});

module.exports = router;