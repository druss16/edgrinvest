# users/views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Investment, UserProfile

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect
from .forms import InvestmentForm
from .models import Investment, UserProfile

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

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Investment, UserProfile
import json

import json
from decimal import Decimal

import json

from decimal import Decimal

from decimal import Decimal

from decimal import Decimal

@login_required
def investment_dashboard(request):
    # Fetch all investments for this user
    investments = Investment.objects.filter(user_id=request.user.id).order_by('-quarter')

    # Calculate sums from user_investment table
    total_balance = sum((invest.current_value for invest in investments), Decimal('0.00'))
    initial_investment = sum((invest.amount_invested for invest in investments), Decimal('0.00'))

    # Calculate ROI
    if initial_investment > 0:
        roi_percentage = ((total_balance - initial_investment) / initial_investment) * Decimal('100.0')
    else:
        roi_percentage = Decimal('0.0')  # Safe fallback

    context = {
        'balance': total_balance,
        'available_balance': total_balance,  # You can adjust this if needed
        'pending_bets': Decimal('0.0'),       # Not using now unless you track it
        'investments': investments,
        'initial_investment_amount': initial_investment,
        'roi_percentage': roi_percentage,
        'performance_chart_labels': [invest.quarter for invest in investments],
        'performance_chart_data': [float(invest.current_value) for invest in investments],
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

@staff_member_required
def investment_list(request):
    investments = Investment.objects.all().order_by('-quarter')
    return render(request, 'users/investment_list.html', {'investments': investments})