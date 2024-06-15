FROM python:3.12-alpine
WORKDIR /home/nwai-kea/42KL-23-Ft_Transcendence/services/django/
RUN pip install --upgrade pip
COPY . .
RUN pip install -r requirements.txt


CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
