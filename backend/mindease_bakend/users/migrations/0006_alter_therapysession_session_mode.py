# Generated by Django 5.0.6 on 2025-05-27 06:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_message'),
    ]

    operations = [
        migrations.AlterField(
            model_name='therapysession',
            name='session_mode',
            field=models.CharField(max_length=100),
        ),
    ]
