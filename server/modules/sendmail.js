const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CREDENTIALS_PATH = './modules/credentials.json';
const TOKEN_PATH = './modules/token.json';
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const PORT = 4200;

const app = express();
let oAuth2Client;

initializeOAuth2Client();

function initializeOAuth2Client() {
  fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) return console.error('Error loading client secret file:', err);
    const credentials = JSON.parse(content);
    authorize(credentials);
  });
}

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getAccessToken(oAuth2Client);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    oAuth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        fs.writeFile(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials), (err) => {
          if (err) return console.error('Error storing token:', err);
          console.log('Token stored to', TOKEN_PATH);
        });
      }
    });

    //console.log('OAuth2 Client initialized');
    //console.log('Access Token:', oAuth2Client.credentials.access_token);
  });
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  console.log('Authorize this app by visiting this url:', authUrl);
}

app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return res.status(400).send('Error retrieving access token');
    if (!token.refresh_token) {
      return res.status(400).send('No refresh token obtained');
    }
    oAuth2Client.setCredentials(token);
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error('Error storing token:', err);
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
    // console.log('Email sent:', response.data.id);
  } catch (err) {
    console.error('Error sending email:', err);
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
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

app.get('/', (req, res) => {
  res.send('<a href="/authorize">Authorize</a>');
});

app.get('/authorize', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

app.listen(PORT, () => {
    console.log(`Email app listening on port ${PORT}!`);
});

// app.get('/send-email', async (req, res) => {
//   await sendTestEmail(oAuth2Client);
//   // res.send('Email sent!');
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

async function sendVerificationEmail(recipientEmail, verificationCode) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  let subject = "Here's your verification code " + verificationCode;
  let body = `Enter the 6-digit code below to verify your identity and gain access to your Eventor account.\n\n${verificationCode}\n\nThis code will expire in 10 minutes.`;

  const raw = makeBody(recipientEmail, 'me', subject, body);

  try {
    console.log("sending email");
    const response = await gmail.users.messages.send({
      userId: 'me',
      resource: { raw },
    });
    console.log('Email sent:', response.data.id);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

async function sendConfirmationEmail(recipientEmail, userName) {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    let subject = "Welcome, " + userName + "!";
    let body = userName + ",\n\n" + 
                "Thank you for creating an Eventor account!";

    const raw = makeBody(recipientEmail, 'me', subject, body);

    try {
        console.log("sending email");
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

async function doSendVerifyEmail(email, verifyCode) {
  try {
    await new Promise((resolve, reject) => {
      const checkAuth = setInterval(() => {
        if (oAuth2Client && oAuth2Client.credentials && oAuth2Client.credentials.access_token) {
          clearInterval(checkAuth);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkAuth);
        reject('OAuth2 client not authenticated within the timeout period');
      }, 60000);
    });

    await sendVerificationEmail(email, verifyCode);
  } catch (error) {
    console.error('Failed to authenticate OAuth2 client or send email:', error);
  }
}

async function doSendConfirmationEmail(email, userName) {
    try {
        await new Promise((resolve, reject) => {
        const checkAuth = setInterval(() => {
            if (oAuth2Client && oAuth2Client.credentials && oAuth2Client.credentials.access_token) {
            clearInterval(checkAuth);
            resolve();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkAuth);
            reject('OAuth2 client not authenticated within the timeout period');
        }, 60000);
        });

        await sendConfirmationEmail(email, userName);
    } catch (error) {
        console.error('Failed to authenticate OAuth2 client or send email:', error);
    }
}

function doVerificationRequest(email) {
  let verifyCode = generateVerificationCode();
  doSendVerifyEmail(email, verifyCode);
  
  return verifyCode;
};

function doConfirmationMesssage(email, userName) {
    doSendConfirmationEmail(email, userName);
};

module.exports = {doVerificationRequest, doConfirmationMesssage};