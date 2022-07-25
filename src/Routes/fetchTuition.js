const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Tuitions = require('../models/Tuitions');

const Auth = new authController();

router.route('/fetchTuition').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id", status: "error" });
        const tuition = await Tuitions.findOne({ userId: req.body.userId, studentId: req.body.studentId, deleted: false });

        return res.json(tuition);
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to fetch that student's tuition", status: "error" });
        console.log(err);
    }
});

module.exports = router;