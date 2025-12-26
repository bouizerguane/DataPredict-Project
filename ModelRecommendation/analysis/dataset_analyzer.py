from typing import List, Dict, Any
import numpy as np
from models.request_response_models import FeatureScore, DatasetProfile

class DatasetAnalyzer:
    def __init__(self):
        pass

    def analyze(self, feature_scores: List[FeatureScore], profile: DatasetProfile) -> Dict[str, Any]:
        """
        Analyzes the dataset profile and feature scores to extract metrics used for recommendation.
        """
        
        
        num_instances = profile.numRows
        num_features = profile.numFeatures
        
        
        importances = [fs.finalScore for fs in feature_scores if fs.finalScore is not None]
        
        if importances:
            avg_importance = np.mean(importances)
            variance_importance = np.var(importances)
            
            low_importance_count = sum(1 for x in importances if x < 0.01)
            sparsity = low_importance_count / len(importances) if len(importances) > 0 else 0
        else:
            avg_importance = 0
            variance_importance = 0
            sparsity = 0

        
        task_type = profile.taskType.lower()
        if task_type not in ["classification", "regression", "clustering"]:
            
            
            task_type = "classification" 

        
        
        
        
        
        complexity_score = self._calculate_complexity_score(num_instances, num_features, variance_importance, sparsity)

        return {
            "task_type": task_type,
            "num_instances": num_instances,
            "num_features": num_features,
            "avg_feature_importance": avg_importance,
            "feature_importance_variance": variance_importance,
            "sparsity": sparsity,
            "complexity_score": complexity_score,
            "is_large_dataset": num_instances > 10000,
            "is_high_dimensional": num_features > 100
        }

    def _calculate_complexity_score(self, n_rows, n_cols, variance, sparsity) -> float:
        """
        Heuristic for dataset complexity (0.0 to 1.0).
        Higher score = more complex (likely needs non-linear models).
        """
        score = 0.5
        
        
        
        
        if n_rows > 0:
            ratio = n_cols / n_rows
            if ratio > 0.1: score += 0.2  
        
        if variance < 0.05:
            score += 0.2  
        
        if sparsity > 0.5:
            score -= 0.1  
            
        return max(0.0, min(1.0, score))
