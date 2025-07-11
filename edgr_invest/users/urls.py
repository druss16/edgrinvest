# users/urls.py
from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'users'

urlpatterns = [
    path('', views.redirect_to_react, name='home'),
    path('dashboard/', views.redirect_to_react, name='investment_dashboard'),
    path('settings/', views.redirect_to_react, name='user_settings'),
    path('password_reset/', views.redirect_to_react, name='password_reset'),
    path('waitlist/', views.redirect_to_react, name='join_waitlist'),
    path('waitlist-thankyou/', views.redirect_to_react, name='waitlist_thankyou'),
    
    path('get-csrf/', views.get_csrf_token, name="get-csrf"),
    path('add-investment-summary/', views.add_investment_summary_api, name='add_investment_summary'),
    
    path('investment-list/', views.redirect_to_react, name='investment_list'),
    path('edit-investment-summary/<int:pk>/', views.redirect_to_react, name='edit_investment_summary'),

    path(
        'reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='account/password_reset_confirm.html'
        ),
        name='password_reset_confirm'
    ),
    path(
        'reset/done/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='account/password_reset_complete.html'
        ),
        name='password_reset_complete'
    ),
]
