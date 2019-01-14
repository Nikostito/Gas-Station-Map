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

**Close and reopen terminal** then execute:
```
nvm install --lts
```
## Install the dependencies and devDependencies

Inside the app's root folder (/benzinadika/back-end) execute:

    npm install -d

## Start the server (simple)

Inside the app's root folder (/back-end) execute:

    node server.js

## Start the server (automated restart of the server after file changes)

    npm start

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
## In case of problems during nvm installation, make sure you have the following
    sudo apt-get install gcc
    sudo apt-get install g++
    sudo apt-get install python