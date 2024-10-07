const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    timestamp: { type: Date, required: true, default: Date.now },
    // poster: {type: Schema.Types.ObjectId, ref: "User", required: true}
    likes: { type: Number, min: 0, required: true, default: 0 },
    text: { type: String, required: true },
    isRoot: { type: Boolean, required: true },
    comments: {
        type: [Schema.Types.ObjectId], ref: "Comment", validate: {
            validator: function (value) { // if comment is root comment, it accepts comments
                if (this.isRoot === false && value) {
                    return false;
                }
                return true;
            },
            message: "Comment is not root",
        },
    },
});

module.exports = mongoose.model("Comment", CommentSchema)