const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const Tokens = require('../models/Tokens');

router.route('/resetPasswordAuth').post(async function (req, res) {
    try {
        const token = await Tokens.findOne({ token: req.body.token, usage: "resetPassword" });
        if (!token) return res.status(401).send({ message: "This reset password link is expired or invalid" });
        const user = await Users.findOne({ _id: token.userId });
        if (!user) return res.status(401).send({ message: "This reset password link is invalid" });

        return res.status(203).send({ message: "Reset password link is valid", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again later" });
        console.log(err);
    }
});

module.exports = router;