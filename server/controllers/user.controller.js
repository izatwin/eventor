const User = require("../models/user")
const crypto = require("crypto");

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
                        req.send({ "logged-in": true, "user-info": myUser.getInfoForClient() });
                        return;
                    }
                }
            }
        }
    }
    req.send({ "logged-in": false });
}

exports.isValidAccountEmail = async (req, res) => {
    let email = req.body.email;
    if (!email) {
        res.status(400).send({
            message: "Email body field required."
        });
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

    // let verifyCode = sendVerifyEmail(email); // TODO implement
    let verifyCode = "000000";

    let myVerificationStatus = new verificationStatus(verifyCode);
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
    emailVerifications[email] = null;

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

    // create user
    const newUser = new User({
        email: email,
        userName: userName,
        displayName: displayName,
        userCredentials: {}
    });

    let userCredentials = newUser.userCredentials;
    userCredentials.initCredentials(password)

    let authToken = userCredentials.generateAuthToken();

    res.cookie("user_id", newUser._id)
    res.cookie("auth_token", authToken.token, { expire: authToken.expire })

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
    }

    let email = req.body.email;
    let password = req.body.password;
    if (!(email && password)) {
        res.status(400).send({
            message: "Missing param(s) for User creation."
        });
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
    }

    let authToken = userCredentials.generateAuthToken();
    myUser.markModified('userCredentials.accessTokens');

    res.cookie("user_id", myUser._id)
    res.cookie("auth_token", authToken.token, { expire: authToken.expire })

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
    }

    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let verifyId = req.body.verifyId;
    if (!(email && newPassword && verifyId)) {
        res.status(400).send({
            message: "Missing param(s) for password reset."
        });
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

    res.cookie("user_id", myUser._id)
    res.cookie("auth_token", authToken.token, { expire: authToken.expire })

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

                        myUser.removeAuthToken(auth_token);
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

// exports.findOne = (req, res) => {
//     const userId = req.params.id;
//     return getUserById(userId);
// };

// Update a user by the id
// exports.update = (req, res) => {
//     if (!req.body) {
//         return res.status(400).send({
//             message: "Data to update post cannot be empty."
//         });
//     }

//     const id = req.param.id;

//     Post.findByIdAndUpdate(id, req.body, { runValidators: true })
//         .then(data => {
//             if (!data) {
//                 res.status(404).send({
//                     message: `Cannot find Post with id=${id}`
//                 });
//             } else res.send({ message: "Post updated successfully." })
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: `Error updating post with id=${id}`,
//                 error: err
//             });
//         });
// };

// Delete a user by the id
// exports.delete = (req, res) => {
//     const id = req.params.id;

//     Post.findOneAndDelete(id)
//     .then(data => {
//         if (!data) {
//             return res.status(404).send({
//                 message: `Cannot find post with id=${id}`,
//                 data: data
//             });
//         } else {
//             return res.send({
//                 message: "Post deleted successfully."
//             });
//         }
//     })
//     .catch(err => {
//         return res.status(500).send({
//             message: `Error deleting post with id=${id}`,
//             error: err.message || `Unexpected Error`
//         })
//     })
// };