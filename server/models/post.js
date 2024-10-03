const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    timestamp: { type: Date, required: true },
    // posters: [{type: Schema.Types.ObjectId, ref: "User", required: true}] We will add this when the User class is created
    views: { type: Number, min: 0, required: true, default: 0 },
    shares: { type: Number, min: 0, required: true, default: 0 },
    likes: { type: Number, min: 0, required: true, default: 0},
    content: { type: String, required: true },
    event: { type: Boolean, required: true },
    commentsEnabled: { type: Boolean, required: true, default: true },
    // comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: false}] We will add this when the Comment class is created
});

// Virtual for post's URL
PostSchema.virtual("url").get(function () {
    return `/posts/${this._id}`
});

module.exports = mongoose.model("Post", PostSchema)