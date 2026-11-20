const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({

    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    action: {

        type: String,
        required: true
    },

    field: {
        type: String,

    },

    oldValue: {
        type: String,
    },

    newValue: {
        type: String,

    },

    


}, {
    timestamps: true
}


);


const activity = mongoose.model('Activity', activitySchema);
module.exports = activity;