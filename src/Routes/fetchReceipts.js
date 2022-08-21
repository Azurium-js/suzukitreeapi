const express = require('express');
const moment = require('moment');
const router = express.Router();
const authController = require('../Controllers/authController');
const History = require('../models/History');

const Auth = new authController();

router.route('/fetchReceipts').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });

        console.log(req.body.startDate);
        console.log(moment(req.body.startDate));
        console.log(moment(req.body.endDate));
        const receipts = await History.find({ userId: req.body.userId, deleted: false, type: 'receipt', date: { $gt: moment(req.body.startDate), $lt: moment(req.body.endDate).add('1', 'days') } }).sort({ date: -1 });
        return res.json(receipts);
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to fetch your receipts", status: "error" });
        console.log(err);
    }
});

module.exports = router;