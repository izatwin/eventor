#! /user/bin/env node

const Post = require("./models/post");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = "mongodb://127.0.0.1/my_database";

main().catch((err) => console.log(err));


async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected");

    await postCreate();
    console.log("Debug: Closing database");
    mongoose.connection.close();
}

async function postCreate() {
    const postdetail = {
        views: 5,
        shares: 1,
        content: "TestContent",
        event: false,
        commentsEnabled: true
    };
    const post = Post(postdetail);
    await post.save()

    console.log(`Added post: ${post}`)
}