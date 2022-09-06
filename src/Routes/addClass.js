const express = require('express');
const router = express.Router();
const moment = require('moment');
const authController = require('../Controllers/authController');
const Classes = require('../Models/Classes');
const Students = require('../models/Students');

const Auth = new authController();

router.route('/addClass').post(Auth.authenticateToken, async function (req, res) {
    try {
        const days = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        }

        if (!req.body.userId || !req.body.studentId || !req.body.classDate || !req.body.duration) return res.status(406).send({ message: "There is not enough data to create this class", status: "error" });
        console.log((new Date().getTime() <= moment().add('4', 'days').valueOf()) && (moment().add('3', 'days').valueOf() <= moment().add('1', 'days').valueOf()));
        let conflict = {
            state: false,
            type: ""
        };

        const classes = await Classes.find({ userId: req.body.userId, studentId: req.body.studentId, deleted: false });
        const students = await Students.findOne({ userId: req.body.userId });
        const student = students.students.filter(student => student._id == req.body.studentId && !student.deleted)[0];
        for (let i = 0; i < classes.length; i++) {
            if ((new Date(req.body.classDate).getTime() <= moment(classes[i].classDate).add(classes[i].duration, 'minutes').valueOf()) && (moment(classes[i].classDate).valueOf() <= moment(req.body.classDate).add(req.body.duration, 'minutes').valueOf())) {
                conflict = {
                    state: true,
                    type: "classes"
                };
                break;
            }
        }
        if ((days[student.lessonDays] === new Date(req.body.classDate).getDay()) && (new Date(req.body.classDate).getTime() <= moment(moment(req.body.classDate).format("YYYY-MM-DD") + ' ' + student.endTime).valueOf()) && (moment(moment(req.body.classDate).format("YYYY-MM-DD") + ' ' + student.startTime).valueOf() <= moment(req.body.classDate).add(req.body.duration, 'minutes').valueOf())) return res.status(400).send({ message: "There is a conflict with another class", status: "error" });

        if (conflict.state && conflict.type === "classes") return res.status(400).send({ message: "There is a conflict with another class", status: "error" });

        await new Classes({
            userId: req.body.userId,
            studentId: req.body.studentId,
            classDate: req.body.classDate,
            duration: req.body.duration,
            name: student.name,
            startTime: moment(req.body.classDate).format("HH:mm"),
            endTime: moment(req.body.classDate).add(req.body.duration, 'minutes').format("HH:mm"),
            instruments: student.instruments,
            history: [
                { date: "", history: "" },
                { date: "", history: "" },
                { date: "", history: "" },
                { date: "", history: "" }
            ]
        }).save();

        return res.json({ message: `Successfully added that class on ${req.body.classDate}`, status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to add that class for that student", status: "error" });
        console.log(err);
    }
});

module.exports = router;