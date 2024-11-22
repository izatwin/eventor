const User = require("../models/user")
const Post = require("../models/post")
const Common = require(`./common.controller`)
const crypto = require("crypto");

const sendmail = require("../modules/sendmail.js");
const textfilter = require("../modules/textfilter.js");

var emailVerifications = {};
class verificationStatus {
    constructor(verifyCode) {
        this.verifyId = crypto.randomBytes(24).toString('hex');
        this.verifyCode = verifyCode;
        this.isVerified = false;
        this.expiration = Date.now() + (10 * 60 * 1000);
    }

    isExpired() {
        let expired = (Date.now() > this.expiration);
        return expired;
    }
}

exports.isLoggedIn = async (req, res) => {
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            let myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        res.send({ "logged-in": true, "user-info": myUser.getInfoForClient() });
                        return;
                    }
                }
            }
        }
    }
    res.send({ "logged-in": false });
}

exports.isValidAccountEmail = async (req, res) => {
    if (!req.params) {
        res.status(400).send({
            message: "Request params cannot be empty."
        });
        return;
    }

    let email = req.params.email;
    if (!email) {
        res.status(400).send({
            message: "Email body field required."
        });
        return;
    }
    // TODO sanity checks (type, format)

    // TODO get user from email?!
    const myUser = await User.findOne({ "email": email }).exec();
    if (myUser) {
        res.send({ "exists": true });
        return;
    }
    res.send({ "exists": false });
}

exports.beginVerification = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Request body cannot be empty."
        });
        return;
    }

    let email = req.body.email;
    if (!email) {
        res.status(400).send({
            message: "Email required for verification."
        });
        return;
    }

    // TODO sanity check email

    let verificationCode = sendmail.doVerificationRequest(email);

    let myVerificationStatus = new verificationStatus(verificationCode);
    emailVerifications[email] = myVerificationStatus;

    let verifyId = myVerificationStatus.verifyId;
    res.send({ "verifyId": verifyId });
}

exports.verifyEmail = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Request body cannot be empty."
        });
        return;
    }

    let email = req.body.email;
    let verifyId = req.body.verifyId;
    let verifyCode = req.body.verifyCode;
    if (!(email && verifyId && verifyCode)) {
        res.status(400).send({
            message: "Missing required param(s) for verification."
        });
        return;
    }

    let myVerificationStatus = emailVerifications[email];
    if (!myVerificationStatus) {
        res.status(400).send({
            message: "Verification process not initialized."
        });
        return;
    }
    if (!(myVerificationStatus.verifyId === verifyId)) {
        res.status(400).send({
            message: "Invalid verify Id."
        });
        return;
    }
    if (myVerificationStatus.isVerified) {
        res.status(400).send({
            message: "Already verified!"
        });
        return;
    }
    if (myVerificationStatus.isExpired()) {
        res.status(498).send({
            message: "Verify Id expired, please restart process."
        });
        return;
    }

    let realVerifyCode = myVerificationStatus.verifyCode;
    if (!(verifyCode === realVerifyCode)) {
        res.status(401).send({
            message: "Incorrect verification code."
        });
        return;
    }

    myVerificationStatus.isVerified = true;
    res.status(200).send({
        message: "Verified!"
    });
}

// Create and save a new User account
exports.signup = async (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "User cannot be empty."
        });
        return;
    }

    let email = req.body.email;
    let password = req.body.password;
    let verifyId = req.body.verifyId;
    let userName = req.body.userName;
    let displayName = req.body.displayName || userName;
    if (!(email && password && verifyId && userName)) {
        res.status(400).send({
            message: "Missing param(s) for User creation."
        });
        return;
    }
    // TODO sanity checks (type, format)

    // Check for profanity
    if (textfilter.containsProfanity(userName)) {
        res.status(422).json({ message: "UserName contains profanity." });
        return;
    }
    if (textfilter.containsProfanity(displayName)) {
        res.status(422).json({ message:  "DisplayName contains profanity." });
        return;
    }

    let myVerificationStatus = emailVerifications[email];
    if (!myVerificationStatus) {
        res.status(400).send({
            message: "Verification process not initialized."
        });
        return;
    }
    if (!(myVerificationStatus.verifyId === verifyId)) {
        res.status(400).send({
            message: "Invalid verify Id."
        });
        return;
    }
    if (!myVerificationStatus.isVerified) {
        res.status(400).send({
            message: "Not yet verified!"
        });
        return;
    }
    if (myVerificationStatus.isExpired()) {
        res.status(498).send({
            message: "Verify Id expired, please restart process."
        });
        return;
    }

    // Make sure user doesn't already exist in the database with same email or username
    const existingUser = await User.findOne({ "email": email }).exec();
    if (existingUser) {
        res.status(409).send({
            topic: "email",
            message: "Email already taken!"
        });
        return;
    }
    const existingUser2 = await User.findOne({ "userName": userName }).exec();
    if (existingUser2) {
        res.status(409).send({
            topic: "userName",
            message: "Username already taken!"
        });
        return;
    }

    emailVerifications[email] = null;

    // create user
    const newUser = new User({
        email: email,
        userName: userName,
        displayName: displayName,
        userCredentials: {}
    });

    let userCredentials = newUser.userCredentials;
    userCredentials.initCredentials(password);

    let authToken = userCredentials.generateAuthToken();

    res.cookie("user_id", newUser._id, { sameSite: 'None', secure: true })
    res.cookie("auth_token", authToken.token, { expire: authToken.expire, sameSite: 'None', secure: true })

    sendmail.doConfirmationMesssage(email, userName);

    newUser.save(newUser)
        .then(data => {
            res.status(200).send(data.getInfoForClient());
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
};

// Log in to an existing account (receive an auth token in the form of a cookie)
exports.login = async (req, res) => {
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            let myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        res.status(400).send({
                            message: "Already logged in."
                        });
                        return;
                    }
                }
            }
        }
    }

    if (!req.body) {
        res.status(400).send({
            message: "User cannot be empty."
        });
        return;
    }
    
    let email = req.body.email;
    let password = req.body.password;
    if (!(email && password)) {
        res.status(400).send({
            message: "Missing param(s) for User creation."
        });
        return;
    }
    // TODO sanity checks (type, format)

    // get user from email
    const myUser = await User.findOne({ "email": email }).exec();
    if (!myUser) {
        res.status(409).send({
            topic: "email",
            message: "Invalid email!"
        });
        return;
    }

    const userCredentials = myUser.userCredentials;

    if (!userCredentials.matchPassword(password)) {
        res.status(409).send({
            topic: "password",
            message: "Invalid password!"
        });
        return;
    }

    let authToken = userCredentials.generateAuthToken();
    myUser.markModified('userCredentials.accessTokens');

    res.cookie("user_id", myUser._id, { sameSite: 'Strict', secure: false })
    res.cookie("auth_token", authToken.token, { expire: authToken.expire, sameSite: 'Strict', secure: false })

    myUser.save(myUser)
        .then(data => {
            res.status(200).send(data.getInfoForClient());
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
};

exports.resetPassword = async (req, res) => {
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            let myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        res.status(400).send({
                            message: "Already logged in."
                        });
                        return;
                    }
                }
            }
        }
    }

    if (!req.body) {
        res.status(400).send({
            message: "User cannot be empty."
        });
        return;
    }

    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let verifyId = req.body.verifyId;
    if (!(email && newPassword && verifyId)) {
        res.status(400).send({
            message: "Missing param(s) for password reset."
        });
        return;
    }
    // TODO sanity checks (type, format)

    let myVerificationStatus = emailVerifications[email];
    if (!myVerificationStatus) {
        res.status(400).send({
            message: "Verification process not initialized."
        });
        return;
    }
    if (!(myVerificationStatus.verifyId === verifyId)) {
        res.status(400).send({
            message: "Invalid verify Id."
        });
        return;
    }
    if (!myVerificationStatus.isVerified) {
        res.status(400).send({
            message: "Not yet verified!"
        });
        return;
    }
    if (myVerificationStatus.isExpired()) {
        res.status(498).send({
            message: "Verify Id expired, please restart process."
        });
        return;
    }
    emailVerifications[email] = null;

    // TODO get user from email?!
    const myUser = await User.findOne({ "email": email }).exec();
    if (!myUser) {
        res.status(400).send({
            message: "Invalid email!"
        });
        return;
    }

    const userCredentials = myUser.userCredentials;
    userCredentials.initCredentials(newPassword);

    let authToken = userCredentials.generateAuthToken();
    myUser.markModified('userCredentials.accessTokens');

    res.cookie("user_id", myUser._id, { sameSite: 'None', secure: true })
    res.cookie("auth_token", authToken.token, { expire: authToken.expire, sameSite: 'None', secure: true })

    myUser.save(myUser)
        .then(data => {
            res.status(200).send(data.getInfoForClient());
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
};

exports.resetPasswordLoggedIn = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        res.status(400).send({
            message: "Not logged in!"
        });
        return;
    }

    if (!req.body) {
        res.status(400).send({
            message: "User cannot be empty."
        });
        return;
    }

    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    if (!(oldPassword && newPassword)) {
        res.status(400).send({
            message: "Missing param(s) for password reset."
        });
        return;
    }
    // TODO sanity checks (type, format)

    const userCredentials = myUser.userCredentials;
    if (!userCredentials.matchPassword(oldPassword)) {
        res.status(401).send({
            message: "Invalid old password!"
        });
        return;
    }

    userCredentials.initCredentials(newPassword);

    let authToken = userCredentials.generateAuthToken();
    myUser.markModified('userCredentials.accessTokens');

    res.cookie("user_id", myUser._id, { sameSite: 'None', secure: true })
    res.cookie("auth_token", authToken.token, { expire: authToken.expire, sameSite: 'None', secure: true })

    myUser.save(myUser)
        .then(data => {
            res.status(200).send(data.getInfoForClient());
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
};

exports.logout = async (req, res) => {
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            let myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        res.clearCookie("user_id");
                        res.clearCookie("auth_token");

                        userCredentials.removeAuthToken(auth_token);
                        myUser.markModified('userCredentials.accessTokens');

                        res.status(200).send({
                            message: "Logged out!"
                        });

                        return;
                    }
                }
            }
        }
    }

    res.status(400).send({
        message: "Not logged in!"
    });
}

exports.updateUsername = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        res.status(400).send({
            message: "Not logged in!"
        });
        return;
    }

    if (!req.body) {
        return res.status(400).send({
            message: "Body for updating username must not be empty."
        });
    }

    let newUsername = req.body.newUsername;
    if (!(newUsername)) {
        res.status(400).send({
            message: "Missing newUsername param for password reset."
        });
        return;
    }

    // Profanity Filter
    if (textfilter.containsProfanity(newUsername)) {
        res.status(422).json({ message:  "UserName contains profanity." });
        return;
    }

    const existingUser = await User.findOne({ "userName": newUsername }).exec();
    if (existingUser) {
        res.status(409).send({
            topic: "userName",
            message: "Username already taken!"
        });
        return;
    }

    myUser.userName = newUsername;

    myUser.save(myUser)
        .then(data => {
            res.status(200).send(data.getInfoForClient());
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
}

exports.updateDisplayName = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        res.status(400).send({
            message: "Not logged in!"
        });
        return;
    }

    if (!req.body) {
        return res.status(400).send({
            message: "Body for updating username must not be empty."
        });
    }

    let newDisplay = req.body.newDisplay;
    if (!(newDisplay)) {
        res.status(400).send({
            message: "Missing newDisplay param for password reset."
        });
        return;
    }

    // Profanity Filter
    if (textfilter.containsProfanity(newDisplay)) {
        res.status(422).json({ message:  "DisplayName contains profanity." });
        return;
    }

    myUser.displayName = newDisplay;

    myUser.save(myUser)
        .then(data => {
            res.status(200).send(data.getInfoForClient());
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
}

exports.findAllPosts = (req, res) => {
    const userId = req.params.id;

    User.findById(userId)
        .then(data => {
            if (!data)
                return res.status(404).send({ message: `User with userID=${userId} not found.` })
            else res.send(data.posts);
        })
        .catch(err => {
            return res.status(500).send({
                message: "Error retrieving posts",
                error: err.message
            })
        })
}

exports.setBiography = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Body for setting biography must not be empty."
        });
    }

    const userId = req.params.id
    try {
        const curUser = await User.findById(userId).exec()
        if (!curUser) {
            return res.status(404).send({ message: `Cannot find user with id=${userId}` })
        }

        if (req.body.biography) {
            // Profanity Filtering
            if (textfilter.containsProfanity(req.body.biography)) {
                res.status(422).json({ message:  "Biography contains profanity." });
                return;
            }

            curUser.biography = req.body.biography
            curUser.save()
            return res.send({ user: curUser.getInfoForClient() })
        } else {
            return res.status(400).send({ message: "Please send a biography to update." })
        }
    } catch (err) {
        return res.status(500).send({ message: `Error setting biography`, error: err })
    }
}

exports.setStatus = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Body for setting status must not be empty."
        });
    }

    const userId = req.params.id
    try {
        const curUser = await User.findById(userId).exec()
        if (!curUser) {
            return res.status(404).send({ message: `Cannot find user with id=${userId}` })
        }

        if (req.body.status) {
            // Profanity Filtering
            if (textfilter.containsProfanity(req.body.status)) {
                res.status(422).json({ message:  "Biography contains profanity." });
                return;
            }

            curUser.status = req.body.status
            curUser.save()
            return res.send({ user: curUser.getInfoForClient() })
        } else {
            return res.status(400).send({ message: "Please send a status to update." })
        }
    } catch (err) {
        return res.status(500).send({ message: `Error setting status`, error: err })
    }
}

exports.setImage = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Body for setting imageURL must not be empty."
        });
    }

    const userId = req.params.id
    try {
        const curUser = await User.findById(userId).exec()
        if (!curUser) {
            return res.status(404).send({ message: `Cannot find user with id=${userId}` })
        }

        if (req.body.imageURL) {
            curUser.imageURL = req.body.imageURL
            curUser.save()
            return res.send({ user: curUser.getInfoForClient() })
        } else {
            return res.status(400).send({ message: "Please send a picture url to update." })
        }
    } catch (err) {
        return res.status(500).send({ message: `Error setting picture url`, error: err })
    }
}

exports.delete = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        res.status(400).send({
            message: "Not logged in!"
        });
        return;
    }

    if (!req.body) {
        res.status(400).send({
            message: "User cannot be empty."
        });
        return;
    }

    let password = req.body.password;
    if (!(password)) {
        res.status(400).send({
            message: "Missing param(s) for password."
        });
        return;
    }

    const userCredentials = myUser.userCredentials;
    if (!userCredentials.matchPassword(password)) {
        res.status(401).send({
            message: "Invalid password!"
        });
        return;
    }

    try {
        for (let curPostId of myUser.posts) {
            await Post.findByIdAndDelete(curPostId).exec()
        }

        await User.findByIdAndDelete(myUser._id)
        return res.send({ message: "User deleted!" })
    } catch (err) {
        return res.status(500).send({
            message: "Error deleting User",
            error: err.message || "Unexpected Error"
        })
    }
}

// Follow a user
exports.followUser = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    console.log("Handler for Follow User", req.path);

    // Authenticate the user
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const userToFollowId = req.body.userId;
    if (!userToFollowId) {
        return res.status(400).send({
            message: "Missing userId to follow."
        });
    }

    try {
        const userToFollow = await User.findById(userToFollowId);
        if (!userToFollow) {
            return res.status(404).send({ message: `User with id=${userToFollowId} not found.` });
        }


        // Check if either user is blocking the other
        var isBlockingThem = false
        var isBlockedByThem = false
        if (typeof myUser.blockedUsers !== 'undefined') {
            isBlockingThem = myUser.blockedUsers.includes(userToFollowId);
        }

        if (typeof userToFollow.blockedUsers !== 'undefined') {
            isBlockedByThem = userToFollow.blockedUsers.includes(myUser._id);
        }

        if (isBlockingThem || isBlockedByThem) {
            return res.status(403).send({
                message: "Cannot follow a user who you have blocked or who has blocked you."
            });
        }

        // Follow the user if not already following
        if (!myUser.following.includes(userToFollowId)) {
            myUser.following.push(userToFollowId);
            userToFollow.followers.push(myUser._id);

            if (!myUser.notificationOptIns.has(userToFollowId)) {
                myUser.notificationOptIns.set(userToFollowId, {
                    status: "None",
                    timestamp: new Date()
                });
            }

            await myUser.save();
            await userToFollow.save();
            return res.status(200).send({ message: `Following user with id=${userToFollowId}` });
        } else {
            return res.status(400).send({ message: "Already following this user." });
        }
    } catch (err) {
        return res.status(500).send({
            message: "Error occurred while following user",
            error: err.message
        });
    }
}

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const userToUnfollowId = req.body.userId;
    if (!userToUnfollowId) {
        return res.status(400).send({
            message: "Missing userId to unfollow."
        });
    }

    try {
        const userToUnfollow = await User.findById(userToUnfollowId);
        if (!userToUnfollow) {
            return res.status(404).send({ message: `User with id=${userToUnfollowId} not found.` });
        }

        if (myUser.following.includes(userToUnfollowId)) {
            myUser.following.pull(userToUnfollowId);
            userToUnfollow.followers.pull(myUser._id);

            myUser.notificationOptIns.delete(userToUnfollowId);

            await myUser.save();
            await userToUnfollow.save();
            return res.status(200).send({ message: `Unfollowed user with id=${userToUnfollowId}` });
        } else {
            return res.status(400).send({ message: "Not following this user." });
        }
    } catch (err) {
        return res.status(500).send({
            message: "Error occurred while unfollowing user",
            error: err.message
        });
    }
}

// Find user by id
exports.findById = (req, res) => {
    const id = req.params.id;
    
    User.findById(id).select('_id displayName userName biography status imageURL followers following')
        .then(data => {
            if (!data) {
                return res.status(404).send({ message: `FindById: User not found with id=${id}` });
            }

            res.send(data);
        })
        .catch(err => {
            return res.status(500).send({
                message: `Error retrieving user with id=${id}`,
                error: err.message || 'Unexpected Error'
            }
            );
        });
};

// Block or Unblock a user
exports.toggleBlockUser = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const userToBlockId = req.body.userId;
    const block = req.body.block; // boolean indicating block or unblock
    if (!userToBlockId) {
        return res.status(400).send({
            message: "Missing userId to block/unblock."
        });
    }

    try {
        const userToBlock = await User.findById(userToBlockId);
        if (!userToBlock) {
            return res.status(404).send({ message: `User with id=${userToBlockId} not found.` });
        }

        const isAlreadyBlocking = myUser.blockedUsers.includes(userToBlockId) || false;

        if (block && !isAlreadyBlocking) {
            // Block user
            myUser.blockedUsers.push(userToBlockId);
            // Unfollow operations
            myUser.following = myUser.following.filter(id => id !== userToBlockId);
            userToBlock.followers = userToBlock.followers.filter(id => id !== myUser._id);
            // Ensure the blocked user cannot see you
            userToBlock.following = userToBlock.following.filter(id => id !== myUser._id);
            myUser.followers = myUser.followers.filter(id => id !== userToBlock._id);
        } else if (!block && isAlreadyBlocking) {
            // Unblock user
            myUser.blockedUsers = myUser.blockedUsers.filter(id => id !== userToBlockId);
        } else {
            return res.status(400).send({ message: "Invalid operation." });
        }

        await myUser.save();
        await userToBlock.save();
        return res.status(200).send({ message: `User block status updated.` });

    } catch (err) {
        return res.status(500).send({
            message: `Error updating block status for user with id=${userToBlockId}`,
            error: err.message || "Unexpected Error"
        });
    }
};

// Check block status with another user
exports.checkBlockStatus = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const targetUserId = req.params.id;
    if (!targetUserId) {
        return res.status(400).send({
            message: "Missing userId to check block status."
        });
    }

    try {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).send({ message: `User with id=${targetUserId} not found.` });
        }

        const blockingThem = myUser.blockedUsers.includes(targetUserId);
        const blockingUs = targetUser.blockedUsers.includes(myUser._id);

        return res.status(200).send({
            blockingThem,
            blockingUs
        });

    } catch (err) {
        return res.status(500).send({
            message: `Error checking block status with user id=${targetUserId}`,
            error: err.message || "Unexpected Error"
        });
    }
};


// Searching
exports.searchUsers = async (req, res) => {
    const query = req.body.query;
    const safeQuery = Common.escapeRegExp(query)

    if (!query) {
        return res.status(400).send({
            message: "Query parameter is required for searching."
        });
    }

    try {
        // Use a regular expression to perform a case-insensitive search
        const regex = new RegExp(safeQuery, 'i');

        // Find users with matching userName or displayName
        const users = await User.find({
            $or: [
                { userName: regex },
                { displayName: regex }
            ]
        }).select('_id displayName userName imageURL');

        // Sort users by prioritizing matches on userName, then displayName
        const sortedUsers = users.sort((a, b) => {
            const aUserNameMatch = a.userName.toLowerCase().includes(query.toLowerCase());
            const bUserNameMatch = b.userName.toLowerCase().includes(query.toLowerCase());

            if (aUserNameMatch && !bUserNameMatch) return -1;
            if (!aUserNameMatch && bUserNameMatch) return 1;
            return 0;
        });

        return res.status(200).send(sortedUsers);
    } catch (err) {
        return res.status(500).send({
            message: "Error occurred during search.",
            error: err.message || "Unexpected Error"
        });
    }
};

exports.getNotificationOptInStatus = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    // Authenticate
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const targetUserId = req.params.id;
    if (!targetUserId) {
        return res.status(400).send({
            message: "Missing userId to check notification opt-in status."
        });
    }

    try {
        // Ensure user is being followed
        if (!myUser.following.includes(targetUserId)) {
            return res.status(400).send({
                message: "You are not following this user."
            });
        }

        let optInStatus = "None"
        const optIn = myUser.notificationOptIns.get(targetUserId);
        if (optIn) {
            optInStatus = optIn.status;
        }
        return res.status(200).send({
            userId: targetUserId,
            optInStatus: optInStatus, // Defaulting to "None" if not set
        });

    } catch (err) {
        return res.status(500).send({
            message: `Error retrieving notification opt-in status for user id=${targetUserId}`,
            error: err.message || "Unexpected Error"
        });
    }
};

exports.updateNotificationOptIn = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    // Authenticate
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const userId = req.body.userId;
    const optInStatus = req.body.optInStatus;
    if (!(userId && optInStatus)) {
        return res.status(400).send({
            message: "Missing userId or optInStatus."
        });
    }

    // Ensure user is currently followed
    if (!myUser.following.includes(userId)) {
        return res.status(400).send({
            message: "You are not following this user."
        });
    }

    // Validating the opt-in status values
    if (["None", "Posts", "Events"].includes(optInStatus)) {
        myUser.notificationOptIns.set(userId, {
            status: optInStatus,
            timestamp: new Date()
        });

        await myUser.save();
        return res.status(200).send({ message: "Notification Opt-In updated." });
    } else {
        return res.status(400).send({ message: "Invalid opt-in status." });
    }
}

// Fetch and update user notifications
exports.getNotifications = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    
    // Authenticate
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    try {
        const notifications = [];

        for (const [followedUserId, optInDetails] of myUser.notificationOptIns.entries()) {
            const followedUser = await User.findById(followedUserId).populate('posts', '_id timestamp');
            if (!followedUser) continue;
            
            const optInStatus = optInDetails.status;
            const optInTimestamp = new Date(optInDetails.timestamp);
            
            const userNotifications = followedUser.posts.reduce((acc, post) => {
                const existingNotification = myUser.notifications.find(n => n.postId === String(post._id));
                
                // Check if we already have this notification or if it's older than the opt-in timestamp
                if (!existingNotification && post.timestamp > optInTimestamp) {
                    
                    const postTime = post.timestamp.getTime();
                    const newNotification = { timestamp: postTime, postId: String(post._id), read: false };
                    
                    if (optInStatus === "Posts" || (optInStatus === "Events" && post.is_event)) {
                        acc.push(newNotification);
                    }
                }
                return acc;
            }, []);
            
            notifications.push(...userNotifications);
        }

        // Combine and deduplicate existing and new notifications
        const updatedNotifications = [...myUser.notifications, ...notifications]
            .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp descending
            .filter((item, index, self) => index === self.findIndex(n => n.postId === item.postId)); // Remove duplicates

        // Cap notifications to a maximum of 100
        myUser.notifications = updatedNotifications.slice(0, 100);

        await myUser.save();
        return res.status(200).send(myUser.notifications);
    } catch (err) {
        return res.status(500).send({
            message: "Error occurred while fetching notifications.",
            error: err.message
        });
    }
}


exports.markAllNotificationsAsRead = async (req, res) => {
    let myUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    // Authenticate
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            myUser = await User.findById(user_id);
            if (myUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    myUser.notifications.forEach(notification => {
        notification.read = true;
    });

    await myUser.save();
    return res.status(200).send({ message: "All notifications marked as read." });
}