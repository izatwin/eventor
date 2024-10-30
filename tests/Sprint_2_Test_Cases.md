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
2. Navigate to a post with event and image.
3. Edit the post (change body, remove event/image).
4. Refresh without saving.
5. Ensure no changes are reflected.

#### Test 2.2: Save Changes to Post Content
1. Log in to any valid account.
2. Edit an existing post by changing the message body and removing the event/image.
3. Save changes.
4. Refresh and confirm changes persist.

#### Test 2.3: Attach New Elements and Cancel
1. Log in to any valid account.
2. Edit a post and attach a new image and event.
3. Refresh without saving.
4. Ensure changes aren't applied.

#### Test 2.4: Attach New Elements and Save
1. Log in to any valid account.
2. Edit a post to attach a new image and event.
3. Save changes.
4. Refresh and confirm changes persist.

#### Test 2.5: Change Attachments Without Saving
1. Log in to any valid account.
2. Navigate to a post with an existing image and event.
3. Change the image and delete the event, attaching new ones.
4. Refresh without saving.
5. Ensure no changes are applied.

#### Test 2.6: Save Changed Attachments
1. Log in to any valid account.
2. Navigate to a post with an existing image and event.
3. Change the image to a new one, delete the event and attach a new one.
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