# Generated by Django 5.0.4 on 2024-04-29 19:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('GCP', '0003_tasks_end_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tasks',
            name='duration',
        ),
    ]
