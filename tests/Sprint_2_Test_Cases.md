### Event Creation Tests

#### Test 1.1: Prevent Event Creation Without Name
1. Log in to any valid account.
2. Navigate to your personal profile page.
3. Start a new post creation.
4. Attach an event, select any event type.
5. Try to proceed without entering an event name.
6. If it allows proceeding, TEST FAILED.

#### Test 1.2: Successful Event Creation with All Data
1. Log in to any valid account.
2. Navigate to your personal profile page.
3. Start a new post creation.
4. Enter a valid message body.
5. Attach an event with a name and fill all necessary fields.
6. Ensure event visual is part of the post.
7. Publish the post.
8. Refresh the page; verify post with all details.

### Post Editing Tests

#### Test 2.1: Cancel Changes on Post
1. Log in to any valid account.
2. Navigate to a post with event.
3. Edit the post (change body, remove event).
4. Refresh without saving.
5. Ensure no changes are reflected.

#### Test 2.2: Save Changes to Post Content
1. Log in to any valid account.
2. Edit an existing post by changing the message body and removing the event.
3. Save changes.
4. Refresh and confirm changes persist.

#### Test 2.3: Attach New Event and Cancel
1. Log in to any valid account.
2. Edit a post and attach an event.
3. Refresh without saving.
4. Ensure changes aren't applied.

#### Test 2.4: Attach New Event and Save
1. Log in to any valid account.
2. Edit a post to attach a new event.
3. Save changes.
4. Refresh and confirm changes persist.

#### Test 2.5: Replace Event Without Saving
1. Log in to any valid account.
2. Navigate to a post with an existing event.
3. Change the delete the event and attach a new one.
4. Refresh without saving.
5. Ensure no changes are applied.

#### Test 2.6: Replace Event and Save
1. Log in to any valid account.
2. Navigate to a post with an existing event.
3. Delete the event and attach a new one.
4. Save changes.
5. Refresh to confirm changes are applied.

#### Test 2.7: Edit Event Details Without Saving
1. Log in to any valid account.
2. Edit all fields of an attached event in a post.
3. Refresh without saving.
4. Ensure no changes are reflected.

#### Test 2.8: Save Edited Event Details
1. Log in to any valid account.
2. Edit all fields of an attached event in a post.
3. Save changes.
4. Refresh and confirm changes are applied.

### Interaction Tests

#### Test 3.1: Like and Unlike Post
1. Log in to any valid account.
2. Navigate to an unliked post.
3. Like the post.
4. Refresh to confirm the like count is incremented.
5. Unlike the post.
6. Refresh to confirm the like count is decremented.

### Engagement Tests

#### Test 4.1: Share Post
1. Log in to any valid account.
2. Share an existing post.
3. Confirm share count increases and persists after refresh.

#### Test 4.2: View Count Increment
1. Log in to any valid account.
2. Record the view count of a post.
3. Refresh and revisit post.
4. Verify view count increment.

### User Interaction Tests

#### Test 5.1: Search Invalid Username
1. Log in to any valid account.
2. Access search bar.
3. Input random, non-existent username.
4. Verify zero user matches.

#### Test 5.2: Search Valid Username
1. Log in to any valid account.
2. Access search bar.
3. Input partial known username.
4. Verify results include the known user.

### User Following Tests

#### Test 6.1: Prevent Self-Follow
1. Log in to any valid account.
2. Access own profile.
3. Verify no follow button is present.

#### Test 6.2: Follow and Unfollow User
1. Log in to any valid account.
2. Navigate to another user's profile.
3. Follow the user.
4. Confirm follow button changes, follower count increments and persists.
5. Unfollow the user.
6. Confirm follow button reverts, follower count decrements and persists.

### User Blocking Tests (Unified for Independence)

#### Test 7.1: Self-Block Prevention
1. Log in to any valid account.
2. Access own profile.
3. Verify no block button is available.

#### Test 7.2: Block User
1. Log in to any valid account.
2. Navigate to another user's profile.
3. Optionally follow and then block the user.
4. Verify no posts or follow options are visible.
5. Log into the blocked account.
6. Navigate to your profile, confirm no posts/limited options.
7. Log back into your original account.
8. Unblock the user.
9. Confirm posts return to visibility but user is no longer followed.

### Test 8: Viewing Another User's Posts in Feed

#### Test 8.1: Verify Post Visibility and Order on User's Profile
1. Log in to any valid account.
2. Navigate to your personal profile page.
3. Create multiple posts with varying timestamps.
4. Log out and log in with another valid account.
5. Navigate to the original account's profile.
6. Verify that all posts are visible on the profile.
7. Confirm that posts are displayed in chronological order with the newest post at the top.
8. Refresh the page to ensure the order and visibility remain consistent.
9. Log out and log back into the original account.
10. Delete a recently created post.
11. Log back into the second account.
12. Refresh the profile page to confirm the post is no longer visible.


### Test 9: Comments

#### Test 9.1: Create Comments
1. Log in to any valid account.
2. Navigate to a post you have access to view.
3. Enter a comment into the comment field and submit.
4. Refresh the page.
5. Verify the comment appears below the post and includes your username.
6. Ensure the comment count has incremented on the post.

#### Test 9.2: View Comments
1. Log in to any valid account.
2. Navigate to a post where anyone has previously left a comment.
3. Navigate to the comment section of the post.
4. Ensure that the comment appears.


#### Test 10: User Account Deletion

##### Instructions:
1. Create account (see Test 1)
2. Navigate to the "Profile page"
3. Click the hamburger button, then settings
4. Click Delete Account
5. Enter password, then click submit
##### Expected Results
1. Page is refreshed to login page
2. User may not login with the previous user credentials

#### Test 11: User Account Deletion - Wrong password

##### Instructions:
1. Create account (see Test 1)
2. Click the hamburger button (middle left), then settings
3. Click Delete Account
4. Enter wrong password, then click submit
##### Expected Results
1. Password field is cleared, account is not deleted.

#### Test 12: Set profile picture
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

#### Test 13: Set Bio
##### Instructions:
1. Login to previously created account (see Test 1)
2. Click Profile (middle left button, human shape)
4. Click Edit Bio
5. Edit the bio string with changes.
6. Reload the page.
##### Expected Results
1. Profile should show the edited Bio

#### Test 14: Set Status
##### Instructions:
1. Login to previously created account (see Test 1)
2. Click Profile (middle left button, human shape)
4. Click Edit Status
5. Edit the status string with changes.
6. Reload the page.
##### Expected Results
1. Profile should show the edited status