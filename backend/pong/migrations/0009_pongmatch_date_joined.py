# Generated by Django 5.0.7 on 2024-11-13 07:59

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0008_remove_pongmatch_local'),
    ]

    operations = [
        migrations.AddField(
            model_name='pongmatch',
            name='date_joined',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
