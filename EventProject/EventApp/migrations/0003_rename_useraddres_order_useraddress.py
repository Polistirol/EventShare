# Generated by Django 4.0.5 on 2022-08-25 15:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('EventApp', '0002_rename_desciption_item_description'),
    ]

    operations = [
        migrations.RenameField(
            model_name='order',
            old_name='userAddres',
            new_name='userAddress',
        ),
    ]
