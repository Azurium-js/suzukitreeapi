const express = require('express');
const moment = require('moment');
const router = express.Router();
const authController = require('../Controllers/authController');
const History = require('../models/History');

const Auth = new authController();

router.route('/fetchLessons').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const lessonTransactions = await History.find({ userId: req.body.userId, deleted: false, type: 'lessons', date: { $gt: moment(req.body.startDate).subtract('1', 'days'), $lte: moment(req.body.endDate).add('1', 'days') } }).sort({ date: -1 });
        return res.json(lessonTransactions);
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to fetch your lesson transactions", status: "error" });
        console.log(err);
    }
});

module.exports = router;