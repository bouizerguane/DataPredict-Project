import pytest
from models.request_response_models import FeatureScore, DatasetProfile
from analysis.dataset_analyzer import DatasetAnalyzer

@pytest.fixture
def analyzer():
    return DatasetAnalyzer()

def test_analyze_classification(analyzer):
    profile = DatasetProfile(
        numRows=1000,
        numFeatures=10,
        taskType="classification"
    )
    scores = [
        FeatureScore(featureName="f1", finalScore=0.9, selected=True),
        FeatureScore(featureName="f2", finalScore=0.1, selected=True),
        FeatureScore(featureName="f3", finalScore=0.001, selected=False), 
    ]
    
    metrics = analyzer.analyze(scores, profile)
    
    assert metrics["task_type"] == "classification"
    assert metrics["num_instances"] == 1000
    assert metrics["sparsity"] > 0
    assert "complexity_score" in metrics

def test_analyze_complexity(analyzer):
    
    profile = DatasetProfile(
        numRows=100,
        numFeatures=50, 
        taskType="regression"
    )
    scores = [
        FeatureScore(featureName=f"f{i}", finalScore=0.5, selected=True) for i in range(50)
    ] 
    
    metrics = analyzer.analyze(scores, profile)
    assert metrics["complexity_score"] > 0.5
