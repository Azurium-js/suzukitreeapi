const {
    Schema,
    model
} = require('mongoose');

module.exports = model("history", new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },
    studentId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    grandTotal: Number,
    lessons: Number,
    lessonDuration: Number,
    lessonPrice: Number,
    rentalInstrument: String,
    rentalFee: Number,
    specialDesc: String,
    specialFee: Number,
    lessonTransaction: String,
    transaction: String,
    type: String,
    date: Date
}));