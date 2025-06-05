# users/forms.py
from django import forms
from .models import Investment, WaitlistSignup

# users/forms.py
from django import forms
from django.contrib.auth import get_user_model
from users.models import Investment, CustomUser  # Make sure this is your user model
from django import forms
from users.models import InvestmentSummary, CustomUser


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


# users/forms.py

from django import forms
from users.models import InvestmentSummary, CustomUser

from django import forms
from users.models import InvestmentSummary, CustomUser, InvestmentSummaryDeux

# class InvestmentSummaryForm(forms.ModelForm):
#     user = forms.ModelChoiceField(
#         queryset=CustomUser.objects.all(),
#         label="User (Email)",
#         to_field_name='id',
#         widget=forms.Select(attrs={'class': 'form-control'})
#     )

#     class Meta:
#         model = InvestmentSummary
#         fields = [
#             'user', 'quarter', 'beginning_balance',
#             'dividend_percent', 'dividend_amount',
#             'rollover_paid', 'dividend_paid', 'ending_balance'
#         ]
#         widgets = {
#             'quarter': forms.TextInput(attrs={
#                 'placeholder': 'e.g., Q2-25',
#                 'class': 'form-control'
#             }),
#             'beginning_balance': forms.NumberInput(attrs={
#                 'step': '0.01',
#                 'class': 'form-control'
#             }),
#             'dividend_percent': forms.NumberInput(attrs={
#                 'step': '0.01',
#                 'class': 'form-control'
#             }),
#             'dividend_amount': forms.NumberInput(attrs={
#                 'step': '0.01',
#                 'class': 'form-control'
#             }),
#             'rollover_paid': forms.NumberInput(attrs={
#                 'step': '0.01',
#                 'class': 'form-control',
#                 'placeholder': 'e.g., 250.00'
#             }),
#             'dividend_paid': forms.NumberInput(attrs={
#                 'step': '0.01',
#                 'class': 'form-control',
#                 'placeholder': 'e.g., 250.00'
#             }),
#             'ending_balance': forms.NumberInput(attrs={
#                 'step': '0.01',
#                 'class': 'form-control'
#             }),
#         }

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         # Apply fallback Bootstrap class
#         for field in self.fields.values():
#             field.widget.attrs.setdefault('class', 'form-control')

#     def save(self, commit=True):
#         instance = super().save(commit=False)
#         instance.user_id = self.cleaned_data['user'].id
#         # Ensure defaulting to 0.00 if not filled
#         instance.dividend_paid = instance.dividend_paid or 0.00
#         instance.rollover_paid = instance.rollover_paid or 0.00
#         if commit:
#             instance.save()
#         return instance


class InvestmentSummaryForm(forms.ModelForm):
    user = forms.ModelChoiceField(
        queryset=CustomUser.objects.all(),
        label="User (Email)",
        to_field_name='id',
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = InvestmentSummaryDeux
        fields = [
            'user', 'quarter', 'beginning_balance',
            'dividend_percent', 'dividend_amount',
            'dividend_paid', 'unrealized_gain', 'ending_balance'
        ]

        widgets = {
            'quarter': forms.TextInput(attrs={
                'placeholder': 'e.g., Q2-25',
                'class': 'form-control'
            }),
            'beginning_balance': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'dividend_percent': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'dividend_amount': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'unrealized_gain': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),  # new
            'dividend_paid': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'ending_balance': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.setdefault('class', 'form-control')

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.user_id = self.cleaned_data['user'].id
        instance.dividend_paid = instance.dividend_paid or 0.00
        instance.unrealized_gain = instance.unrealized_gain or 0.00
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

