### Sprint 3 Test Cases



#### Test 1: Searching and Filtering
1. Navigate to the 'Explore' page
2. Select the search bar and ensure no dropdown options are visible.
3. Begin typing in the search bar.
4. Ensure dropdown search options are visible for the following categories:
    * Users
    * Post Contennt
    * Event Location
    * Event Title
5. Select one of the listed search categories and ensure the search works properly.


#### Test 2: Comment Replies
1. Navigate to any post and expand it to view the comments section.
2. Create a comment on the post if there is not already one.
3. Write a reply comment to an existing top-level comment and post it.
4. Ensure the comment is visible upon posting as well as after refreshing the page.


#### Test 3.1: Comment Deletion on Others' Posts
1. Navigate to another user's and expand it to view the comments section.
2. Ensure that no delete option is available for comments and reply-comments created by other users.
3. Ensure that a delete option is available for comments and reply-comments created by yourself.
4. When delete option is available, ensure that deleting the comment/reply-comment is successful.
    * When deleting a top-level comment, all of its reply-comments should be deleted as well, even if not
    * posted by the same user who created the top-level comment.

#### Test 3.2: Comment Deletion on Your Posts
1. Navigate to one of your posts.
2. Ensure that a delete option is available on all comments and reply-comments.
3. Ensure that deleting the comment/reply-comment is successful.


#### Test 4: Profanity Filter
1. Ensure that you can not create/edit a post to have profanity in its content.
2. Ensure that you can not create/edit an event to have profanity in its content.
3. Ensure that you cannot create an account or update your account's information to have profanity in any of the following fields:
    * UserName
    * DisplayName
    * Biography
    * Status
4. Ensure that when attempting to do any of the above, the client informs you that your request was rejected due to profanity.


#### Test 5.1: Special Event Creation
1. Log in to any valid account.
2. Navigate to your personal profile page.
3. Start a new post creation.
4. Enter a valid message body.
5. Attach a special event with a name and fill all necessary fields.
6. Publish the post.
7. Refresh the page; verify post with all details.

#### Test 5.2: Special Event Editing
1. Log in to any valid account.
2. Navigate to a post that does have an attached special event.
3. Edit all fields of an attached event in a post.
4. Save changes.
5. Refresh and confirm changes are applied.


#### Test 6: Post Image Attaching / Detaching
1. Navigate to one of your posts without an attached image
2. Attach an image to the post and ensure it remains after a page refresh.
3. Remove the image from the post and ensure it's gone after a page refresh.