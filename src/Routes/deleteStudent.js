const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');
const Tuitions = require('../models/Tuitions');
const Classes = require('../Models/Classes');

const Auth = new authController();

router.route('/deleteStudent').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const students = await Students.findOne({ userId: req.body.userId });

        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id to delete", status: "error" });
        students.students.filter(student => student._id == req.body.studentId)[0].deleted = true;
        students.students.filter(student => student._id == req.body.studentId)[0].lastDeleted = new Date();
        await students.save();
        await Tuitions.findOneAndUpdate({ userId: req.body.userId, studentId: req.body.studentId }, { deleted: true });
        await Classes.updateMany({ userId: req.body.userId, studentId: req.body.studentId }, { deleted: true });

        return res.json({ message: "Successfully deleted that student", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying delete that student", status: "error" });
        console.log(err);
    }
});

module.exports = router;