const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');

const Auth = new authController();

router.route('/addStudent').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (Object.keys(req.body).length !== 10) return res.status(406).send({ message: "You are missing some values to create this student", status: "error" });

        const student = await Students.findOne({ userId: req.body.userId });

        if (student) {
            student.students = [
                ...student.students,
                {
                    name: req.body.name,
                    birthday: req.body.birthday,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    instruments: req.body.instruments,
                    lessonDays: req.body.lessonDays,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    comment: req.body.comment
                }
            ];
            await student.save();
        } else {
            await new Students({
                userId: req.body.userId,
                students: [{
                    name: req.body.name,
                    birthday: req.body.birthday,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    instruments: req.body.instruments,
                    lessonDays: req.body.lessonDays,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    comment: req.body.comment
                }]
            }).save();
        }

        return res.status(200).send({ message: "That student was successfully created", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to register that student", status: "error" });
        console.log(err);
    }
});

module.exports = router;