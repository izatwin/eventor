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
    update_body = {"text": "this comment is different", "isRoot": True}
    response1 = create_session.put(BASE_URL + f'/comments/{new_comment}', json=update_body)
    assert response1.status_code == 200

    response2 = create_session.get(BASE_URL + f'/comments/{new_comment}')
    assert response2.status_code == 200

    assert response2.json()["text"] == update_body["text"]
    assert response2.json()["isRoot"] == update_body["isRoot"]