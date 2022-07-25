const {
    Schema,
    model
} = require('mongoose');

module.exports = model("tuitions", new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },
    studentId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    lessons: Number,
    lessonDuration: Number,
    lessonPrice: Number,
    rentalInstrument: String,
    rentalFee: Number,
    specialDesc: String,
    specialFee: Number,
    deleted: {
        type: Boolean,
        default: false
    }
}));