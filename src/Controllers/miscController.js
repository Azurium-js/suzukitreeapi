require('dotenv').config();
const mailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const transporter = mailer.createTransport({
    service: process.env.EMAIL_HOST_SERVICE,
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASS,
    }
});

module.exports = class Misc {
    constructor() {

    }

    limiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 3,
        message: "You are being rate limited, please try again later",
        statusCode: 429
    });

    sendEmail = async (studentEmail, subject, body) => {
        try {
            const email = {
                from: "SOMEONE",
                to: studentEmail,
                subject: subject,
                html: body
            }

            await transporter.sendMail(email);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}