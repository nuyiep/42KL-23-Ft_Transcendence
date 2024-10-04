# Generated by Django 5.0.7 on 2024-10-25 15:12

import django.core.validators
import user_management.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_management', '0003_customuser_avatar_img'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar_img',
            field=models.ImageField(blank=True, null=True, upload_to=user_management.models.user_avatar_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])]),
        ),
    ]