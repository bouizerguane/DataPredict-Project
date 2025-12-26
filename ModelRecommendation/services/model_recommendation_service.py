from models.request_response_models import RecommendationRequest, RecommendationResponse
from analysis.dataset_analyzer import DatasetAnalyzer
from engine.recommendation_engine import RecommendationEngine

class ModelRecommendationService:
    def __init__(self):
        self.analyzer = DatasetAnalyzer()
        self.engine = RecommendationEngine()
        

    def recommend_model(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Main orchestration method:
        1. Analyze incoming data
        2. Generate recommendations
        3. Return formatted response
        """
        
        
        metrics = self.analyzer.analyze(request.featureScores, request.datasetProfile)
        
        
        recommendation_result = self.engine.recommend(metrics)
        
        
        response = RecommendationResponse(
            recommendedModel=recommendation_result["recommendedModel"],
            confidence=recommendation_result["confidence"],
            ranking=recommendation_result["ranking"],
            explanations=recommendation_result["explanations"]
        )
        
        
        
        
        return response
