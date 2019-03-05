#!/bin/bash
echo "Make sure back-end and mongoDB are running!"
curl -i -k -X POST -H 'Content-Type: application/json' -d '{"username": "admin", "password": "admin"}' https://localhost:8765/observatory/api/signup
sleep 3
mongo --eval 'db.users.update({username: "admin"}, {$set:{admin:true}})'