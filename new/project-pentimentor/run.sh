#!/bin/bash

cd web-app || exit

sudo docker stop text-application-prototype
sudo docker rm text-application-prototype

sudo docker rmi text-app

sudo docker build -t text-app .
docker run --name text-application-prototype --network webapp_simplified -d -p 5000:5000 text-app