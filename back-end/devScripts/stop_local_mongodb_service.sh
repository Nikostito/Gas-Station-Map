#!/bin/bash
sudo service mongod stop
sleep 2
sudo tail -n 1 /var/log/mongodb/mongod.log