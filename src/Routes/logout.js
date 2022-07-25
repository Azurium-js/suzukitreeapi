const express = require('express');
const router = express.Router();
require('dotenv').config();
const Users = require('../models/Users');

router.route('/logout').post(async function (req, res) {
    try {
        if (!req.cookies.jwt) return res.status(406).send({ message: "No refresh token found", status: "error" });

        const userFound = await Users.findOne({ refreshToken: req.cookies.jwt });
        if (!userFound) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            return res.sendStatus(204);
        }

        userFound.refreshToken = '';
        userFound.accessToken = '';
        await userFound.save();

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.status(204).json(userFound);
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again later" });
        console.log(err);
    }
});

module.exports = router;