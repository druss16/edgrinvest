# users/forms.py
from django import forms
from .models import Investment, WaitlistSignup

# users/forms.py
from django import forms
from django.contrib.auth import get_user_model
from users.models import Investment, CustomUser  # Make sure this is your user model


CustomUser = get_user_model()

class UserSettingsForm(forms.ModelForm):
    password = forms.CharField(label='New Password', widget=forms.PasswordInput(), required=False)

    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'email']


class ChangePasswordForm(forms.Form):
    current_password = forms.CharField(label='Current Password', widget=forms.PasswordInput())
    new_password = forms.CharField(label='New Password', widget=forms.PasswordInput())
    confirm_password = forms.CharField(label='Confirm New Password', widget=forms.PasswordInput())

    def __init__(self, user, *args, **kwargs):
        super(ChangePasswordForm, self).__init__(*args, **kwargs)
        self.user = user

    def clean(self):
        cleaned_data = super().clean()
        current_password = cleaned_data.get('current_password')
        new_password = cleaned_data.get('new_password')
        confirm_password = cleaned_data.get('confirm_password')

        if not self.user.check_password(current_password):
            self.add_error('current_password', 'Current password is incorrect.')

        if new_password and len(new_password) < 8:
            self.add_error('new_password', 'New password must be at least 8 characters.')

        if new_password != confirm_password:
            self.add_error('confirm_password', 'New passwords do not match.')

        return cleaned_data


class InvestmentForm(forms.ModelForm):
    user = forms.ModelChoiceField(
        queryset=CustomUser.objects.all(),
        label="User (Email)",
        widget=forms.Select(attrs={'class': 'form-control'}),
        to_field_name='id'
    )

    class Meta:
        model = Investment
        fields = ['user', 'amount_invested', 'current_value', 'quarter', 'start_date']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'quarter': forms.TextInput(attrs={'placeholder': 'e.g., Q1-25'}),
            'amount_invested': forms.NumberInput(attrs={'step': '0.01'}),
            'current_value': forms.NumberInput(attrs={'step': '0.01'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.user_id = self.cleaned_data['user'].id
        if commit:
            instance.save()
        return instance


class WaitlistSignupForm(forms.ModelForm):
    class Meta:
        model = WaitlistSignup
        fields = ['full_name', 'email']
        widgets = {
            'full_name': forms.TextInput(attrs={'placeholder': 'Full Name', 'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'placeholder': 'Email Address', 'class': 'form-control'}),
        }

