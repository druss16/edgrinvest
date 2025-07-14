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
from django import forms
from django.contrib.auth import get_user_model
from .models import UserProfile

CustomUser = get_user_model()

class UserProfileAdminForm(forms.ModelForm):
    # Replace user_id with a ChoiceField for usernames
    user_id = forms.ChoiceField(
        choices=lambda: [(user.id, user.username) for user in CustomUser.objects.all()],
        label="User",
        help_text="Select a user by username."
    )

    class Meta:
        model = UserProfile
        fields = ['user_id', 'balance', 'initial_investment']

    def clean_user_id(self):
        # Convert the selected user_id (string from form) to integer
        return int(self.cleaned_data['user_id'])

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    form = UserProfileAdminForm
    list_display = ('user_display', 'balance', 'initial_investment')
    list_filter = ('balance',)
    search_fields = ('user_id',)
    readonly_fields = ('user_id',)  # Keep user_id read-only for edits

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