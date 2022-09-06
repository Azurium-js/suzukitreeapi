const {
    Schema,
    model
} = require('mongoose');

module.exports = model("classes", new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },
    studentId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    classDate: {
        type: Date,
        requried: true
    },
    duration: {
        type: Number,
        required: true
    },
    name: String,
    startTime: String,
    endTime: String,
    instruments: Array,
    history: {
        type: Array,
        default: [
            { date: "", history: "" },
            { date: "", history: "" },
            { date: "", history: "" },
            { date: "", history: "" }
        ]
    },
    deleted: {
        type: Boolean,
        default: false
    }
}));