const User = require("../models/user")

// Common function to authenticate the user
exports.authenticateUser = async (req) => {
    let authenticatedUser = null;
    let authenticated = false;
    const req_cookies = req.cookies;

    if (req_cookies) {
        const user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                const auth_token = req_cookies.auth_token;
                if (auth_token) {
                    const userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    return authenticated ? authenticatedUser : null;
}