# Generated by Django 5.0.7 on 2024-11-05 20:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lobby', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lobbymodel',
            name='is_tournament',
            field=models.BooleanField(default=False),
        ),
    ]
