const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');
const History = require('../models/History');
const Classes = require('../Models/Classes');

const Auth = new authController();

router.route('/addHistory').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const students = await Students.findOne({ userId: req.body.userId });
        let student;

        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id", status: "error" });
        if (!req.body.type) return res.status(406).send({ message: "There is no type of class provided", status: "error" });
        if (!req.body.date || !req.body.history) return res.status(406).send({ message: "There is no date or history data", status: "error" });
        if (req.body.type === "single" || req.body.type === "weekly") {
            student = students.students.filter(student => student._id == req.body.studentId)[0];
        } else return res.status(406).send({ message: "The class type provided is invalid", status: "error" });

        if (student.history[0].date === "recently deleted" || student.history[0].history === "recently deleted") {
            student.history = [
                { date: req.body.date, history: req.body.history },
                {
                    date: student.history[1].date,
                    history: student.history[1].history
                },
                {
                    date: student.history[2].date,
                    history: student.history[2].history
                },
                {
                    date: student.history[3].date,
                    history: student.history[3].history
                }
            ];
        } else {
            student.history = [
                { date: req.body.date, history: req.body.history },
                {
                    date: student.history[0].date,
                    history: student.history[0].history
                },
                {
                    date: student.history[1].date,
                    history: student.history[1].history
                },
                {
                    date: student.history[2].date,
                    history: student.history[2].history
                }
            ];
        }
        student.credit--;
        console.log(student.history);
        await Classes.updateMany({ userId: req.body.userId, studentId: req.body.studentId, deleted: false }, { history: student.history });
        await students.save();

        await new History({
            userId: req.body.userId,
            studentId: req.body.studentId,
            lessons: student.credit,
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