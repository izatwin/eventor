# eventor
Social media site for finding events




## Starting up locally
### Requirements: 
- MongoDB (docker or otherwise)
- Nodejs (v20)
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