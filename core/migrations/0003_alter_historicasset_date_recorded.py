# Generated by Django 5.2 on 2025-06-01 11:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_historicasset'),
    ]

    operations = [
        migrations.AlterField(
            model_name='historicasset',
            name='date_recorded',
            field=models.DateTimeField(),
        ),
    ]
