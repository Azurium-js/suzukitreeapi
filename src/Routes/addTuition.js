const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const Tuitions = require('../models/Tuitions');

const Auth = new authController();

router.route('/addTuition').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id to create a tuition for", status: "error" });
        const tuition = await Tuitions.findOne({ userId: req.body.userId, studentId: req.body.studentId });

        if (!req.body.body || !req.body.subject || !req.body.type) return res.status(406).send({ message: "There is no body, subject, and/or type data", status: "error" });
        const keys = {
            "Lessons": "lessons",
            "Lesson duration": "lessonDuration",
            "Lesson price": "lessonPrice",
            "Rental instrument": "rentalInstrument",
            "Rental fee": "rentalFee",
            "Other expenses": "specialDesc",
            "Other fees": "specialFee"
        };

        if (req.body.type === "number" && isNaN(new Number(req.body.body))) return res.status(406).send({ message: "Body is supposed to be number but gave string", status: "error" });
        if (tuition) {
            if (tuition.deleted === true) return res.status(401).send({ message: "The tuition for this student is deleted", status: "error" });
            await tuition.updateOne({
                [keys[req.body.subject]]: (req.body.type === "string" ? req.body.body : new Number(req.body.body))
            });
        } else {
            await new Tuitions({
                userId: req.body.userId,
                studentId: req.body.studentId,
                [keys[req.body.subject]]: (req.body.type === "string" ? req.body.body : new Number(req.body.body))
            }).save();
        }

        return res.json({ message: "Successfully created/updated that student's tuition", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to create/update that student's tuition", status: "error" });
        console.log(err);
    }
});

module.exports = router;