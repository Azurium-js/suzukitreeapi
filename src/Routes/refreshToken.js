const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Users = require('../models/Users');

const Auth = new authController();

router.route('/refreshToken').get(async function (req, res) {
    if (!req.cookies.jwt) return res.status(406).send({ message: "No refresh token found", status: "error" });
    const userFound = await Users.findOne({ refreshToken: req.cookies.jwt });
    if (!userFound) {
        return res.status(403).send({ message: "Invalid refresh token", status: "error" });
    }

    Auth.refreshToken(res, req.cookies.jwt, userFound);
});

module.exports = router;