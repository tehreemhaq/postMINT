const mongoose = require('mongoose')


const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",       // reference to author (in out case it is only admin) model
        required: true,
        
    }
    
  } , { timestamps: true });


module.exports = mongoose.model('Post', postSchema)