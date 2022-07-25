const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');
const History = require('../models/History');

const Auth = new authController();

router.route('/addHistory').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const students = await Students.findOne({ userId: req.body.userId });

        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id", status: "error" });
        if (!req.body.date || !req.body.history) return res.status(406).send({ message: "There is no date or history data", status: "error" });
        if (students.students.filter(student => student._id == req.body.studentId)[0].history[0].date === "recently deleted" || students.students.filter(student => student._id == req.body.studentId)[0].history[0].history === "recently deleted") {
            students.students.filter(student => student._id == req.body.studentId)[0].history = [
                { date: req.body.date, history: req.body.history },
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
        } else {
            students.students.filter(student => student._id == req.body.studentId)[0].history = [
                { date: req.body.date, history: req.body.history },
                {
                    date: students.students.filter(student => student._id == req.body.studentId)[0].history[0].date,
                    history: students.students.filter(student => student._id == req.body.studentId)[0].history[0].history
                },
                {
                    date: students.students.filter(student => student._id == req.body.studentId)[0].history[1].date,
                    history: students.students.filter(student => student._id == req.body.studentId)[0].history[1].history
                },
                {
                    date: students.students.filter(student => student._id == req.body.studentId)[0].history[2].date,
                    history: students.students.filter(student => student._id == req.body.studentId)[0].history[2].history
                }
            ];
        }
        students.students.filter(student => student._id == req.body.studentId)[0].credit--;
        await students.save();

        await new History({
            userId: req.body.userId,
            studentId: req.body.studentId,
            lessons: students.students.filter(student => student._id == req.body.studentId)[0].credit,
            lessonTransaction: "-1",
            transaction: "Finished lesson",
            type: "lessons",
            date: new Date()
        }).save();

        return res.json({ message: "Successfully added the latest history for that student", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to add the latest history provided for that student", status: "error" });
        console.log(err);
    }
});

module.exports = router;