# users/views.py
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect
from .models import Investment, UserProfile
from .forms import InvestmentSummaryForm
import json
from decimal import Decimal

from django.core.mail import send_mail
from django.contrib import messages
from .forms import WaitlistSignupForm

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


# users/views.py
from .forms import ChangePasswordForm

@login_required
def change_password(request):
    if request.method == 'POST':
        form = ChangePasswordForm(request.user, request.POST)
        if form.is_valid():
            new_password = form.cleaned_data.get('new_password')
            request.user.set_password(new_password)
            request.user.save()
            messages.success(request, 'Password changed successfully. Please log in again.')
            return redirect('account_login')
    else:
        form = ChangePasswordForm(request.user)

    return render(request, 'users/change_password.html', {'form': form})



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


def join_waitlist(request):
    if request.method == 'POST':
        form = WaitlistSignupForm(request.POST)
        if form.is_valid():
            signup = form.save()

            # Send email notification
            send_mail(
                'New Waitlist Signup - EdgrInvest',
                f'New signup:\n\nName: {signup.full_name}\nEmail: {signup.email}',
                'no-reply@yourdomain.com',  # FROM email
                ['youremail@yourdomain.com'],  # TO email (your admin email)
                fail_silently=False,
            )

            messages.success(request, 'Thank you for joining the waitlist!')
            return redirect('users:waitlist_thankyou')
    else:
        form = WaitlistSignupForm()

    return render(request, 'users/join_waitlist.html', {'form': form})



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

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import InvestmentSummaryDeux

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import InvestmentSummaryDeux

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import InvestmentSummaryDeux

import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import InvestmentSummaryDeux

from decimal import Decimal
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


# users/views.py
@staff_member_required
def add_investment_summary(request):
    form = InvestmentSummaryForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('users:investment_dashboard')
    return render(request, 'users/add_investment_summary.html', {'form': form})


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
