const mongoose = require("mongoose");

const crypto = require("crypto");

const Schema = mongoose.Schema;

const UserCredentialsSchema = new Schema({
    passwordHash: { type: String, required: true, default: "0" },
    passwordSalt: { type: String, required: true, default: "0" },
    accessTokens: { type: Object, required: true, default: {} },

}, { _id: false });

UserCredentialsSchema.methods.initCredentials = function (password) {
    let randomSalt = crypto.randomBytes(16).toString('hex'); // generate random salt

    let derivedKey = crypto.pbkdf2Sync(password, randomSalt, 100000, 64, 'sha512');
    let passwordHash = derivedKey.toString('hex');

    this.passwordHash = passwordHash;
    this.passwordSalt = randomSalt;
    this.accessTokens = {};
},

    UserCredentialsSchema.methods.matchPassword = function (tryPassword) {
        let realPasswordHash = this.passwordHash;
        let randomSalt = this.passwordSalt;

        let tryDerivedKey = crypto.pbkdf2Sync(tryPassword, randomSalt, 100000, 64, 'sha512');
        let tryPasswordHash = tryDerivedKey.toString('hex');
        return realPasswordHash === tryPasswordHash;
    },

    UserCredentialsSchema.methods.generateAuthToken = function () {
        let token = crypto.randomBytes(48).toString('hex');

        let lifetime = 6000 * 1000;
        let nowTime = Date.now();
        let expireTime = nowTime + lifetime;

        let accessTokens = this.accessTokens;
        accessTokens[token] = expireTime;

        return {
            'token': token,
            'expire': expireTime
        };
    },

    UserCredentialsSchema.methods.matchAuthToken = function (token) {
        let accessTokens = this.accessTokens;

        let expireTime = accessTokens[token];
        if (expireTime == null) {
            console.log("Token not found!");
            return false;
        }

        let nowTime = Date.now();

        return (nowTime <= expireTime);
    }

UserCredentialsSchema.methods.removeAuthToken = function (token) {
    let accessTokens = this.accessTokens;
    accessTokens[token] = null;
}

const NotificationSchema = new Schema({
    timestamp: { type: Number, required: true },
    postId: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
}, { _id: false });

const NotificationOptInSchema = new Schema({
    status: { type: String, required: true, enum: ["None", "Posts", "Events"], default: "None" },
    timestamp: { type: Date, required: true, default: Date.now }
}, { _id: false });

const UserSchema = new Schema({
    /*

    followers : string[];
    following : string[];
    posts : string[];
    interestPosts : string[];
    blockedUsers : string[];
    likedPosts : string[];
    likedComments : string[];

    credentials : UserCredentials;
    profileInfo : UserProfileInfo;
    lastSearch : UserSearchFilter | undefined;
    notifications : UserNotification[];
    notificationOptIns : UserNotificationOptIn[];
    */

    _id: { type: String, required: true, default: crypto.randomUUID },
    userName: { type: String, required: true, default: "UNDEF" },
    email: { type: String, required: true, default: "UNDEF" },
    displayName: { type: String, required: true, default: "UNDEF" },

    userCredentials: UserCredentialsSchema,
    posts: [{ type: Schema.Types.ObjectId, ref: "Post", required: false }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post", required: false }],
    likedComments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: false }],

    followers: [{ type: Schema.Types.String, ref: "User", required: false }],
    following: [{ type: Schema.Types.String, ref: "User", required: false }],
    blockedUsers: [{ type: Schema.Types.String, ref: "User", required: false }],

    biography: {type: String},
    status: {type: String},
    imageURL: {type: String},

    notifications: [NotificationSchema],
    notificationOptIns: { type: Map, default: {} }
});

UserSchema.methods.getInfoForClient = function () {
    let infoForClient = {};

    infoForClient.email = this.email;
    infoForClient.userId = this._id;
    infoForClient.userName = this.userName;
    infoForClient.displayName = this.displayName;
    infoForClient.biography = this.biography;
    infoForClient.status = this.status;
    infoForClient.imageURL = this.imageURL;
    infoForClient.posts = this.posts;
    infoForClient.likedPosts = this.likedPosts;
    infoForClient.likedComments = this.likedComments;
    infoForClient.blockedUsers = this.blockedUsers;
    infoForClient.following = this.following

    return infoForClient;
}

// Virtual for user's URL
UserSchema.virtual("url").get(function () {
    return `/users/${this._id}`
});


module.exports = mongoose.model("User", UserSchema)