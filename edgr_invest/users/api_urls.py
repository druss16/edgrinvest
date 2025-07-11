from django.urls import path
from . import views
from users.views import FinalWaitlistApiView, PasswordResetView, PasswordResetConfirmView

app_name = 'users'

urlpatterns = [
    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('team/', views.TeamListView.as_view(), name='team-list'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('investments/', views.InvestmentListView.as_view(), name='investment-list'),
    path('summaries/', views.InvestmentSummaryListView.as_view(), name='summary-list'),
    path('summaries-deux/', views.InvestmentSummaryDeuxListView.as_view(), name='summary-deux-list'),
    path('performance/', views.PerformanceView.as_view(), name='performance'),
    path('roi-growth/', views.RoiGrowthView.as_view(), name='roi-growth'),
    path('login/', views.CustomAuthToken.as_view(), name='login'),
    path('signup/', views.SignUpView.as_view(), name='signup'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('export-investments/', views.ExportInvestmentsView.as_view(), name='export-investments'),
    path('edit-investment-summary/<int:pk>/', views.EditInvestmentSummaryView.as_view(), name='edit-investment-summary'),
    path('set-theme/', views.SetThemeView.as_view(), name='set-theme'),
    path('user-summaries/<int:user_id>/', views.GetUserSummariesView.as_view(), name='user-summaries'),
    path('get-csrf-token/', views.GetCsrfTokenView.as_view(), name='get-csrf-token'),
    path('waitlist/', FinalWaitlistApiView.as_view(), name='waitlist-signup'),
    path('waitlist-test/', views.WaitlistTest.as_view(), name='waitlist-test'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

]