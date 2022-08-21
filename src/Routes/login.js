const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const authController = require('../Controllers/authController');
const miscController = require('../Controllers/miscController');

const Auth = new authController();
const Misc = new miscController();

router.route('/login').post(Misc.limiter, async function (req, res) {
    try {
        if (!req.body.email || !req.body.password) return res.status(406).send({ message: "Email field or password field is empty", status: "error" });
        const user = await Users.findOne({
            email: req.body.email.toLowerCase(),
            deleted: false
        });

        if (!user) return res.status(401).send({ message: "This user has not been registered yet", status: "error" });
        if (user.verified === false) return res.status(400).send({ message: "This user has not been verified yet", status: "error" });

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(400).send({ message: "The credientials inputted are incorrect for the account you're trying to log into", status: "error" });

        const accessToken = Auth.generateAccessToken({ id: user._id });
        const refreshToken = Auth.generateRefreshToken({ id: user._id }, req.body.rememberMe ? "week" : "day");
        await user.updateOne({ accessToken: accessToken, refreshToken: refreshToken });

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: (req.body.rememberMe ? 7 : 1) * (24 * 60 * 60 * 1000), secure: false });
        res.json({ userId: user._id, accessToken: accessToken, status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to login into your account", status: "error" });
        console.log(err);
    }
});

module.exports = router;