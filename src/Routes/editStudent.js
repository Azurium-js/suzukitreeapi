const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');

const Auth = new authController();

router.route('/editStudent').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (Object.keys(req.body).length !== 11) return res.status(406).send({ message: "You are missing some values to edit this student", status: "error" });

        const students = await Students.findOne({ userId: req.body.userId });
        console.log(students.students.filter(student => student._id == req.body.studentId)[0]);

        if (!students.students.filter(student => student._id == req.body.studentId)[0]) return res.status(400).send({ message: "No student found with that id", status: "error" })
        console.log(req.body);

        students.students.filter(student => student._id == req.body.studentId)[0].name = req.body.name.slice(-1) === " " ? req.body.name.slice(0, -1) : req.body.name;
        students.students.filter(student => student._id == req.body.studentId)[0].email = req.body.email;
        students.students.filter(student => student._id == req.body.studentId)[0].phoneNumber = req.body.phoneNumber;
        students.students.filter(student => student._id == req.body.studentId)[0].instruments = req.body.instruments;
        students.students.filter(student => student._id == req.body.studentId)[0].lessonDays = req.body.lessonDays;
        students.students.filter(student => student._id == req.body.studentId)[0].startTime = req.body.startTime;
        students.students.filter(student => student._id == req.body.studentId)[0].endTime = req.body.endTime;
        students.students.filter(student => student._id == req.body.studentId)[0].comment = req.body.comment;

        await students.save();

        return res.status(200).send({ message: "That student was successfully edited", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to edit that student", status: "error" });
        console.log(err);
    }
});

module.exports = router;