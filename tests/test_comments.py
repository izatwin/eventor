# A Profile must be manually created before running this test.
import requests
import pytest

BASE_URL = 'http://localhost:3001/api'
email = "srettig@purdue.edu"
password = "password"

@pytest.fixture()
def create_session():
    session = requests.Session()
    login_payload = {"email": email, "password": password}

    response1 = session.post(BASE_URL + '/user/login', json=login_payload)

    assert(response1.json()["email"] == email)

    return session

@pytest.fixture()
def created_post_id(create_session):

    post_content = {"content": "python_test_comment", "is_event": False}
    response2 = create_session.post(f"{BASE_URL}/posts", json=post_content)
    assert response2.status_code == 200
    
    post_id = response2.json()["_id"]

    response3 = create_session.get(BASE_URL + f'/posts/{post_id}')

    assert(response3.json()["content"] == post_content["content"])
    yield post_id

    # Delete the created post
    response4 = create_session.delete(BASE_URL + f'/posts/{post_id}')
    assert response4.status_code == 200

@pytest.fixture()
def new_comment(create_session, created_post_id):
    comment = {"postId": created_post_id, "comment": {"text": "a comment here", "isRoot": True}}

    response1 = create_session.post(BASE_URL + '/comments/', json=comment)
    assert response1.status_code ==  200

    assert response1.json()["text"] == comment["comment"]["text"]

    comment_id = response1.json()["_id"]

    return comment_id


def test_create_comment(new_comment):
    assert new_comment is not None



def test_get_commment(new_comment, create_session):
    response2 = create_session.get(BASE_URL + f'/comments/{new_comment}')
    assert response2.status_code == 200

    assert response2.json()["text"] == "a comment here"

def test_get_commments(created_post_id, create_session):

    for i in range(10):
        comment = {"postId": created_post_id, "comment": {"text": f"comment {i}", "isRoot": True}}

        response1 = create_session.post(BASE_URL + '/comments/', json=comment)
        assert response1.status_code ==  200

        assert response1.json()["text"] == comment["comment"]["text"]

    response2 = create_session.get(BASE_URL + f'/comments/post/{created_post_id}')
    assert response2.status_code == 200

    assert len(response2.json()) == 10

def test_delete_comment(new_comment, create_session):
    response1 = create_session.delete(BASE_URL + f'/comments/{new_comment}')
    assert response1.status_code == 200

    response2 = create_session.get(BASE_URL + f'/comments/{new_comment}')
    assert response2.status_code == 404

def test_update_comment(new_comment, create_session):
    update_body = {"text": "this comment is different", "isRoot": False}
    response1 = create_session.put(BASE_URL + f'/comments/{new_comment}', json=update_body)
    assert response1.status_code == 200

    response2 = create_session.get(BASE_URL + f'/comments/{new_comment}')
    assert response2.status_code == 200

    assert response2.json()["text"] == update_body["text"]
    assert response2.json()["isRoot"] == update_body["isRoot"]

def test_add_child_comments(new_comment, create_session, created_post_id):
    
    for i in range(10):
        child_comment = {"postId": created_post_id, "comment": {"text": f"child_comment{i}_here", "isRoot": False}}

        response1 = create_session.post(BASE_URL + '/comments/', json=child_comment)
        assert response1.status_code ==  200

        assert response1.json()["text"] == child_comment["comment"]["text"]

        child_comment_id = response1.json()["_id"]
        payload = {"childId": child_comment_id}

        response2 = create_session.post(BASE_URL + f'/comments/addChild/{new_comment}', json=payload)
        assert response2.status_code == 200

        assert child_comment_id in response2.json()["comments"]
    
    response3 = create_session.get(BASE_URL + f'/comments/{new_comment}')
    assert response3.status_code == 200

    assert len(response3.json()["comments"]) == 10

def test_add_child_to_nonroot(new_comment, create_session, created_post_id):
    update_body = {"text": "this comment is different", "isRoot": False}
    response1 = create_session.put(BASE_URL + f'/comments/{new_comment}', json=update_body)
    assert response1.status_code == 200

    child_comment = {"postId": created_post_id, "comment": {"text": f"child_comment_here", "isRoot": False}}

    response2 = create_session.post(BASE_URL + '/comments/', json=child_comment)
    assert response2.status_code ==  200
    assert response2.json()["text"] == child_comment["comment"]["text"]

    child_comment_id = response2.json()["_id"]
    payload = {"childId": child_comment_id}

    response3 = create_session.post(BASE_URL + f'/comments/addChild/{new_comment}', json=payload)
    assert response3.status_code == 403

def test_like_comment(new_comment, create_session):
    response1 = create_session.get(BASE_URL + f"/comments/{new_comment}")
    assert response1.status_code == 200

    current_likes = response1.json()["likes"]

    like_payload = {"commentId": new_comment, "like": True}
    response2 = create_session.post(BASE_URL + "/comments/toggle-like", json=like_payload)
    assert response2.status_code == 200

    response3 = create_session.get(BASE_URL + f"/comments/{new_comment}")
    assert response3.json()["likes"] == current_likes + 1

    unlike_payload = {"commentId": new_comment, "like": False}
    response4 = create_session.post(BASE_URL + "/comments/toggle-like", json=unlike_payload)
    assert response4.status_code == 200

    response5 = create_session.get(BASE_URL + f"/comments/{new_comment}")
    assert response5.json()["likes"] == current_likes

