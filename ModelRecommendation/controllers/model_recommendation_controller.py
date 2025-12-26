from fastapi import APIRouter, HTTPException, Depends
from models.request_response_models import RecommendationRequest, RecommendationResponse
from services.model_recommendation_service import ModelRecommendationService

router = APIRouter()

def get_service():
    return ModelRecommendationService()

@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_model(
    request: RecommendationRequest,
    service: ModelRecommendationService = Depends(get_service)
):
    try:
        recommendation = service.recommend_model(request)
        return recommendation
    except Exception as e:
        
        print(f"Error processing recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
