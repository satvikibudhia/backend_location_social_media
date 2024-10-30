const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required.']
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group', // Assuming you have a Group model
        required: [true, 'Group ID is required.']
    },
    img: {
        type: String,
        required: [true, 'Image is required.'],
        validate: {
            validator: function(v) {
                return Buffer.byteLength(v, 'base64') <= 64 * 1024; // Validate base64 size <= 64KB
            },
            message: 'Image size must be less than or equal to 64KB.'
        }
    },
    imgdesc: {
        type: String,
        required: [true, 'Image description is required.']
    },
    likeCounter: {
        type: Number,
        default: 0
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required.']
        },
        comment: {
            type: String,
            required: [true, 'Comment is required.']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Adding indexes for optimization
postSchema.index({ groupId: 1, createdAt: -1 }); // Index for quick retrieval by groupId and date

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
