@echo off

docker info > NUL 2>&1
if errorlevel 1 (
    echo Docker daemon is not running. Exiting...
    exit /b
)

cd prototype

docker stop text-application-prototype
docker rm text-application-prototype

docker rmi text-app

docker build -t text-app .
docker run --name text-application-prototype -d -p 5000:5000 text-app