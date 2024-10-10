const crypto = require("crypto");

/*
    What information do we need BEFORE we create an account for a user?
    - email : string
    - username : string
    - credentials : {
        passwordHash : string,
        passwordSalt : string
    }
    
    What information do we generate for the user on account creation?
    - userId

    All remaning data is loaded blankly.
 */

class UserCredentials {
  constructor(password) {
    let randomSalt = crypto.randomBytes(16).toString('hex'); // generate random salt

    let derivedKey = crypto.pbkdf2Sync(password, randomSalt, 100000, 64, 'sha512');
    let passwordHash = derivedKey.toString('hex');

    this.passwordHash = passwordHash;
    this.passwordSalt = randomSalt;
    this.accessTokens = {};
  }

  matchPassword(tryPassword) {
    let realPasswordHash = this.passwordHash;
    let randomSalt = this.passwordSalt;

    let tryDerivedKey = crypto.pbkdf2Sync(tryPassword, randomSalt, 100000, 64, 'sha512');
    let tryPasswordHash = tryDerivedKey.toString('hex');
    return realPasswordHash === tryPasswordHash;
  }

  generateAuthToken() {
    let token = crypto.randomBytes(48).toString('hex');

    let lifetime = 60 * 1000;
    let nowTime = Date.now();
    let expireTime = nowTime + lifetime;

    let accessTokens = this.accessTokens;
    accessTokens[token] = expireTime;

    return {
      'token' : token,
      'expire' : expireTime
    };
  }

  matchAuthToken(token) {
    let accessTokens = this.accessTokens;

    let expireTime = accessTokens[token];
    if (expireTime == null) {
      return false;
    }

    let nowTime = Date.now();
    return (nowTime <= expireTime);
  }
}

class UserProfileInfo {
  /*
  pfp : string;
  bio : string;
  status : string;
  */
  constructor() {
    this.pfp = "";
    this.bio = "";
    this.status = "";
  }
}

class UserSearchFilter {
  /*
  location : string;
  time : number;
  interestTags : string[];
  */

}

class UserNotification {
  /*
  postUuid : string;
  read : boolean;
  */

}

const NotificationFilter = Object.freeze({
  ALL: "all",
  EVENTS_ONLY: "events_only"
});

class UserNotificationOptIn {
  /*
  userId : string;
  notificationFilter : NotificationFilter;
  */


}

class User {
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

  constructor(email, userName, password) {
    let userId = crypto.randomUUID();

    this.userId = userId;
    this.userName = userName;
    this.email = email;
    this.displayName = userName;

    this.followers = {};
    this.following = {};
    this.posts = {};
    this.interestPosts = {};
    this.blockedUsers = {};
    this.likedPosts = {};
    this.likedComments = {};

    this.credentials = new UserCredentials(password);
    this.profileInfo = new UserProfileInfo();
    this.lastSearch = undefined;
    this.notifications = {};
    this.notificationOptIns = {};
  }
}

module.exports = {User};