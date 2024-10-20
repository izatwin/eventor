# A Profile must be manually created before running this test.
import requests

BASE_URL = 'http://localhost:3001/api'
email = "srettig@purdue.edu"
password = "password"

def test_edit_bio():
    session = requests.Session()
    login_payload = {"email": email, "password": password}

    response1 = session.post(BASE_URL + '/user/login', json=login_payload)

    assert(response1.json()["email"] == email)
    

    biography_edit = "changed biography"
    delete_payload = {"biography": biography_edit}
    response2 = session.post(f"{BASE_URL}/user/{response1.json()["userId"]}/biography", json=delete_payload)
    assert response2.status_code == 200

    response3 = session.get(BASE_URL + '/user/validate')

    assert(response3.json()["user-info"]["biography"] == biography_edit)


def test_edit_status():
    session = requests.Session()
    login_payload = {"email": email, "password": password}

    response1 = session.post(BASE_URL + '/user/login', json=login_payload)

    assert(response1.json()["email"] == email)
    

    status_edit = "changed status"
    delete_payload = {"status": status_edit}
    response2 = session.post(f"{BASE_URL}/user/{response1.json()["userId"]}/status", json=delete_payload)
    assert response2.status_code == 200

    response3 = session.get(BASE_URL + '/user/validate')

    assert(response3.json()["user-info"]["status"] == status_edit)

def test_edit_picture_url():
    session = requests.Session()
    login_payload = {"email": email, "password": password}

    response1 = session.post(BASE_URL + '/user/login', json=login_payload)

    assert(response1.json()["email"] == email)
    

    image_edit = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Brad_Pitt_June_2014_(cropped).jpg/237px-Brad_Pitt_June_2014_(cropped).jpg"
    delete_payload = {"imageURL": image_edit}
    response2 = session.post(f"{BASE_URL}/user/{response1.json()["userId"]}/image", json=delete_payload)
    assert response2.status_code == 200

    response3 = session.get(BASE_URL + '/user/validate')

    assert(response3.json()["user-info"]["imageURL"] == image_edit)