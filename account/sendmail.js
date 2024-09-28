const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');

const CREDENTIALS_PATH = 'credentials.json';  // Path to your credentials.json file
const TOKEN_PATH = 'token.json';  // Path to store your token

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const app = express();
const PORT = 3000;

let oAuth2Client;

// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  const credentials = JSON.parse(content);
  authorize(credentials);
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('OAuth2 Client initialized');
  });
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
}

// Route for OAuth2 callback
app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return res.status(400).send('Error retrieving access token');
    oAuth2Client.setCredentials(token);
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    res.send('Authentication successful! You can close this tab.');
  });
});

async function sendTestEmail(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const raw = makeBody('user@example.com', 'me', 'Test Gmail API', 'This is a test');
  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      resource: { raw },
    });
    console.log('Email sent:', response.data.id);
  } catch (err) {
    console.error('The API returned an error:', err);
  }
}

function makeBody(to, from, subject, message) {
  const str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    'MIME-Version: 1.0\n',
    'Content-Transfer-Encoding: 7bit\n',
    `To: ${to}\n`,
    `From: ${from}\n`,
    `Subject: ${subject}\n\n`,
    message,
  ].join('');
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

app.get('/', (req, res) => {
  res.send('<a href="/authorize">Authorize</a>');
});

app.get('/authorize', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/send-email', async (req, res) => {
  await sendTestEmail(oAuth2Client);
  res.send('Email sent!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function sendVerificationEmail(recipientEmail, verificationCode) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  let subject = "Here's your verification code " + verificationCode;
  let body = "Enter the 6-digit code below to verify your identity" 
    + "and gain access to your Eventor account.\n\n" + verificationCode;

  const raw = makeBody(recipientEmail, 'me', subject, body);

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      resource: { raw },
    });
    console.log('Email sent:', response.data.id);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

function generateVerificationCode() {
  return ('000000' + (crypto.randomInt(0, 1000000)).toString()).slice(-6);
}

// TEST CODE
(async function() {
  let email = "vmenapace@icloud.com";
  let verifyCode = generateVerificationCode();

  // Wait until OAuth2 client is authenticated before calling sendVerificationEmail
  await new Promise((resolve, reject) => {
    const checkAuth = setInterval(() => {
      if (oAuth2Client && oAuth2Client.credentials && oAuth2Client.credentials.access_token) {
        clearInterval(checkAuth);
        resolve();
      }
    }, 100);  // Check every 100ms

    // Timeout after a certain period to avoid infinite waiting
    setTimeout(() => {
      clearInterval(checkAuth);
      reject('OAuth2 client not authenticated within the timeout period');
    }, 10000);  // Adjust the timeout based on your needs.
  });

  sendVerificationEmail(email, verifyCode);
})();