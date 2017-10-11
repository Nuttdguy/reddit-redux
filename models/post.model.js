const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = Schema({
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    title: {
        type: String,
        required: true
    },
    url: { 
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    subreddit: {
        type: String,
        required: true
    },
    comment: [
        {
            type: Schema.Types.ObjectId,
            required: false
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

PostSchema.pre('save', function(next) {
    let now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
})


let Post = mongoose.model('post', PostSchema);
module.exports = Post;

