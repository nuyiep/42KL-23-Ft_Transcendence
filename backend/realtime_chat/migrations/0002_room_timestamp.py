# Generated by Django 5.0.6 on 2024-10-14 08:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('realtime_chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
