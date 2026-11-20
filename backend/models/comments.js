const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },

    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }


},{
    timestamps:true
}


);


const comments = mongoose.model('Comments',commentsSchema);
module.exports=comments