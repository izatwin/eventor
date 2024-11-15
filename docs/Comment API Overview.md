
### Comment

| Type   | Path                       | Request Body                                                            | Response Body                                                               |
| ------ | -------------------------- | :---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| POST   | /api/comments/             | {"postId": ObjectId,<br>"comment": {"text": string,<br>"isRoot": bool}} | { COMMENT }                                                                 |
| GET    | /api/comments/post/:postId | NONE                                                                    | { <br>  \[COMMENT\]<br>}<br>                                                |
| GET    | /api/comments/:id          | NONE                                                                    | { COMMENT }                                                                 |
| DELETE | /api/comments/:id          | NONE                                                                    | Status Code: 200 / 404 / 500                                                |
| PUT    | /api/comments/:id          | {any updateable field}                                                  | { COMMENT }<br><br>Status Code: 200 / 409 / 498<br>                         |
| POST   | /api/addChild/:id          | {"childId": \<childId\>}                                                | {message: "Child comment added to parent successfully",<br>parent: COMMENT} |
**COMMENT** = {
"timestamp" : Date \<timestamp of the comment\> (server created),
"user": String \<user who made the comment\> (server created),
"likes": Number \<likes on the comment\> (server created),
"text": String \<text of the comment\>,
"isRoot": Boolean \<is the comment a root comment?\>,
"comments": \[ObjectId] \<List of reply comments\>
}

### Detailed Descriptions
#### create

| TYPE | PATH           | REQUEST BODY | RESPONSE BODY |
| ---- | -------------- | ------------ | ------------- |
| POST | /api/comments/ | {COMMENT}    | { COMMENT }   |

Used for the client to create a comment

The response will be the comment after it is added to the server. Any default values will have been filled.

---
#### get_comments_on_post

| TYPE | PATH                       | REQUEST BODY | RESPONSE BODY                |
| ---- | -------------------------- | ------------ | ---------------------------- |
| GET  | /api/comments/post/:postId | NONE         | { <br>  \[COMMENT\]<br>}<br> |

Used for the client to get all the root comments on a post

---
#### get_single_comment

| TYPE | PATH              | REQUEST BODY | RESPONSE BODY |
| ---- | ----------------- | ------------ | ------------- |
| GET  | /api/comments/:id | NONE         | { COMMENT }   |

Used for the client to get the content of a single comment.

---
#### delete_single_comment

| TYPE   | PATH              | REQUEST BODY | RESPONSE BODY                |
| ------ | ----------------- | ------------ | ---------------------------- |
| DELETE | /api/comments/:id | NONE         | Status Code: 200 / 404 / 500 |

Used for the client to delete a single comment.

---
#### update_a_comment

| TYPE | PATH              | REQUEST BODY | RESPONSE BODY                                       |
| ---- | ----------------- | ------------ | --------------------------------------------------- |
| PUT  | /api/comments/:id | {COMMENT}    | { COMMENT }<br><br>Status Code: 200 / 409 / 498<br> |

Used for the client to update a comment. One can have all the fields in the body, or only select ones that need to be updated. The server will return the updated comment back.

---
#### add_child_comment_to_root

| TYPE | PATH              | REQUEST BODY                  | RESPONSE BODY                                                               |
| ---- | ----------------- | ----------------------------- | --------------------------------------------------------------------------- |
| POST | /api/addChild/:id | {<br>"childId": ObjectId<br>} | {message: "Child comment added to parent successfully",<br>parent: COMMENT} |

Used to add a comment to another comment.
The id in the url is the parent comment, the id in the body is the child comment.

The server will return the parent comment in the response body.


### Notes
1. Assume all requests can return the 400 (client error) and 500 (server error) status codes even if not listed in their descriptions.