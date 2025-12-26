import pytest
from services.model_recommendation_service import ModelRecommendationService
from models.request_response_models import RecommendationRequest, DatasetProfile, FeatureScore

@pytest.fixture
def service():
    return ModelRecommendationService()

def test_full_flow(service):
    request = RecommendationRequest(
        selectedFeatures=["f1", "f2"],
        rejectedFeatures=["f3"],
        featureScores=[
            FeatureScore(featureName="f1", finalScore=0.8, selected=True),
            FeatureScore(featureName="f2", finalScore=0.7, selected=True),
            FeatureScore(featureName="f3", finalScore=0.1, selected=False)
        ],
        datasetProfile=DatasetProfile(
            numRows=1000,
            numFeatures=3,
            taskType="classification"
        )
    )
    
    response = service.recommend_model(request)
    
    assert response.recommendedModel is not None
    assert len(response.ranking) > 0
    assert response.confidence > 0
    assert len(response.explanations) > 0
