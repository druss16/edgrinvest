# users/forms.py
from django import forms
from .models import Investment

class InvestmentForm(forms.ModelForm):
    class Meta:
        model = Investment
        fields = ['user_id', 'amount_invested', 'current_value', 'quarter', 'start_date']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),  # HTML5 date picker
            'quarter': forms.TextInput(attrs={'placeholder': 'e.g., Q1-25'}),
            'amount_invested': forms.NumberInput(attrs={'step': '0.01'}),
            'current_value': forms.NumberInput(attrs={'step': '0.01'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})  # Bootstrap styling