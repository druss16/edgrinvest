from rest_framework import serializers
from .models import CustomUser, InvestmentSummary, InvestmentSummaryDeux, Investment, WaitlistSignup

class ServiceSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500)

class TeamMemberSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    role = serializers.CharField(max_length=100)
    image = serializers.URLField()

class CustomUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username']

class WaitlistSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitlistSignup
        fields = ['email', 'full_name']

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class CustomUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    initial_investment_amount = serializers.SerializerMethodField()
    total_portfolio_value = serializers.SerializerMethodField()
    unrealized_gain = serializers.SerializerMethodField()
    dividend_paid = serializers.SerializerMethodField()
    profit = serializers.SerializerMethodField()
    roi_percentage = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'first_name',
            'last_name',
            'total_portfolio_value',
            'initial_investment_amount',
            'unrealized_gain',
            'dividend_paid',
            'profit',
            'roi_percentage',
        ]

    def get_initial_investment_amount(self, obj):
        investments = Investment.objects.filter(user_id=obj.id)
        return float(sum(investment.amount_invested for investment in investments) or 0)

    def get_total_portfolio_value(self, obj):
        investments = Investment.objects.filter(user_id=obj.id)
        return float(sum(investment.current_value for investment in investments) or 0)

    def get_unrealized_gain(self, obj):
        summaries = InvestmentSummaryDeux.objects.filter(user_id=obj.id)
        return float(sum(summary.unrealized_gain for summary in summaries) or 0)

    def get_dividend_paid(self, obj):
        summaries = InvestmentSummaryDeux.objects.filter(user_id=obj.id)
        return float(sum(summary.dividend_paid for summary in summaries) or 0)

    def get_profit(self, obj):
        return self.get_unrealized_gain(obj) + self.get_dividend_paid(obj)

    def get_roi_percentage(self, obj):
        initial_investment = self.get_initial_investment_amount(obj)
        if initial_investment > 0:
            return round(self.get_profit(obj) / initial_investment * 100, 2)
        return 0.0

class InvestmentSerializer(serializers.ModelSerializer):
    profit_loss = serializers.SerializerMethodField()
    roi_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            'id',
            'quarter',
            'amount_invested',
            'current_value',
            'profit_loss',
            'roi_percentage',
            'start_date',
        ]

    def get_profit_loss(self, obj):
        return float(obj.profit_loss())

    def get_roi_percentage(self, obj):
        return float(obj.roi_percentage())

class InvestmentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentSummary
        fields = [
            'id',
            'quarter',
            'beginning_balance',
            'dividend_percent',
            'dividend_amount',
            'rollover_paid',
            'dividend_paid',
            'ending_balance',
        ]

class InvestmentSummaryDeuxSerializer(serializers.ModelSerializer):
    dividend_percent = serializers.FloatField()  # Ensure float output

    class Meta:
        model = InvestmentSummaryDeux
        fields = [
            'id',
            'quarter',
            'beginning_balance',
            'dividend_percent',
            'dividend_amount',
            'unrealized_gain',
            'dividend_paid',
            'ending_balance',
        ]

class InvestmentSummaryForm(serializers.ModelSerializer):
    class Meta:
        model = InvestmentSummaryDeux
        fields = [
            'user_id',
            'quarter',
            'beginning_balance',
            'dividend_percent',
            'dividend_amount',
            'unrealized_gain',
            'dividend_paid',
            'ending_balance',
        ]