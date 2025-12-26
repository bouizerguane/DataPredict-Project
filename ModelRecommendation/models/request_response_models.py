from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class FeatureScore(BaseModel):
    featureName: str
    miScore: Optional[float] = 0.0
    pearsonScore: Optional[float] = 0.0
    anovaScore: Optional[float] = 0.0
    rfImportance: Optional[float] = 0.0
    finalScore: Optional[float] = 0.0
    selected: bool
    explanation: Optional[str] = None

class DatasetProfile(BaseModel):
    numRows: int
    numFeatures: int
    taskType: str  
    missingValues: Optional[int] = 0  

class RecommendationRequest(BaseModel):
    selectedFeatures: List[str]
    rejectedFeatures: List[str]
    featureScores: List[FeatureScore]
    datasetProfile: DatasetProfile

class ModelRecommendation(BaseModel):
    model: str
    name: Optional[str] = None 
    score: float
    pros: List[str] = []
    cons: List[str] = []
    complexity: str = "Medium"
    speed: str = "Medium"
    suggestedParameters: Dict[str, Any] = {}

class RecommendationResponse(BaseModel):
    recommendedModel: str
    confidence: float
    ranking: List[ModelRecommendation]
    explanations: List[str]
