from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class CustomUser(AbstractUser):
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.username


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
    current_value = models.DecimalField(max_digits=12, decimal_places=2)
    quarter = models.CharField(max_length=6)  # e.g., "Q1-25"
    start_date = models.DateField()

    def get_user(self):
        return settings.AUTH_USER_MODEL.objects.using('default').get(id=self.user_id)

    def profit_loss(self):
        return self.current_value - self.amount_invested

    def roi_percentage(self):
        if self.amount_invested > 0:
            return (self.profit_loss() / self.amount_invested) * 100
        return 0.00

    def __str__(self):
        try:
            return f"{self.get_user().username} - {self.quarter}"
        except Exception:
            return f"Investment for User ID {self.user_id} - {self.quarter}"

    class Meta:
        app_label = 'users'
        db_table = 'user_investment'
