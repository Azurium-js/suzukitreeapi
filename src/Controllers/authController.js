require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = class Auth {
    constructor() {

    }

    generateAccessToken = (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' }); //10m
    }

    generateRefreshToken = (user, type) => {
        if (type === "week") {
            return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' }); //10m
        } else if (type === "day") {
            return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); //10m
        }
    }

    authenticateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(406).send({ message: "No token found", status: "error" });

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).send({ message: "Expired access token, please refresh and try again", status: "error" });
            req.user = user;
            next();
        });
    }

    refreshToken = (res, token, userFound) => {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err || userFound._id.toString() !== user.id) return res.sendStatus(403);
            const accessToken = this.generateAccessToken({ id: user.id });
            userFound.accessToken = accessToken;
            const userData = await userFound.save();
            return res.json({ userId: userData._id, accessToken: accessToken });
        });
    }

    handleRefreshTokenReuse = (res, refreshToken, Users) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return res.sendStatus(403);
            const compromisedUser = await Users.findOne({ _id: user.id });
            compromisedUser.accessToken = "";
            compromisedUser.refreshToken = "";
            const response = await compromisedUser.save();
            console.log(response);
        });
    }
}