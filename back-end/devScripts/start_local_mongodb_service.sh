#!/bin/bash
sudo service mongod start
echo "Wait 10 seconds. After that we'll have our mongo server ready...:"
sleep 10
sudo tail -n 1 /var/log/mongodb/mongod.log