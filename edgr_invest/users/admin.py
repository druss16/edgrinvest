from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, InvestmentSummary


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('bio',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'is_staff', 'is_active',
            ),
        }),
    )

# users/admin.py

@admin.register(InvestmentSummary)
class InvestmentSummaryAdmin(admin.ModelAdmin):
    list_display = ['get_user_email', 'quarter', 'ending_balance']

    def get_user_email(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            return User.objects.get(id=obj.user_id).email
        except User.DoesNotExist:
            return "Unknown"

    get_user_email.short_description = "User Email"
