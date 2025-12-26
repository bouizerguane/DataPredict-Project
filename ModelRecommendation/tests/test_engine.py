import pytest
from engine.recommendation_engine import RecommendationEngine

@pytest.fixture
def engine():
    return RecommendationEngine()

def test_heuristic_small_dataset_classification(engine):
    metrics = {
        "task_type": "classification",
        "num_instances": 100,
        "num_features": 5,
        "avg_feature_importance": 0.8,
        "feature_importance_variance": 0.1,
        "sparsity": 0.1,
        "complexity_score": 0.2
    }
    
    result = engine.recommend(metrics)
    
    
    assert result["recommendedModel"] in ["LogisticRegression", "SVM", "DecisionTreeClassifier"]
    assert result["ranking"][0].score >= result["ranking"][-1].score

def test_heuristic_complex_dataset_classification(engine):
    metrics = {
        "task_type": "classification",
        "num_instances": 5000,
        "num_features": 50,
        "avg_feature_importance": 0.5,
        "feature_importance_variance": 0.02, 
        "sparsity": 0.1,
        "complexity_score": 0.8 
    }
    
    result = engine.recommend(metrics)
    
    
    top_model = result["recommendedModel"]
    assert "Forest" in top_model or "XGB" in top_model or "SVM" in top_model

def test_regression_recommendation(engine):
    metrics = {
        "task_type": "regression",
        "num_instances": 1000,
        "num_features": 10,
        "avg_feature_importance": 0.5,
        "feature_importance_variance": 0.1,
        "sparsity": 0.1,
        "complexity_score": 0.4
    }
    
    result = engine.recommend(metrics)
    assert result["ranking"][0].model in engine.models_db["regression"]
