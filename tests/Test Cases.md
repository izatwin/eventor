#### Test 1: User Account Creation
##### Test Instructions
1. Navigate to the “Create Account” page
2. Input a valid email address and continue
3. Try to enter a random verification code
	1. If it is accepted, TEST FAILED
4. Enter the verification code given to you by email
	1. If it is NOT accepted, TEST FAILED
5. Fill in the requested account information when prompted. 
	1. Choose a Username that is already taken.
		1. If it allows you to create the account, TEST FAILED
	2. Change the Username to one that is not already taken.
		1. If it says the username is taken, TEST FAILED
6. Account created.
	1. If you are NOT logged in and on the home page, TEST FAILED
	2. If you do NOT receive a confirmation email, TEST FAILED
7. TEST PASSED

#### Test 2: User Account Login
##### Test Instructions
1. Be logged out
2. Attempt to visit the “Home” page of the app
	1. If you are not redirected to the “Log-in” page, TEST FAILED
3. Input a valid email address for an existing account
4. Input an INVALID password for the account
	1. If it is accepted, TEST FAILED
5. Input a VALID password for the account
	1. If it is not accepted, TEST FAILED
6. Logged in
	1. If you are not on the home page, TEST FAILED
7. Close the site and re-open it
	1. You should still be logged in. If you are prompted to log-in or sign-up, TEST FAILED
8. Select the option to log out of your account
	1. If you are not prompted with the sign-in page, TEST FAILED
9. TEST PASSED


#### Test 3: User Account Password Reset
##### Test Instructions
1. Navigate to the “Reset Password” page
2. Input an invalid email address not pertaining to any account
	1. If it is accepted, TEST FAILED
3. Input a valid email address for an existing account
	1. If it is not accepted, TEST FAILED
4. Try to enter a random verification code
	1. If it is accepted, TEST FAILED
5. Enter the verification code given to you by email
	1. If it is NOT accepted, TEST FAILED
6. Enter a new password for your account
7. Logged in
	1. If you are not on the home page, TEST FAILED
8. Log out from your account
9. Attempt to log into your account with the OLD password
	1. If it is accepted, TEST FAILED
10. Attempt to log into your account with your NEW password
	1. If it is not accepted, TEST FAILED
11. TEST PASSED

#### Test 4: User Account Profile information change
##### Test Instructions
1. Navigate to the “Settings” page
2. Click “Profile Picture”, enter new image url
	1. Navigate back to profile, if picture is not updated, TEST FAILED
3. Click edit “Display Name”, enter a new display name
	1. Navigate back to profile, if display name is not updated, TEST FAILED
4. Click edit “Biography”, enter a new biography
	1. Navigate back to profile, if biography is not updated, TEST FAILED
5. Click edit “status”, enter a new status
	1. Navigate back to profile, if status is not updated, TEST FAILED
6. TEST PASSED


#### Test 5: User Posts list
##### Test Instructions
1. Navigate to the “Profiles” page
2. Create a new Post
3. Create another Post
4. Scroll down and see if both posts appear.
	1. If they don’t appear, TEST FAILED
5. TEST PASSED

#### Test 6: User Posts edit
##### Test Instructions
1. Navigate to the “Profiles” page
2. Find an existing one of your posts
3. Select “edit post” on the post
4. Update the content to something different and select update
5. Refresh the page
	1. If the content changes are not reflected, TEST FAILED
6. TEST PASSED


#### Test 7: User Account Deletion

##### Instructions:
1. Create account (see Test 1)
2. Navigate to the "Profile page"
3. Click the hamburger button, then settings
4. Click Delete Account
5. Enter password, then click submit
##### Expected Results
1. Page is refreshed to login page
2. User may not login with the previous user credentials

#### Test 8: User Account Deletion - Wrong password

##### Instructions:
1. Create account (see Test 1)
2. Click the hamburger button (middle left), then settings
3. Click Delete Account
4. Enter wrong password, then click submit
##### Expected Results
1. Password field is cleared, account is not deleted.

#### Test 9: Set profile picture
##### Instructions:
1. Login to previously created account (see Test 1)
2. Create a post (see test \<not created yet\>)
3. Click the hamburger button (middle left), then settings
4. Click "Profile Picture"
5. input an image URL, and then Save
6. Click Profile (middle left button, human shape)
##### Expected Results
1. Profile should show the picture you chose.
2. Profile picture should show in the bottom left corner.
3. Posts on profile should show the profile picture.

#### Test 10: Set Bio
##### Instructions:
1. Login to previously created account (see Test 1)
2. Click Profile (middle left button, human shape)
4. Click Edit Bio
5. Edit the bio string with changes.
6. Reload the page.
##### Expected Results
1. Profile should show the edited Bio

#### Test 11: Set Status
##### Instructions:
1. Login to previously created account (see Test 1)
2. Click Profile (middle left button, human shape)
4. Click Edit Status
5. Edit the status string with changes.
6. Reload the page.
##### Expected Results
1. Profile should show the edited status