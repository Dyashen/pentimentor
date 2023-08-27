@echo off

cd prototype
docker stop text-application-prototype
docker rm text-application-prototype

docker rmi text-app

docker build -t text-app .
docker run --name text-application-prototype -d -p 5000:5000 text-app

pause