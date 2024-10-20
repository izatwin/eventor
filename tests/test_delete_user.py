# A Profile must be manually created before running this test.
import requests

BASE_URL = 'http://localhost:3001/api'
email = "srettig@purdue.edu"
password = "password"

def test_delete_user_wrong_password():
    session = requests.Session()
    login_payload = {"email": email, "password": password}

    response1 = session.post(BASE_URL + '/user/login', json=login_payload)

    assert(response1.json()["email"] == email)
    
    delete_payload = {"password": "hjdfjfgjfjfjhfjhf"}
    response2 = session.delete(BASE_URL + '/user/account', json=delete_payload)
    assert response2.status_code == 401


def test_delete_user():
    session = requests.Session()
    login_payload = {"email": email, "password": password}

    response1 = session.post(BASE_URL + '/user/login', json=login_payload)

    assert(response1.json()["email"] == email)
    
    delete_payload = {"password": password}
    response2 = session.delete(BASE_URL + '/user/account', json=delete_payload)
    assert response2.status_code == 200

    response3 = session.post(BASE_URL + '/user/login', json=login_payload)
    assert response3.status_code == 409
