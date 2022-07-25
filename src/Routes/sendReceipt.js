const moment = require('moment');
const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const miscController = require('../Controllers/miscController');
const Students = require('../models/Students');
const Tuitions = require('../models/Tuitions');
const History = require('../models/History');

const Auth = new authController();
const Misc = new miscController();

router.route('/sendReceipt').post(Auth.authenticateToken, async function (req, res) {
    try {
        if (!req.body.userId) return res.status(406).send({ message: "There is no user/teacher id", status: "error" });
        if (!req.body.studentId) return res.status(406).send({ message: "There is no student id to create a tuition for", status: "error" });
        const teacher = await Students.findOne({ userId: req.body.userId });
        const student = teacher.students.filter(student => student._id == req.body.studentId)[0];
        const tuition = await Tuitions.findOne({ userId: req.body.userId, studentId: req.body.studentId });
        if (tuition.deleted === true) return res.status(401).send({ message: "The tuition for this student is deleted", status: "error" });
        if (!tuition?.lessons || !tuition?.lessonPrice) return res.status(406).send({ message: "You need to have the lesson amount, duration, and price fields to send an invoice", status: "error" });

        if (req.body.task) {
            const email = await Misc.sendEmail(
                student.email,
                "RECEIPT",
                `<h2>
                <b>${student?.name !== "" ? student.name : "Anonymous"}'s Receipt</b>
            </h2>
            <br />
            Date: ${moment().format("MM-DD-YYYY")}
            <br />
            <br />
            <b>Name of student: </b>${student?.name !== "" ? student.name : "Anonymous"}
            <br />
            <br />
            Suzuki 
            ${student?.instruments.length > 1
                    ? student.instruments.map(
                        (instrument) =>
                            `${instrument} ${(
                                student.instruments.length === 0 ? "" : "&"
                            )}`
                    )
                    : student.instruments[0]
                }
            ${student?.instruments.length > 1 ? "Classes: " : "Class: "}
            ${tuition?.lessonPrice && tuition?.lessons
                    ? `$${tuition.lessonPrice} / ${tuition.lessons} lessons ($${tuition.lessonPrice * tuition.lessons})`
                    : "This student doesn't have a lesseon price or lesson amount"
                }
            <br />
            <br />
            ${tuition?.lessons && student?.lessonDays
                    ? `Lessons on ${student?.lessonDays ? student.lessonDays : "???"} from ${moment(`2000-01-20T${student.startTime}`).format("hh:mm a")} 
                    to ${moment(`2000-01-20T${student.endTime}`).format("hh:mm a")} (${tuition.lessons})`
                    : "This student doesn't have a lesson day or lesson amount"
                }
            <br />
            <br />
            ${tuition?.rentalInstrument && tuition?.rentalFee
                    ? `Renting a ${tuition.rentalInstrument} for $${tuition.rentalFee}`
                    : ""
                }
            ${(tuition?.rentalInstrument && tuition?.rentalFee ? (
                    `
                    <br></br>
                    <br />
                `
                ) : (
                    ""
                ))}
            ${tuition?.specialDesc && tuition?.specialFee
                    ? `${tuition.specialDesc} for $${tuition.specialFee}`
                    : ""
                }
            ${tuition?.specialDesc && tuition?.specialFee ? (
                    `
                    <br></br>
                    <br />
                `
                ) : (
                    ""
                )}
            <b>Grand Total: $${(tuition?.lessons && tuition?.lessonPrice
                    ? tuition.lessons * tuition.lessonPrice
                    : 0) +
                (tuition?.rentalFee ? tuition.rentalFee : 0) +
                (tuition?.specialFee ? tuition.specialFee : 0)}
            </b>
            <br />
            <br />
            ** Other than emergency or illness, the change has to inform one day
            advance to reschedule the class.
            <br />
            <b>
              Please kindly inform our studio at least one day in advance to
              reschedule the class.
            </b>
            <br />
            <br />
            ** The Music Studio is not responsible for any personal injury,
            accident, or damage to personal property of any people occuring on the
            premises of the studio/house.
            <br />
            <br />
            Thank You for choosing The Music Studio!
            <br />
            <br />
            <b>The Music Studio</b>
            <br />
            <b>447 NW 156th Lane</b>
            <br />
            <b>Pembroke Pines FL 33028</b>
            <br />
            <u>elleymusicstudio@gmail.com</u>
            <br />
            <b>786-374-5886</b>`
            );
            if (!email) return res.status(500).send({ message: "There was something wrong while trying to send that student their invoice", status: "error" });
        }
        
        await new History({
            userId: req.body.userId,
            studentId: req.body.studentId,
            grandTotal: (tuition?.lessons && tuition?.lessonPrice ? tuition.lessons * tuition.lessonPrice : 0) + (tuition?.rentalFee ? tuition.rentalFee : 0) +
                (tuition?.specialFee ? tuition.specialFee : 0),
            lessons: tuition.lessons,
            lessonDuration: tuition.lessonDuration,
            lessonPrice: tuition.lessonPrice,
            rentalInstrument: tuition.rentalInstrument,
            rentalFee: tuition.rentalFee,
            specialDesc: tuition.specialDesc,
            specialFee: tuition.specialFee,
            date: new Date(),
            type: "receipt"
        }).save();

        student.credit += tuition?.lessons;
        await teacher.save();

        await new History({
            userId: req.body.userId,
            studentId: req.body.studentId,
            lessons: student.credit,
            lessonTransaction: "+" + tuition.lessons.toString(),
            transaction: "Receipt",
            date: new Date(),
            type: "lessons"
        }).save();

        return res.json({ message: req.body.task ? "Successfully sent the tuition to the corresponding student's email address" : "Successfully logged receipt", status: "success" });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong while trying to send the tuition to this student's email", status: "error" });
        console.log(err);
    }
});

module.exports = router;