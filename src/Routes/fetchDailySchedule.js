const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');
const Classes = require('../Models/Classes');
const moment = require('moment');

const Auth = new authController();

router.route('/fetchDailySchedule').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const days = {
            0: "Sunday",
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday"
        }

        const students = await Students.findOne({ userId: req.body.userId });
        if (!students) return res.status(400).send({ message: "You currently have no students", status: "error" });
        if (req.body.day.length !== 2) return res.status(406).send({ message: "You don't have the required values to fetch the daily schedule", status: "error" });
        const dailySchedule = students.students.filter(student => student.lessonDays === days[Number(req.body.day[0])] && !student.instrument && !student.deleted);
        const classes = await Classes.find({ userId: req.body.userId, deleted: false });
        const filteredClasses = classes.filter(singleClass => (moment(singleClass.classDate).format("YYYY-M-D") == `${new Date(req.body.today).getFullYear()}-${new Date(req.body.today).getMonth() + 1}-${req.body.day[1].slice(1, req.body.day[1].length)}`));
        let sortedDailySchedules = [...filteredClasses, ...dailySchedule];
        sortedDailySchedules = sortedDailySchedules.sort(
            (a, b) => moment(a.startTime, "h:mm a").unix() - moment(b.startTime, "h:mm a").unix()
        );
        return res.json(sortedDailySchedules);
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to find your students' schedules", status: "error" });
        console.log(err);
    }
});

module.exports = router;