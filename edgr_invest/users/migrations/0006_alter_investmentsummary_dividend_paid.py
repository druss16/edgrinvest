# Generated by Django 4.2.3 on 2025-04-30 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_investmentsummary_dividend_paid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='investmentsummary',
            name='dividend_paid',
        ),
        migrations.AddField(
            model_name='investmentsummary',
            name='dividend_paid',
            field=models.DecimalField(max_digits=12, decimal_places=2, default=0.00),
        ),
    ]
