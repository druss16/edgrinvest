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

from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user_display', 'balance', 'initial_investment')
    list_filter = ('balance',)
    search_fields = ('user_id',)
    readonly_fields = ('user_id',)

    fieldsets = (
        (None, {
            'fields': ('user_id', 'balance', 'initial_investment')
        }),
    )

    def user_display(self, obj):
        try:
            return obj.get_user().username
        except Exception:
            return f"User ID {obj.user_id}"
    user_display.short_description = 'User'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user_id')