# 42KL-23-Ft_Transcendence

Final project at 42KL Core's Programme.

This project is about creating a website for the mighty Pong contest!

![login](https://github.com/user-attachments/assets/88dfcfcd-0844-4a23-878c-e1e247b02007)

_____

## Features
* User Management
* Game

_______
## Tech Stack
Backend: Python, Django

________
## Dependencies
Docker, docker-compose, Makefile

______
## Docker Setup
If you just want to get stuff up and running, just run the following:
```sh
make
```
This will build the Django image and set up all the containers.

To check the status of the containers, run:
```sh
docker compose ps
```

To stop the containers, do:
```sh
make down
```

Additionally, if you want to clean up the images, do:
```sh
make fclean
```

If you want to clean up the images and rebuild at the same time, run:
```sh
make re
```

______
## Running Django without Docker
> This is only useful if you don't want to bother with using Docker to run Django.

A quick preface:
I recommend using a Python environment before doing the following steps.
If you don't know what that is, look up `venv`.

```sh
# First, make sure your current directory is in "./backend"
$ cd backend

# Then install the backend dependencies
$ pip install -r ./backend/requirements.txt

# After that, start up django
$ ./manage.py runserver

# alternatively
$ python manage.py runserver
```
