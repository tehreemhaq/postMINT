const mongoose = require('mongoose')


const likeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",       // reference to post model
        required: true
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",     // reference to user model
        required: true

    }
} , {timestamps: true})


module.exports = mongoose.model('Like', likeSchema)