# Create your views here.
from django.urls import path

# In users/urls.py
from django.urls import path
from . import views

app_name = 'users'  # This creates a namespace for your URLs

urlpatterns = [
    path('', views.home, name='home'),
    path('settings/', views.user_settings, name='user_settings'),
    path('settings/change-password/', views.change_password, name='change_password'),
    path('dashboard/', views.investment_dashboard, name='investment_dashboard'),
    path('add-investment/', views.add_investment, name='add_investment'),
    path('investment-list/', views.investment_list, name='investment_list'),
    path('export-investments/', views.export_investments_csv, name='export_investments_csv'),
    # urls.py
    path('add-investment-summary/', views.add_investment_summary, name='add_investment_summary'),
    path('test/', views.test_view, name='test'),
    path('set-theme/', views.set_theme, name='set_theme'),
    path('join-waitlist/', views.join_waitlist, name='join_waitlist'),
    path('thank-you/', views.waitlist_thankyou, name='waitlist_thankyou'),
    # users/urls.py
    path('summaries/<int:user_id>/', views.get_user_summaries, name='get_user_summaries'),

    # path('profile/', views.profile, name='profile'),
    # path('settings/', views.settings, name='settings'),
    # Add more URL patterns as needed
]