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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// DEMO CODE BELOW
(async () => {
  console.log("- Account creation -");
  let email = prompt("Enter your email: ");
  console.log("Email: " + email); 
  console.log();
  let verificationCode = await sendmail.doVerificationRequest(email);
  
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

  userCredentials = newUser.credentials

  while (true) {
    console.log("Please log in to your account.");
    let pswd = prompt("Enter account password: ");
    if (userCredentials.matchPassword(pswd)) {
      console.log("Logged in!\n");
      break;
    }
    console.log("Incorrect, try again.\n");
  }
})()


