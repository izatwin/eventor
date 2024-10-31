# eventor
Social media site for finding events

## Starting up locally

### Requirements: 
- MongoDB (docker or otherwise)
- Nodejs (v20)

## Clone the Repo and setup environment
1. Run `git clone <url>`
2. Navigate to eventor repo and create the .env file:
	1. Insert into the file:
		```
	   PORT=3001
	   DB_CONNECTION="mongodb://127.0.0.1/my_database"
	   ```
#### Mongodb
While developing locally, we can use a local docker container of mongodb.

1. Install docker on [Mac](https://docs.docker.com/desktop/install/mac-install/) or [Windows](https://docs.docker.com/desktop/install/windows-install/) (or [Linux](https://docs.docker.com/engine/install/))
2. Navigate to the root eventor directory and run `docker compose up -d`
3. MongoDB should be up and running, and the webserver should be able to connect to it.

#### Node
We use npm to install our packages.
1. Navigate to root eventor folder and run `npm install`
2. Navigate to eventor/server and run `npm install`
3. Navigate to eventor/frontend and run `npm install`

### Start the webserver
We use npm commands to start the server:
1. Navigate to the root eventor folder
2. run `npm run dev`
3. Open [Eventor](http://localhost:3000/)!

## Testing
#### Manual
There are several test-cases we have created for this project:

[Sprint 1 Test Cases](/tests/Sprint_1_Test_Cases.md)

[Sprint 2 Test Cases](/tests/Sprint_2_Test_Cases.md)
#### Automated
1. Install a recent version of python
2. Navigate to eventor
3. Optional: Create a virtual environment
	1. in Eventor, run `python -m venv .venv`
	2. Activate the environment: `.venv/scripts/activate`
		1. or `source .venv/bin/activate` on linux
4. Install the requirements `pip install -r ./tests/requirements.txt`
5. An account must have already been created for the tests, and your email and password filled in in each test file
6. Run `pytest` and see the results!
	1. If you get `KeyError: "email"` Please check to make sure you have made an account and put the email and password in each python file.