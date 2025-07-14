from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class CustomUser(AbstractUser):
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.username

class WaitlistSignup(models.Model):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    class Meta:
        app_label = 'users'
        db_table = 'waitlist_signup'

class UserProfile(models.Model):
    user_id = models.BigIntegerField(db_index=True, unique=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    initial_investment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # NEW

    def get_user(self):
        return settings.AUTH_USER_MODEL.objects.using('default').get(id=self.user_id)

    def __str__(self):
        try:
            return f"{self.get_user().username}'s Profile"
        except Exception:
            return f"Profile for User ID {self.user_id}"

    class Meta:
        app_label = 'users'
        db_table = 'user_profile'



class Investment(models.Model):
    user_id = models.BigIntegerField(db_index=True)
    amount_invested = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()

    def get_user(self):
        return settings.AUTH_USER_MODEL.objects.using('default').get(id=self.user_id)

    def __str__(self):
        try:
            return f"{self.get_user().username} - {self.start_date.strftime('%Y-%m-%d')}"
        except Exception:
            return f"Investment for User ID {self.user_id} - {self.start_date.strftime('%Y-%m-%d')}"

    class Meta:
        app_label = 'users'
        db_table = 'user_investment'

# users/models.py

from django.db import models
from django.conf import settings


class InvestmentSummary(models.Model):
    user_id = models.BigIntegerField(db_index=True)
    quarter = models.CharField(max_length=6)  # e.g., "Q2-25"
    beginning_balance = models.DecimalField(max_digits=12, decimal_places=2)
    dividend_percent = models.DecimalField(max_digits=5, decimal_places=2)
    dividend_amount = models.DecimalField(max_digits=12, decimal_places=2)
    rollover_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # updated
    dividend_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # updated
    ending_balance = models.DecimalField(max_digits=12, decimal_places=2)
    date_created = models.DateTimeField(auto_now_add=True)

    def get_user(self):
        return settings.AUTH_USER_MODEL.objects.using('default').get(id=self.user_id)

    def __str__(self):
        try:
            return f"{self.get_user().username} - {self.quarter} Summary"
        except Exception:
            return f"Summary for User ID {self.user_id} - {self.quarter}"

    class Meta:
        app_label = 'users'
        db_table = 'investment_summary'
        ordering = ['-quarter']


class InvestmentSummaryDeux(models.Model):
    user_id = models.BigIntegerField(db_index=True)
    quarter = models.CharField(max_length=15)  # e.g., "Q2-25"
    beginning_balance = models.DecimalField(max_digits=12, decimal_places=2)
    dividend_percent = models.DecimalField(max_digits=5, decimal_places=2)
    dividend_amount = models.DecimalField(max_digits=12, decimal_places=2)
    unrealized_gain = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # new field
    dividend_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    ending_balance = models.DecimalField(max_digits=12, decimal_places=2)
    date_created = models.DateTimeField(auto_now_add=True)

    def get_user(self):
        return settings.AUTH_USER_MODEL.objects.using('default').get(id=self.user_id)

    def __str__(self):
        try:
            return f"{self.get_user().username} - {self.quarter} Summary"
        except Exception:
            return f"Summary for User ID {self.user_id} - {self.quarter}"

    class Meta:
        app_label = 'users'
        db_table = 'investment_summary_deux'
        ordering = ['-quarter']
