const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Students = require('../models/Students');

const Auth = new authController();

router.route('/fetchStudents').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        const students = await Students.findOne({ userId: req.body.userId });
        if (!students) return res.status(400).send({ message: "You currently have no students", status: "error" });
        const notDeletedStudents = students.students.filter(student => student.deleted == false);

        if (req.body?.advancedSearch === "Name") {
            return res.json(notDeletedStudents.filter(student => student.name.toLowerCase().includes(req.body?.searchValue.toLowerCase())));
        } else {
            return res.json(notDeletedStudents);
        }
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to fetch your students", status: "error" });
        console.log(err);
    }
});

module.exports = router;