const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');
const History = require('../models/History');

const Auth = new authController();

router.route('/removeLatestHistory').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const students = await Students.findOne({ userId: req.body.userId });

        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id", status: "error" });
        students.students.filter(student => student._id == req.body.studentId)[0].history = [
            { date: "recently deleted", history: "recently deleted" },
            {
                date: students.students.filter(student => student._id == req.body.studentId)[0].history[1].date,
                history: students.students.filter(student => student._id == req.body.studentId)[0].history[1].history
            },
            {
                date: students.students.filter(student => student._id == req.body.studentId)[0].history[2].date,
                history: students.students.filter(student => student._id == req.body.studentId)[0].history[2].history
            },
            {
                date: students.students.filter(student => student._id == req.body.studentId)[0].history[3].date,
                history: students.students.filter(student => student._id == req.body.studentId)[0].history[3].history
            }
        ];
        students.students.filter(student => student._id == req.body.studentId)[0].credit++;
        await students.save();

        await new History({
            userId: req.body.userId,
            studentId: req.body.studentId,
            lessons: students.students.filter(student => student._id == req.body.studentId)[0].credit,
            lessonTransaction: "+1",
            transaction: "Added lesson",
            type: "lessons",
            date: new Date()
        }).save();

        return res.json({ message: "Successfully removed the latest history for that student", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to remove this student's latest history", status: "error" });
        console.log(err);
    }
});

module.exports = router;