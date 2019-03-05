#!/bin/bash
echo "Make sure mongodb is running!"
echo "Whole db will be wiped in 5 seconds!"
sleep 5
mongo --eval 'db.users.drop()'
mongo --eval 'db.products.drop()'
mongo --eval 'db.prices.drop()'
mongo --eval 'db.shops.drop()'