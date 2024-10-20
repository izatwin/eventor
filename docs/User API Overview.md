
### User

| Type   | Path                       | Request Body                                                                                                                     | Response Body                                                         |
| ------ | -------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| GET    | /api/user/validate         | NONE                                                                                                                             | { <br>  "logged-in" : boolean,<br>  "user-info" : USER_INFO?<br>}<br> |
| GET    | /api/user/exists           | { "email" : string }                                                                                                             | { "exists" : boolean }                                                |
| POST   | /api/user/verify           | { "email" : string }                                                                                                             | { "verifyId" : string }                                               |
| PATCH  | /api/user/verify           | { "email" : string,<br>  "verifyId" : string,<br>  "verifyCode" : string }                                                       | Status Code: 200 / 401 / 498                                          |
| POST   | /api/user/signup           | { "email" : string,<br>  "verifyId" : string,<br>  "userName" : string <br>  "password" : string <br>  "displayName" : string? } | USER_INFO<br><br>Status Code: 200 / 409 / 498<br>                     |
| POST   | /api/user/login            | { "email" : string,<br>  "password" : string }                                                                                   | USER_INFO                                                             |
| PATCH  | /api/user/logout           | NONE                                                                                                                             | NONE                                                                  |
| POST   | /api/user/reset            | { "email" : string,<br>  "verifyId" : string,<br>  "newPassword" : string }                                                      | USER_INFO                                                             |
| POST   | /api/user/authorized-reset | { "oldPassword" : string,<br>  "newPassword" : string }                                                                          | USER_INFO<br><br>Status Code: 200 / 401                               |
| POST   | /api/user/username         | { "newUsername" : string }                                                                                                       | USER_INFO<br><br>Status Code: 200 / 409<br>                           |
| POST   | /api/user/displayname      | { "newDisplay" : string }                                                                                                        | USER_INFO                                                             |
| DELETE | /api/user/account          | { "password" : string }                                                                                                          | Status Code: 200 / 401                                                |

### Detailed Descriptions
#### is_logged_in

| TYPE | PATH               | REQUEST BODY | RESPONSE BODY                                                     |
| ---- | ------------------ | ------------ | ----------------------------------------------------------------- |
| GET  | /api/user/validate | NONE         | { <br>  "logged-in" : boolean,<br>  "user-info" : USER_INFO?<br>} |

Used for the client to validate their own session. Upon request, the server will use the client sent cookies to determine whether they are currently logged into a valid session. 

The “logged-in” response boolean will be set to the validity of the current session sent in all cases. A status of `true` represents the user is currently logged in and can access pages, while a status of `false` represents the user is either not logged in or their session has expired and they need to log in again.

---
#### account_exists

| TYPE | PATH             | REQUEST BODY         | RESPONSE BODY              |
| ---- | ---------------- | -------------------- | -------------------------- |
| GET  | /api/user/exists | { "email" : string } | { "exists" : boolean }<br> |

The “exists” response boolean will be set to whether or not an account exists with the given email. Used in password resetting prior to email verification to inform the user in the case that no account currently exists with the given email.

---
#### send_email_verification

| TYPE | PATH             | REQUEST BODY         | RESPONSE BODY           |
| ---- | ---------------- | -------------------- | ----------------------- |
| POST | /api/user/verify | { "email" : string } | { "verifyId" : string } |

Sends a 6-digit code to the provided email. Returns a “verifyId” (hexadecimal byte string) which the client will need to provide as an access key for future requests requiring verification.

Email verification is required for account signup and password reset, and this endpoint is step 1 of the verification process.

---
#### verify_email

| TYPE  | PATH             | REQUEST BODY                                                               | RESPONSE BODY                |
| ----- | ---------------- | -------------------------------------------------------------------------- | ---------------------------- |
| PATCH | /api/user/verify | { "email" : string,<br>  "verifyId" : string,<br>  "verifyCode" : string } | Status Code: 200 / 401 / 498 |

Checks the 6-digit code sent by the client and verifies its accuracy. A "verifyId", retrieved previously from the equivalent POST request, must be provided to identify the session. A status code of 200 indicates success, a status code of 401 indicates an incorrect "verifyCode", and a status code of 498 indicates an expired "verifyId". An expired "verifyId" requires this process to start over to obtain a new "verifyId".

Email verification is required for account signup and password reset, and this endpoint is step 2 of the verification process.

---
#### create_account

| TYPE | PATH             | REQUEST BODY                                                                                                                     | RESPONSE BODY                                 |
| ---- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| POST | /api/user/signup | { "email" : string,<br>  "verifyId" : string,<br>  "userName" : string <br>  "password" : string <br>  "displayName" : string? } | USER_INFO<br><br>Status Code: 200 / 409 / 498 |

Attempts to create an account with the given parameters. A "verifyId" is required to make this request. A status code of 498 indicates an expired "verifyId". Upon success, "verifyId" is invalidated for future use, the user is signed-in, and user account information is sent to the client. When the email or userName is already taken, making this request fail, the 409 status code is returned, with the response body being either { topic: "email" } or  { topic: "userName" }, indicating which field is already “taken” by another account. 

Email verification is required for account signup and password reset, and this endpoint is the final step of the verification process.

---
#### sign_in

| TYPE | PATH            | REQUEST BODY                                   | RESPONSE BODY                           |
| ---- | --------------- | ---------------------------------------------- | --------------------------------------- |
| POST | /api/user/login | { "email" : string,<br>  "password" : string } | USER_INFO<br><br>Status Code: 200 / 409 |

Attempts to log into an account with the provided email and password. No email verification is required for account sign-in. Upon success, the response body will contain the user’s information. If either the email or password are incorrect, making this request fail, the 409 status code is returned, with the response body being either { topic: "email" } or  { topic: "password" }, indicating which provided field was incorrect.

---
#### sign_out

| TYPE  | PATH             | REQUEST BODY | RESPONSE BODY |
| ----- | ---------------- | ------------ | ------------- |
| PATCH | /api/user/logout | NONE<br>     | NONE          |

Clears the current in-use authentication cookies from the client and server, invalidating the login session and logging the user out.

---
#### reset_password

| TYPE | PATH            | REQUEST BODY                                                                | RESPONSE BODY                           |
| ---- | --------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| POST | /api/user/reset | { "email" : string,<br>  "verifyId" : string,<br>  "newPassword" : string } | USER_INFO<br><br>Status Code: 200 / 498 |

Resets the password for an account to the given "newPassword". A "verifyId" is required to make this request. A status code of 498 indicates an expired "verifyId". Upon success, the password is reset, all existing log-in sessions are immediately invalidated, "verifyId" is invalidated for future use, the user is signed-in, and user account information is sent to the client.

Email verification is required for account signup and password reset, and this endpoint is the final step of the verification process.

---
#### reset_password_logged_in

| TYPE | PATH                       | REQUEST BODY                                            | RESPONSE BODY                           |
| ---- | -------------------------- | ------------------------------------------------------- | --------------------------------------- |
| POST | /api/user/authorized-reset | { "oldPassword" : string,<br>  "newPassword" : string } | USER_INFO<br><br>Status Code: 200 / 401 |

Resets the password for an account to the given “newPassword”. Requires the “oldPassword” (current password) to be sent as verification. A status code of 401 indicates an incorrect “oldPassword”. User must be logged in to make the request. User information returned on success.

---
#### change_username

| TYPE | PATH               | REQUEST BODY               | RESPONSE BODY                           |
| ---- | ------------------ | -------------------------- | --------------------------------------- |
| POST | /api/user/username | { "newUsername" : string } | USER_INFO<br><br>Status Code: 200 / 409 |

Changes the user’s userName to be set to the “newUsername” sent. Status code 409 is returned when the desired “newUsername” is already taken. User must be logged in to make the request. User information is returned on success.

---
#### change_displayname

| TYPE | PATH                  | REQUEST BODY              | RESPONSE BODY                           |
| ---- | --------------------- | ------------------------- | --------------------------------------- |
| POST | /api/user/displayname | { "newDisplay" : string } | USER_INFO<br><br>Status Code: 200 / 409 |

Changes the user’s userName to be set to the “newUsername” sent. Status code 409 is returned when the desired “newUsername” is already taken. User must be logged in to make the request.

---
#### delete_account

| TYPE   | PATH              | REQUEST BODY            | RESPONSE BODY          |
| ------ | ----------------- | ----------------------- | ---------------------- |
| DELETE | /api/user/account | { "password" : string } | Status Code: 200 / 401 |


Permanently deletes a user’s account using the provided “password”. Status code 401 is returned when an invalid password is received.

### Notes
1. Assume all requests can return the 400 (client error) and 500 (server error) status codes even if not listed in their descriptions.
2. Signup and Reset Password requests DO sign you in after completion and do not require a redirect to the sign-in page after success.

**USER_INFO** = {
  "userId" : string, 
  "email" : string,
  "userName" : string,
  "displayName" : string,
  "biography" : string,
  "status" : string,
  "imageURL" : string,
}