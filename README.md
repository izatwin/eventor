# eventor
Social media site for finding events



## Mongodb
While developing locally, we can use a local docker container of mongodb.
To do this, you must install docker on [Mac](https://docs.docker.com/desktop/install/mac-install/) or [Windows](https://docs.docker.com/desktop/install/windows-install/)

I'm not sure if this will work, but see if you can run on the command line in this directory `docker compose up -d`.
If that does work, then mongodb is up and running and you can connect to it with javascript or using this [extension](https://open-vsx.org/vscode/item?itemName=mongodb.mongodb-vscode) for vscode with the url=`mongodb://127.0.0.1/eventor`

If that does not work, let Sean know so we can change this documentation, and then open docker desktop to search for the mongodb container. Create one, and copy the values from the `compose.yml` file in this directory. (mainly just the port and volumes are important)