const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Users = require('../models/Users');
const Tokens = require('../models/Tokens');
const miscController = require('../Controllers/miscController');

const Misc = new miscController();

router.route('/forgotPassword').post(Misc.limiter, async function (req, res) {
    try {
        if (!req.body.email) return res.status(406).send({ message: "The email field is empty", status: "error" });
        let user = await Users.findOne({ email: req.body.email.toLowerCase() });
        if (!user) return res.status(400).send({ message: "There is no account associated with this email", status: "error" });
        const dupeToken = await Tokens.findOne({ userId: user._id, usage: "resetPassword" });
        if (dupeToken) return res.status(400).send({ message: "We've already sent you a reset email please check your email", status: "error" });

        const token = await new Tokens({
            userId: user._id,
            token: crypto.randomBytes(64).toString("hex"),
            usage: "resetPassword"
        }).save();

        const sent = await Misc.sendEmail(req.body.email, "Reset Password Now!", `<a href="http://localhost:3000/reset-password/${token.token}">Reset Password</a>`);
        if (!sent) return res.status(500).send({ message: "The reset password email has failed to send", status: "error" });
        return res.status(201).send({ message: "Please check your email to reset your password", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to reset your password", status: "error" });
        console.log(err);
    }
});

module.exports = router;