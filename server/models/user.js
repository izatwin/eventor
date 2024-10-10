const mongoose = require("mongoose");

const crypto = require("crypto");

const Schema = mongoose.Schema;

const UserCredentialsSchema = new Schema({
    /*
    this.passwordHash = passwordHash;
    this.passwordSalt = randomSalt;
    this.accessTokens = {};
    */

    passwordHash : { type: String, required: true, default : "0" },
    passwordSalt : { type: String, required: true, default : "0" },
    accessTokens : { type: Object, required: true, default : {} },

    // methods : {
    //     init(password) {
    //         let randomSalt = crypto.randomBytes(16).toString('hex'); // generate random salt
            
    //         let derivedKey = crypto.pbkdf2Sync(password, randomSalt, 100000, 64, 'sha512');
    //         let passwordHash = derivedKey.toString('hex');

    //         this.passwordHash = passwordHash;
    //         this.passwordSalt = randomSalt;
    //         this.accessTokens = {};
    //     },

    //     matchPassword(tryPassword) {
    //         let realPasswordHash = this.passwordHash;
    //         let randomSalt = this.passwordSalt;
        
    //         let tryDerivedKey = crypto.pbkdf2Sync(tryPassword, randomSalt, 100000, 64, 'sha512');
    //         let tryPasswordHash = tryDerivedKey.toString('hex');
    //         return realPasswordHash === tryPasswordHash;
    //     },
        
    //     generateAuthToken() {
    //         let token = crypto.randomBytes(48).toString('hex');
        
    //         let lifetime = 60 * 1000;
    //         let nowTime = Date.now();
    //         let expireTime = nowTime + lifetime;
        
    //         let accessTokens = this.accessTokens;
    //         accessTokens[token] = expireTime;
        
    //         return {
    //             'token' : token,
    //             'expire' : expireTime
    //         };
    //     },
    
    //     matchAuthToken(token) {
    //         let accessTokens = this.accessTokens;
        
    //         let expireTime = accessTokens[token];
    //         if (expireTime == null) {
    //             return false;
    //         }
        
    //         let nowTime = Date.now();
    //         return (nowTime <= expireTime);
    //     }
    // }
}, { _id : false });

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
    console.log("Access Tokens: ");
    console.log(accessTokens);
    accessTokens[token] = expireTime;
    console.log("Token: " + token);
    console.log("Match: " + accessTokens[token]);

    return {
        'token' : token,
        'expire' : expireTime
    };
},

UserCredentialsSchema.methods.matchAuthToken = function (token) {
    console.log("Looking for token: " + token);

    let accessTokens = this.accessTokens;
    console.log("Access Tokens: ");
    console.log(accessTokens);

    let expireTime = accessTokens[token];
    if (expireTime == null) {
        console.log("Token not found!");
        return false;
    }

    let nowTime = Date.now();

    console.log(nowTime <= expireTime);

    return (nowTime <= expireTime);
}

const UserSchema = new Schema({
    /*
    userId : string;
    userName : string;
    email : string;
    displayName : string;

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
    // userName: { type: string, required: true, default: "UNDEF" },
    email : { type: String, required: true, default: "UNDEF" },
    // displayName : { type: string, required: true, default: "UNDEF" },

    userCredentials : UserCredentialsSchema,
    posts : [{ type: Schema.Types.ObjectId, ref: "Post", required: false }]
    
    // user : {type: User, required: true}
});

UserSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.userId = _id;
    return object;
});

// Virtual for user's URL
UserSchema.virtual("url").get(function () {
    return `/users/${this._id}`
});

module.exports = mongoose.model("User", UserSchema)