const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    timestamp: { type: Date, required: true, default: Date.now },
    user: {type: String, ref: "User", required: true},
    views: { type: Number, min: 0, required: true, default: 0 },
    shares: { type: Number, min: 0, required: true, default: 0 },
    likes: { type: Number, min: 0, required: true, default: 0 },
    content: { type: String, required: true },
    is_event: { type: Boolean, required: true },
    // event: {type: Schema.Types.ObjectId, ref: "Event"},
    commentsEnabled: { type: Boolean, required: true, default: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: false }]
});

// Virtual for post's URL
PostSchema.virtual("url").get(function () {
    return `/posts/${this._id}`
});

module.exports = mongoose.model("Post", PostSchema)