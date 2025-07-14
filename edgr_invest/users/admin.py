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


from django.contrib import admin
from .models import UserProfile, Investment
from .forms import InvestmentAdminForm
import re

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    form = InvestmentAdminForm
    list_display = ('user_display', 'amount_invested', 'start_date')
    list_filter = ('start_date',)
    search_fields = ('user_id',)
    list_display_links = ('user_display',)

    fieldsets = (
        (None, {
            'fields': ('user_id', 'amount_invested', 'start_date')
        }),
    )

    def user_display(self, obj):
        try:
            return obj.get_user().username
        except Exception:
            return f"User ID {obj.user_id}"
    user_display.short_description = 'User'

    def get_readonly_fields(self, request, obj=None):
        return ['user_id'] if obj else []