from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SalaryPrediction, LotteryRiskAssessment, SponsorshipLikelihood
from .serializers import (
    SalaryPredictionSerializer, SalaryPredictionInputSerializer,
    LotteryRiskSerializer, LotteryRiskInputSerializer,
    SponsorshipLikelihoodSerializer
)
from .services.salary_predictor import predict_salary
from companies.models import Company


class PredictionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def salary(self, request):
        """Predict salary based on profile"""
        input_serializer = SalaryPredictionInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = input_serializer.validated_data
        
        # Get prediction from service
        prediction_result = predict_salary(
            position_title=data['position_title'],
            location=data['location'],
            experience_level=data['experience_level'],
            company_id=data.get('company_id'),
            visa_status=data.get('visa_status'),
            years_of_experience=data['years_of_experience']
        )
        
        # Save prediction to database
        company = None
        if data.get('company_id'):
            company = get_object_or_404(Company, id=data['company_id'])
        
        prediction = SalaryPrediction.objects.create(
            user=request.user if request.user.is_authenticated else None,
            company=company,
            company_name_input=data.get('company_name', ''),
            position_title=data['position_title'],
            location=data['location'],
            experience_level=data['experience_level'],
            years_of_experience=data['years_of_experience'],
            visa_status=data.get('visa_status', ''),
            predicted_base_salary=prediction_result['predicted_base_salary'],
            salary_range_low=prediction_result['salary_range_low'],
            salary_range_high=prediction_result['salary_range_high'],
            confidence_score=prediction_result['confidence_score'],
            model_version='v1.0-historical',
            training_data_size=5000,
            similar_offers_count=prediction_result['similar_offers_count'],
            market_percentile=prediction_result['market_percentile']
        )
        
        # Return enriched response
        response_data = {
            'prediction': SalaryPredictionSerializer(prediction).data,
            'details': prediction_result
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['post'])
    def lottery_risk(self, request):
        """Calculate H-1B lottery risk"""
        input_serializer = LotteryRiskInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = input_serializer.validated_data
        
        # Use actual lottery calculator
        from .services.lottery_calculator import calculate_lottery_risk
        
        result = calculate_lottery_risk(
            country_of_birth=data['country_of_birth'],
            has_masters_degree=data['has_masters_degree'],
            us_masters_degree=data['us_masters_degree'],
            visa_type=data['visa_type'],
            fiscal_year=data['fiscal_year']
        )
        
        # Save assessment to database
        assessment = LotteryRiskAssessment.objects.create(
            user=request.user if request.user.is_authenticated else None,
            visa_type=data['visa_type'],
            country_of_birth=data['country_of_birth'],
            has_masters_degree=data['has_masters_degree'],
            us_masters_degree=data['us_masters_degree'],
            fiscal_year=result['fiscal_year'],
            selection_probability=result['selection_probability'],
            risk_level=result['risk_level'],
            regular_cap_probability=result['cap_probabilities'].get('regular_cap'),
            masters_cap_probability=result['cap_probabilities'].get('masters_cap'),
            green_card_wait_years=result['green_card_timeline']['estimated_wait_years'],
            priority_date_current=result['green_card_timeline']['priority_date_current'],
            historical_avg_selection_rate=result['historical_context']['avg_selection_rate'],
            year_over_year_trend=result['historical_context']['trend'],
            recommendations=result['recommendations']
        )
        
        # Return enriched response
        response_data = {
            'assessment': LotteryRiskSerializer(assessment).data,
            'details': result
        }
        
        return Response(response_data)


class SponsorshipLikelihoodViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = SponsorshipLikelihoodSerializer
    
    def get_queryset(self):
        company_id = self.request.query_params.get('company')
        if company_id:
            return SponsorshipLikelihood.objects.filter(company_id=company_id)
        return SponsorshipLikelihood.objects.all()
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """Calculate sponsorship likelihood for a specific company and role"""
        from .services.sponsorship_tracker import SponsorshipTracker
        
        company_id = request.data.get('company_id')
        job_title = request.data.get('job_title', '')
        experience_level = request.data.get('experience_level', '')
        
        company = get_object_or_404(Company, id=company_id)
        
        # Use actual sponsorship tracker
        tracker = SponsorshipTracker()
        result = tracker.calculate_likelihood(company, job_title, experience_level)
        
        # Save to database
        likelihood = SponsorshipLikelihood.objects.create(
            company=company,
            job_title=job_title,
            likelihood_score=result['likelihood_score'],
            likelihood_percentage=result['likelihood_percentage'],
            historical_filing_volume_score=result['components']['volume']['score'] * 10,
            approval_rate_score=result['components']['approval_rate']['score'] * 10,
            consistency_score=result['components']['consistency']['score'] * 10,
            recent_trend_score=result['components']['recency']['score'] * 10,
            similar_job_approvals=result.get('similar_role_approvals', 0),
            similar_job_denials=0
        )
        
        # Return enriched response
        response_data = {
            'likelihood': SponsorshipLikelihoodSerializer(likelihood).data,
            'details': result
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def top_sponsors(self, request):
        """Get top companies with best sponsorship track records"""
        from .services.sponsorship_tracker import get_top_sponsors
        
        industry = request.query_params.get('industry')
        limit = int(request.query_params.get('limit', 10))
        
        top_sponsors = get_top_sponsors(industry=industry, limit=limit)
        
        results = []
        for item in top_sponsors:
            results.append({
                'company': {
                    'id': item['company'].id,
                    'name': item['company'].name,
                    'slug': item['company'].slug,
                    'industry': item['company'].industry,
                },
                'likelihood': item['likelihood']
            })
        
        return Response(results)
