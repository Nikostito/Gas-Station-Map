Note to developers
========================

A quick setup guide (based on a clean Ubuntu 18.04.1 LTS)

## Getting the files thru Git(first time)
Install git:
```
sudo apt-get update
sudo apt-get install git-core
```
Make sure to set your name/email **exactly** the same as your gitlab account:
```
git config --global user.name "testuser"
git config --global user.email "testuser@example.com"
```
Get the files:
```
git clone https://gitlab.com/bits-please-softeng18/benzinadika.git
```
## Getting the files thru Git(already have cloned the repository)

    git pull

## Nodejs and npm

First, download nvm:

    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

after it's finished downloading **close and reopen terminal** then execute:
```
nvm install --lts
```
## Install the dependencies and devDependencies

Inside the app's root folder (/benzinadika/back-end) execute:

    npm install -d

## Install mongodb server locally

Follow this link: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

## Start/Stop local mongodb server

Start script:

    ./devScripts/start_local_mongodb_service.sh

Stop script:

    ./devScripts/stop_local_mongodb_service.sh

## Choosing an online mongodb service

Edit the **MONGODB_CONNECTION_URL** attribute in **nodemon.json** (see below)

## Start the server (server autorestarts after file changes)

    npm start

## nodemon.json

Environment variables (e.g.: process.env.PORT) go in this file. **Changing those will require ***manual*** restart of the server**, that mean stopping nodemon (CTRL+C) and firing it up again. 

## Simple test

Go to:

    http://localhost:8765/observatory/api/products

You should see text in JSON format:
```json
message	"GEEEET"
lol	"d"
```

## Recommended editor
    https://code.visualstudio.com/docs/setup/linux
## Recommended api tester tool (non automated)
    postman
## Recommended Tutorials
    https://www.youtube.com/watch?v=0oXYLzuucwE&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q
## Recommended local mongodb service GUI (choose community edition)
    https://docs.mongodb.com/compass/current/
## In case of problems during nvm installation, make sure you have the following
    sudo apt-get install gcc
    sudo apt-get install g++
    sudo apt-get install python