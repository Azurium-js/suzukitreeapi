const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

const Auth = new authController();

router.route('/access').post(Auth.authenticateToken, function (req, res) {
    return res.status(200).send({ access: true });
});

module.exports = router;