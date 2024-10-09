// const User = require("./user.js").User;

const crypto = require("crypto");

const user_module = require("./user.js");
const User = user_module.User;

const sendmail = require("./sendmail.js");

const prompt = require('prompt-sync')();

//

const express = require("express");
const app = express();
const port = 80;

const cookieParser = require('cookie-parser');

app.use(cookieParser());

const users = {};
const userIds = {};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get('/getcookies', (req, res) => {
  //shows all the cookies 
  res.send(req.cookies);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

function delay(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

app.get('/signup', (req, res) => {
  console.log("- Account creation -");
  let email = prompt("Enter your email: ");
  console.log("Email: " + email); 
  console.log();
  let verificationCode = sendmail.doVerificationRequest(email);

  delay(5);
  
  console.log("Please verify your identity by entering the 6-digit code sent to your email.");
  while (true) {
    let code = prompt("Enter verificaiton code: ");
    if (code == verificationCode) {
      console.log("Email verified!\n");
      break;
    }
    console.log("Incorrect, try again.\n");
  }

  let password = prompt("Create a password: ");
  console.log("Password: " + password); 
  console.log();

  newUser = new User(email, "John_Doe", password);
  let userId = newUser.userId;
  users[userId] = newUser;
  userIds[email] = userId;

  res.redirect('/login');
});

app.get('/login', (req, res) => {
  // TODO insta login if cookie stored
  let req_cookies = req.cookies;
  console.log("req cookies:");
  console.log(req_cookies);
  if (req_cookies) {
    let user_id = req_cookies.user_id;
    if (user_id) {
      let user = users[user_id];
      if (user) {
        let auth_token = req_cookies.auth_token;
        if (auth_token) {
          let userCredentials = user.credentials;
          if (userCredentials.matchAuthToken(auth_token)) {
            let email = user.email;
            res.send("Logged into account from cookie. Email: " + email);
            return;
          }
        }
      }
    }
  }

  // Otherwise, prompt login
  console.log("- Account login -");
  let email = prompt("Enter your email: ");
  console.log("Email: " + email); 
  console.log();

  // find account from email
  let user_id = userIds[email];
  if (user_id == null) {
    res.send("Failed to locate account with email " + email);
    return;
  }

  let user = users[user_id];
  userCredentials = user.credentials

  while (true) {
    console.log("Please log in to your account.");
    let pswd = prompt("Enter account password: ");
    if (userCredentials.matchPassword(pswd)) {
      console.log("Logged in!\n");
      break;
    }
    console.log("Incorrect, try again.\n");
  }

  let authToken = userCredentials.generateAuthToken();

  console.log("setting cookies!");
  res.cookie("user_id", user_id)
  res.cookie("auth_token", authToken.token, {expire: authToken.expire});
  res.send('logged in and cookie saved!');
});

// DEMO CODE BELOW
// (async () => {
//   await delay(0);

//   console.log("- Account creation -");
//   let email = prompt("Enter your email: ");
//   console.log("Email: " + email); 
//   console.log();
//   let verificationCode = await sendmail.doVerificationRequest(email);
  
//   console.log("Please verify your identity by entering the 6-digit code sent to your email.");
//   while (true) {
//     let code = prompt("Enter verificaiton code: ");
//     if (code == verificationCode) {
//       console.log("Email verified!\n");
//       break;
//     }
//     console.log("Incorrect, try again.\n");
//   }

//   let password = prompt("Create a password: ");
//   console.log("Password: " + password); 
//   console.log();

//   newUser = new User(email, "John_Doe", password);

//   userCredentials = newUser.credentials

//   while (true) {
//     console.log("Please log in to your account.");
//     let pswd = prompt("Enter account password: ");
//     if (userCredentials.matchPassword(pswd)) {
//       console.log("Logged in!\n");
//       break;
//     }
//     console.log("Incorrect, try again.\n");
//   }
// })()


