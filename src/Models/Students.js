const {
    Schema,
    model
} = require('mongoose');

module.exports = model("students", new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users",
        unique: true
    },
    students: [{
        name: String,
        birthday: String,
        email: String,
        phoneNumber: String,
        instruments: Array,
        lessonDays: String,
        startTime: String,
        endTime: String,
        comment: String,
        history: {
            type: Array,
            default: [
                { date: "", history: "" },
                { date: "", history: "" },
                { date: "", history: "" },
                { date: "", history: "" }
            ]
        },
        credit: {
            type: Number,
            default: 0
        },
        deleted: {
            type: Boolean,
            default: false
        },
        lastDeleted: Date
    }]
}));