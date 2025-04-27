# Create your views here.
from django.urls import path

# In users/urls.py
from django.urls import path
from . import views

app_name = 'users'  # This creates a namespace for your URLs

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.investment_dashboard, name='investment_dashboard'),
    path('add-investment/', views.add_investment, name='add_investment'),
    path('investment-list/', views.investment_list, name='investment_list'),
    path('export-investments/', views.export_investments_csv, name='export_investments_csv'),
    # path('profile/', views.profile, name='profile'),
    # path('settings/', views.settings, name='settings'),
    # Add more URL patterns as needed
]