const User = require("../models/user")
const Post = require("../models/post")
const crypto = require("crypto");

const sendmail = require("../modules/sendmail.js");

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
        return res.send({message: "User deleted!"})
    } catch (err) {
        return res.status(500).send({
            message: "Error deleting User",
            error: err.message || "Unexpected Error"
        })
    }
}