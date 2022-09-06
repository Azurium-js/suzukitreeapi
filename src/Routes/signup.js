const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const Users = require('../models/Users');
const Tokens = require('../models/Tokens');
const miscController = require('../Controllers/miscController');

const Misc = new miscController();

router.route('/signup').post(Misc.limiter, async function (req, res) {
    try {
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.phoneNumber) return res.status(406).send({ message: "The name, email, password, or phone number field are empty", status: "error" });
        let user = await Users.findOne({ email: req.body.email.toLowerCase() });
        if (user) return res.status(400).send({ message: "The email used to register is already used by another account", status: "error" });

        user = await new Users({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: await bcrypt.hash(req.body.password, 10),
            phoneNumber: req.body.phoneNumber
        }).save();

        const token = await new Tokens({
            userId: user._id,
            token: crypto.randomBytes(64).toString("hex"),
            usage: "verification"
        }).save();

        const sent = await Misc.sendEmail(req.body.email, "Verify Now!", `<a href="http://localhost:3000/verify-user/${token.token}">Verify</a>`);
        if (!sent) return res.status(500).send({ message: "Your account has been registered however the verification email has not been sent", status: "error" });
        return res.status(201).send({ message: "You have been successful in registering your account, check your email to verify your account", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to register your account", status: "error" });
        console.log(err);
    }
});

module.exports = router;