const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const History = require('../models/History');

const Auth = new authController();

router.route('/fetchHistory').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const history = await History.find({ userId: req.body.userId, deleted: false, type: { $in: [ 'invoice', 'receipt' ] } }).sort({ date: -1 });

        return res.json(history);
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to fetch that student's history", status: "error" });
        console.log(err);
    }
});

module.exports = router;