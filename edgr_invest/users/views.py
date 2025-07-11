# users/views.py
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect
from .models import Investment, UserProfile
from .forms import InvestmentSummaryForm
import json
from decimal import Decimal
from rest_framework.permissions import AllowAny  # Import AllowAny

from django.core.mail import send_mail
from django.contrib import messages
from .forms import WaitlistSignupForm

from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class WaitlistTest(APIView):
    def get(self, request):
        return Response({"message": "This is working"})



# In users/views.py
def home(request):
    # Create a context dictionary
    context = {
        # Add any variables you want to pass to the template
        'title': 'User Home',
        'welcome_message': 'Welcome to your dashboard'
    }
    
    # Then pass it to the template
    return render(request, 'users/home.html', context)


def test_view(request):
    return render(request, 'users/test.html')


# users/views.py
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect
from .forms import UserSettingsForm
from django.contrib.auth import update_session_auth_hash


@login_required
def user_settings(request):
    user = request.user
    if request.method == 'POST':
        form = UserSettingsForm(request.POST, instance=user)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # <- Keeps user logged in
            messages.success(request, "Your settings have been updated.")
            return redirect('users:home')  # Redirect wherever you want

    else:
        form = UserSettingsForm(instance=user)

    return render(request, 'users/user_settings.html', {'form': form})





# yourapp/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

@require_POST
@csrf_exempt  # Use with caution; ideally, ensure CSRF token is sent
def set_theme(request):
    data = json.loads(request.body)
    theme = data.get('theme', 'light')
    request.session['theme'] = theme
    return JsonResponse({'status': 'success', 'theme': theme})


# def join_waitlist(request):
#     if request.method == 'POST':
#         form = WaitlistSignupForm(request.POST)
#         if form.is_valid():
#             signup = form.save()

#             # Send email notification
#             send_mail(
#                 'New Waitlist Signup - EdgrInvest',
#                 f'New signup:\n\nName: {signup.full_name}\nEmail: {signup.email}',
#                 'no-reply@yourdomain.com',  # FROM email
#                 ['youremail@yourdomain.com'],  # TO email (your admin email)
#                 fail_silently=False,
#             )

#             messages.success(request, 'Thank you for joining the waitlist!')
#             return redirect('users:waitlist_thankyou')
#     else:
#         form = WaitlistSignupForm()

#     return render(request, 'users/join_waitlist.html', {'form': form})



def waitlist_thankyou(request):
    return render(request, 'users/thankyou.html')


from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from users.models import InvestmentSummary


from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from users.models import InvestmentSummary

from django.db.models import IntegerField, Case, When, Value
from django.db.models.functions import Substr, Cast, Concat

from django.db.models import IntegerField, Case, When, Value
from django.db.models.functions import Substr, Cast
from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from users.models import InvestmentSummary

from django.contrib.auth.decorators import login_required
from django.db.models import IntegerField, Case, When, Value
from django.db.models.functions import Substr, Cast
from django.shortcuts import render
from decimal import Decimal
from users.models import InvestmentSummary, InvestmentSummaryDeux


from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import InvestmentSummaryDeux

@login_required
def investment_dashboard(request):
    summaries = InvestmentSummaryDeux.objects.filter(user_id=request.user.id).order_by('quarter')

    initial_investment = Decimal(0)
    total_dividend_paid = Decimal(0)
    total_unrealized_gain = Decimal(0)
    cumulative_profit = Decimal(0)
    portfolio_value_data = []
    chart_labels = []

    for summary in summaries:
        if summary.dividend_paid == 0:
            initial_investment += summary.beginning_balance

        total_dividend_paid += summary.dividend_paid
        total_unrealized_gain += summary.unrealized_gain
        cumulative_profit = total_dividend_paid + total_unrealized_gain
        portfolio_value_data.append(float(initial_investment + cumulative_profit))  # Convert to float
        chart_labels.append(summary.quarter)

    total_profit = total_dividend_paid + total_unrealized_gain
    total_portfolio_value = initial_investment + total_profit
    roi_percentage = (total_profit / initial_investment * 100) if initial_investment > 0 else 0

    roi_growth_labels = ['Initial Investment'] + [s.quarter for s in summaries]
    # roi_growth_data = [0] + [
    #     float(round(
    #         ((s.dividend_paid + s.unrealized_gain - s.beginning_balance) / s.beginning_balance * 100)
    #         if s.beginning_balance > 0 else 0, 2
    #     )) for s in summaries
    # ]

    # roi_growth_data = [
    #     float(round(((s.ending_balance - s.beginning_balance) / s.beginning_balance * 100), 2))
    #     if s.beginning_balance > 0 else 0
    #     for s in summaries
    # ]

    roi_growth_data = [
        0,  # baseline
        float(round((total_profit / initial_investment * 100), 2)) if initial_investment > 0 else 0
    ]



    context = {
        'username': request.user.username,
        'investment_summaries': summaries,
        'balance': float(initial_investment + total_profit),
        'initial_investment_amount': float(initial_investment),
        'dividend_paid': float(total_dividend_paid),
        'unrealized_gain': float(total_unrealized_gain),
        'profit': float(total_profit),
        'total_portfolio_value': float(total_portfolio_value),
        'roi_percentage': float(roi_percentage),
        'performance_chart_labels': ['Initial Investment'] + chart_labels,
        'performance_chart_data': [float(initial_investment)] + portfolio_value_data,
        'roi_growth_labels': json.dumps(roi_growth_labels),
        'roi_growth_data': json.dumps(roi_growth_data),




    }

    return render(request, 'users/dashboard.html', context)



@login_required
def export_investments_csv(request):
    # Create the HttpResponse object with the appropriate CSV header
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="investment_report.csv"'
    
    # Create a CSV writer using the HttpResponse as the "file"
    writer = csv.writer(response)
    
    # Write the header row
    writer.writerow(['Quarter', 'Invested ($)', 'Current Value ($)', 'Profit/Loss ($)', 'ROI (%)'])
    
    # Get the data from the database
    investments = Investment.objects.filter(user_id=request.user.id).order_by('-quarter')
    
    # Write data rows
    for investment in investments:
        writer.writerow([
            investment.quarter,
            investment.amount_invested,
            investment.current_value,
            investment.profit_loss,
            investment.roi_percentage
        ])
    
    return response



@staff_member_required
def add_investment(request):
    if request.method == 'POST':
        form = InvestmentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('users:investment_list')  # Redirect to a list view (defined below)
    else:
        form = InvestmentForm()
    
    return render(request, 'users/add_investment.html', {'form': form})

from django.contrib.auth import get_user_model

@staff_member_required
def investment_list(request):
    investments = Investment.objects.all().order_by('-quarter')
    User = get_user_model()
    user_map = {user.id: user.email for user in User.objects.all()}
    return render(request, 'users/investment_list.html', {
        'investments': investments,
        'user_map': user_map
    })


# # users/views.py
# @staff_member_required
# def add_investment_summary(request):
#     form = InvestmentSummaryForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('users:investment_dashboard')
#     return render(request, 'users/add_investment_summary.html', {'form': form})


# users/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_protect
from users.forms import InvestmentSummaryForm
from django.contrib.admin.views.decorators import staff_member_required


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# @csrf_protect
# def add_investment_summary_api(request):
#     if not request.user.is_staff:
#         return Response({'detail': 'Only staff members can submit summaries.'}, status=403)

#     form = InvestmentSummaryForm(request.data)
#     if form.is_valid():
#         form.save()
#         return Response({'message': 'Investment summary saved successfully.'}, status=status.HTTP_201_CREATED)
#     return Response({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)

# users/views.py
from django.http import JsonResponse
from users.models import InvestmentSummary

from django.http import JsonResponse
from users.models import InvestmentSummary

from django.http import JsonResponse
from users.models import InvestmentSummary

def get_user_summaries(request, user_id):
    summaries = InvestmentSummary.objects.filter(user_id=user_id).order_by('quarter')
    data = []

    for s in summaries:
        data.append({
            'id': s.id,
            'quarter': s.quarter,
            'beg_bal': float(s.beginning_balance),
            'div_pct': float(s.dividend_percent),
            'div_amt': float(s.dividend_amount),
            'rollover_paid': float(s.rollover_paid),
            'dividend_paid': float(s.dividend_paid),
            'end_bal': float(s.ending_balance),
        })


    return JsonResponse({'summaries': data})


from django.shortcuts import get_object_or_404, redirect
from .models import InvestmentSummary
from .forms import InvestmentSummaryForm

@login_required
def edit_investment_summary(request, pk):
    summary = get_object_or_404(InvestmentSummary, pk=pk)

    if request.method == 'POST':
        form = InvestmentSummaryForm(request.POST, instance=summary)
        if form.is_valid():
            form.save()
            return redirect('users:investment_dashboard')  # or wherever you want to go after saving
    else:
        form = InvestmentSummaryForm(instance=summary)

    return render(request, 'users/edit_investment_summary.html', {
        'form': form,
        'summary': summary,
    })



## API VIEWS ##

from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout, authenticate
from django.http import HttpResponse
from django.shortcuts import redirect
import csv
from decimal import Decimal
from .serializers import (
    ServiceSerializer, TeamMemberSerializer, WaitlistSignupSerializer,
    CustomUserSerializer, InvestmentSerializer, InvestmentSummarySerializer,
    InvestmentSummaryDeuxSerializer, InvestmentSummaryForm
)
from .models import WaitlistSignup, CustomUser, Investment, InvestmentSummary, InvestmentSummaryDeux
import logging

from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout, authenticate
from django.middleware.csrf import get_token
from django.contrib import messages
from django.core.mail import send_mail
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from decimal import Decimal
import json
import csv
import logging
from .models import Investment, UserProfile, WaitlistSignup, CustomUser, InvestmentSummary, InvestmentSummaryDeux
from .forms import InvestmentSummaryForm, UserSettingsForm, WaitlistSignupForm
from .serializers import (
    ServiceSerializer, TeamMemberSerializer, WaitlistSignupSerializer,
    CustomUserSerializer, InvestmentSerializer, InvestmentSummarySerializer,
    InvestmentSummaryDeuxSerializer
)

logger = logging.getLogger(__name__)

# @staff_member_required
# def add_investment_summary(request):
#     form = InvestmentSummaryForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('users:investment_dashboard')
#     return render(request, 'users/add_investment_summary.html', {'form': form})

class InvestmentSummaryDeuxListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching InvestmentSummaryDeux for user ID: {request.user.id}")
            summaries = InvestmentSummaryDeux.objects.filter(user_id=request.user.id).order_by('-quarter')
            serializer = InvestmentSummaryDeuxSerializer(summaries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in InvestmentSummaryDeuxListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class AddInvestmentSummaryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            print("✅ Authenticated User:", request.user)
            print("✅ Is Staff:", request.user.is_staff)

            if not request.user or not request.user.is_staff:
                return Response({"error": "Permission denied"}, status=403)

            data = request.data.copy()
            data['user_id'] = request.user.id

            serializer = InvestmentSummaryDeuxSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Investment summary added successfully"}, status=201)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching profile for user ID: {request.user.id}")
            user = CustomUser.objects.get(id=request.user.id)
            serializer = CustomUserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            logger.error(f"CustomUser not found for user ID: {request.user.id}")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in ProfileView: {str(e)}", exc_info=True)
            return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            if CustomUser.objects.filter(username=username).exists():
                logger.warning(f"Signup attempt with existing username: {username}")
                return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            user = CustomUser.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            logger.info(f"User {username} signed up successfully")
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error in SignUpView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SummariesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching summaries for user ID: {request.user.id}")
            summaries = InvestmentSummaryDeux.objects.filter(user_id=request.user.id).order_by('-quarter')
            serializer = InvestmentSummaryDeuxSerializer(summaries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in SummariesView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching performance data for user ID: {request.user.id}")
            investments = Investment.objects.filter(user_id=request.user.id).order_by('start_date')
            initial_investment = float(sum(investment.amount_invested for investment in investments) or 0)
            labels = ['Initial'] + [inv.quarter for inv in investments]
            data = [initial_investment] + [float(inv.current_value) for inv in investments]
            return Response({"labels": labels, "data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in PerformanceView: {str(e)}", exc_info=True)
            return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RoiGrowthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching ROI growth for user ID: {request.user.id}")
            summaries = InvestmentSummaryDeux.objects.filter(user_id=request.user.id).order_by('date_created')
            initial_investment = float(sum(inv.amount_invested for inv in Investment.objects.filter(user_id=request.user.id)) or 0)
            labels = ['Initial'] + [summary.quarter for summary in summaries]
            data = [0.0]
            cumulative_profit = 0
            for summary in summaries:
                cumulative_profit += float(summary.dividend_paid + summary.unrealized_gain)
                roi = (cumulative_profit / initial_investment * 100) if initial_investment > 0 else 0
                data.append(round(roi, 2))
            return Response({"labels": labels, "data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in RoiGrowthView: {str(e)}", exc_info=True)
            return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ServiceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            logger.info("Fetching services list")
            services = [
                {"title": "Investment Management", "description": "Comprehensive portfolio management services."},
                {"title": "Wealth Advisory", "description": "Strategic wealth planning for high-net-worth individuals."},
                {"title": "Risk Management", "description": "Advanced risk assessment and mitigation strategies."},
                {"title": "Global Markets", "description": "Access to international investment opportunities."},
            ]
            serializer = ServiceSerializer(services, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in ServiceListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            logger.info("Fetching team list")
            team = [
                {"name": "Michael Chen", "role": "Managing Partner", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"},
                {"name": "Sarah Williams", "role": "Head of Investment Strategy", "image": "https://images.unsplash.com/photo-1494790108755-2616b612b786"},
                {"name": "David Rodriguez", "role": "Senior Portfolio Manager", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"},
            ]
            serializer = TeamMemberSerializer(team, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in TeamListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import WaitlistSignupSerializer
import logging

logger = logging.getLogger(__name__)

from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import WaitlistSignupSerializer
import logging

logger = logging.getLogger(__name__)

from rest_framework.views import APIView
from rest_framework.response import Response

from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class FinalWaitlistApiView(APIView):
    permission_classes = [AllowAny]  # Allow non-authenticated users

    def post(self, request):
        data = request.data
        full_name = data.get('full_name')
        email = data.get('email')

        if not full_name or not email:
            return Response({'error': 'Full name and email are required.'}, status=400)

        # ✅ Save to DB
        try:
            WaitlistSignup.objects.create(full_name=full_name, email=email)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

        return Response({'message': 'Successfully joined waitlist!'}, status=201)


from .serializers import PasswordResetSerializer

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.forms import PasswordResetForm
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        form = PasswordResetForm({'email': email})

        if form.is_valid():
            form.save(
                request=request,
                use_https=True,
                from_email='noreply@edgrinvest.com',
                domain_override='edgrinvest.com',
                email_template_name='account/password_reset_email.html',
                subject_template_name='account/password_reset_subject.txt',
                # html_email_template_name='account/password_reset_email.html',  # Explicitly set HTML template
            )
            return Response({"message": "Password reset link sent"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Email not found or invalid."}, status=status.HTTP_400_BAD_REQUEST)


from django.contrib.auth.forms import PasswordResetForm
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        form = PasswordResetForm({'email': email})
        if form.is_valid():
            form.save(
                request=request,
                use_https=request.is_secure(),
                email_template_name='account/password_reset_email.html',  # ✅ Custom email template
                subject_template_name='account/password_reset_subject.txt',  # Optional
                from_email=None,
            )
            return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)
UserModel = get_user_model()

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)
UserModel = get_user_model()

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password1 = request.data.get('new_password1')
        new_password2 = request.data.get('new_password2')

        if not all([uidb64, token, new_password1, new_password2]):
            logger.warning('Password reset failed: missing required fields')
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password1 != new_password2:
            logger.warning('Password reset failed: passwords do not match')
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = UserModel.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist) as e:
            logger.warning(f'Password reset failed: could not decode uid or find user: {str(e)}')
            return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            logger.warning(f'Password reset failed: invalid token for user {user.pk}')
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user.set_password(new_password1)
            user.save()
            logger.info(f'Password reset successful for user ID: {user.pk}')
            return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f'Password reset failed for user ID: {user.pk}: {str(e)}')
            return Response({'error': 'Failed to reset password'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InvestmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching investments for user ID: {request.user.id}")
            investments = Investment.objects.filter(user_id=request.user.id).order_by('-quarter')
            serializer = InvestmentSerializer(investments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in InvestmentListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InvestmentSummaryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching InvestmentSummary for user ID: {request.user.id}")
            summaries = InvestmentSummaryDeux.objects.filter(user_id=request.user.id).order_by('-quarter')
            serializer = InvestmentSummaryDeuxSerializer(summaries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in InvestmentSummaryListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InvestmentSummaryDeuxListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Fetching InvestmentSummaryDeux for user ID: {request.user.id}")
            summaries = InvestmentSummaryDeux.objects.filter(user_id=request.user.id).order_by('-quarter')
            serializer = InvestmentSummaryDeuxSerializer(summaries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in InvestmentSummaryDeuxListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomAuthToken(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            user = authenticate(request=request, username=username, password=password)
            if user:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                logger.info(f"User {username} logged in successfully")
                return Response({
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username,
                    'is_staff': user.is_staff
                }, status=status.HTTP_200_OK)
            logger.warning(f"Invalid login attempt for username: {username}")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Error in CustomAuthToken: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            logger.info(f"User {request.user.username} (ID: {request.user.id}) attempting to log out")
            token_key = request.auth.key if request.auth else 'None'
            logger.debug(f"Received token: {token_key}")
            logout(request)
            if request.auth:
                request.auth.delete()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in LogoutView for user {request.user.username}: {str(e)}", exc_info=True)
            return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExportInvestmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info(f"Exporting investments for user ID: {request.user.id}")
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="investment_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Quarter', 'Invested ($)', 'Current Value ($)', 'Profit/Loss ($)', 'ROI (%)'])
            investments = Investment.objects.filter(user_id=request.user.id).order_by('-quarter')
            for investment in investments:
                writer.writerow([
                    investment.quarter,
                    float(investment.amount_invested),
                    float(investment.current_value),
                    float(investment.profit_loss()),
                    round(float(investment.roi_percentage()), 2)
                ])
            return response
        except Exception as e:
            logger.error(f"Error in ExportInvestmentsView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import InvestmentSummaryDeuxSerializer
import logging

logger = logging.getLogger(__name__)

# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import InvestmentSummaryDeuxSerializer
import logging

logger = logging.getLogger(__name__)

# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import TeamMemberSerializer, CustomUserListSerializer
import logging


class UserListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        try:
            logger.info(f"Fetching users by: {request.user.email}")
            users = CustomUser.objects.all()
            serializer = CustomUserListSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in UserListView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import InvestmentSummaryDeuxSerializer
import logging

logger = logging.getLogger(__name__)

# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from .serializers import InvestmentSummaryDeuxSerializer
import logging

logger = logging.getLogger(__name__)

class AddInvestmentSummaryView(APIView):
    permission_classes = [IsAdminUser]
    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            logger.info(f"Adding investment summary by user: {request.user.email}")
            serializer = InvestmentSummaryDeuxSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Investment summary added successfully"}, status=status.HTTP_201_CREATED)
            logger.warning(f"Invalid data: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in AddInvestmentSummaryView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EditInvestmentSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            logger.info(f"Editing investment summary ID {pk} by admin: {request.user.username}")
            summary = InvestmentSummaryDeux.objects.get(pk=pk)
            form = InvestmentSummaryForm(data=request.data, instance=summary)
            if form.is_valid():
                form.save()
                return Response({"message": "Investment summary updated successfully"}, status=status.HTTP_200_OK)
            logger.warning(f"Invalid form data: {form.errors}")
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
        except InvestmentSummaryDeux.DoesNotExist:
            logger.error(f"InvestmentSummaryDeux not found for ID: {pk}")
            return Response({"error": "Investment summary not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in EditInvestmentSummaryView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SetThemeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            theme = request.data.get('theme', 'light')
            request.session['theme'] = theme
            logger.info(f"Theme set to {theme} for user ID: {request.user.id}")
            return Response({'status': 'success', 'theme': theme}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in SetThemeView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetUserSummariesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        try:
            logger.info(f"Fetching summaries for user ID {user_id} by admin: {request.user.username}")
            summaries = InvestmentSummaryDeux.objects.filter(user_id=user_id).order_by('-quarter')
            serializer = InvestmentSummaryDeuxSerializer(summaries, many=True)
            return Response({'summaries': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in GetUserSummariesView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetCsrfTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            logger.info("Fetching CSRF token for session")
            token = get_token(request)
            response = Response({'csrfToken': token}, status=status.HTTP_200_OK)
            response.set_cookie('csrftoken', token)
            return response
        except Exception as e:
            logger.error(f"Error in GetCsrfTokenView: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# users/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@api_view(['GET'])
@permission_classes([])
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set'})
def redirect_to_react(request):
    logger.info(f"Redirecting to React app from {request.path}")
    return redirect('http://localhost:8080')