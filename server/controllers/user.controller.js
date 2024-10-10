const User = require("../models/user")

// Create and save a new User account
exports.signup = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "User cannot be empty."
        });
        return;
    }
    
    let email = req.body.email;
    let password = req.body.password;
    console.log("Email: " + email + " - Password: " + password);
    if (!(email && password)) {
        res.status(400).send({
            message: "Missing param(s) for User creation."
        });
        return;
    }
    // TODO sanity checks (type, format)

    // TODO make sure user doesn't already exist in the database with same email, username, or userId
    console.log("A");
    const newUser = new User({
        email: email,
        userCredentials : {}
    });
    console.log("B");
    newUser.userCredentials.initCredentials(password);
    console.log("C");
    newUser.save(newUser)
        .then(data => {
            console.log(data);
            res.send(data);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
        console.log("D");
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
                        res.send(myUser);
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
    
    // TODO get user from email?!
    const myUser = await User.findOne({ "email" : email }).exec();
    console.log(myUser);
    if (!myUser) {
        res.status(400).send({
            message: "Invalid email!"
        });
        return;
    }

    const userCredentials = myUser.userCredentials;
    
    if (!userCredentials.matchPassword(password)) {
        res.status(400).send({
            message: "Invalid password!"
        });
    }

    let authToken = userCredentials.generateAuthToken();
    myUser.markModified('userCredentials.accessTokens');

    res.cookie("user_id", myUser._id)
    res.cookie("auth_token", authToken.token, {expire: authToken.expire})

    myUser.save(myUser)
        .then(data => {
            res.send(data); // TODO don't send EVERYTHING back, especially leave out user credential information
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
};

// Find a single user with an id
function getUserById(userId) {
    User.findById(userId)
    .then(data => {
        if (!data)
            return res.status(404).send({ message: `User not found with id=${id}` });
        else res.send(data);
    })
    .catch(err => {
        return res.status(500).send({
            message: `Error retrieving user with id=${id}`,
            error: err.message || 'Unexpected Error'
        }
        );
    });
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