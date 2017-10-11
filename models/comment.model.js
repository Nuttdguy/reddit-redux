const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CommentSchema = Schema({
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    commentAuthor: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }
    ],
    content: {
        type: String
    }
})


CommentSchema.pre('save', function(next) {
    let now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
})


let Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment;

