from typing import List, Dict, Any
from models.request_response_models import ModelRecommendation

class RecommendationEngine:
    def __init__(self):
        
        self.models_db = {
            "classification": [
                "LogisticRegression",
                "RandomForestClassifier",
                "XGBoostClassifier",
                "SVM",
                "KNeighborsClassifier",
                "DecisionTreeClassifier"
            ],
            "regression": [
                "LinearRegression",
                "RandomForestRegressor",
                "XGBoostRegressor",
                "SVR",
                "KNeighborsRegressor",
                "DecisionTreeRegressor"
            ]
        }
        
        
        self.model_metadata = {
            
            "LogisticRegression": {
                "name": "Logistic Regression",
                "pros": ["Simple and interpretable", "Fast training", "Good baseline"],
                "cons": ["Assumes linear boundaries", "Sensitive to outliers"],
                "complexity": "Low",
                "speed": "Very Fast"
            },
            "RandomForestClassifier": {
                "name": "Random Forest",
                "pros": ["Robust to overfitting", "High accuracy", "Handles non-linear relationships"],
                "cons": ["Training time on large datasets", "Memory intensive"],
                "complexity": "Medium",
                "speed": "Fast"
            },
            "XGBoostClassifier": {
                "name": "XGBoost",
                "pros": ["State-of-the-art accuracy", "Handles missing values", "Built-in regularization"],
                "cons": ["Complex parameter tuning", "Longer training time"],
                "complexity": "High",
                "speed": "Medium"
            },
            "SVM": {
                "name": "Support Vector Machine",
                "pros": ["Effective in high dimensions", "Versatile kernels"],
                "cons": ["Slow on large datasets", "Sensitive to noise"],
                "complexity": "High",
                "speed": "Slow"
            },
            "KNeighborsClassifier": {
                "name": "K-Nearest Neighbors",
                "pros": ["Simple to understand", "No training phase"],
                "cons": ["Slow prediction on large data", "Sensitive to scale"],
                "complexity": "Low",
                "speed": "Slow (Prediction)"
            },
            "DecisionTreeClassifier": {
                "name": "Decision Tree",
                "pros": ["Easy to interpret", "Fast training"],
                "cons": ["Prone to overfitting", "Unstable"],
                "complexity": "Low",
                "speed": "Fast"
            },
            
            
            "LinearRegression": {
                "name": "Linear Regression",
                "pros": ["Simple and interpretable", "Very fast"],
                "cons": ["Assumes linear relationship", "Sensitive to outliers"],
                "complexity": "Low",
                "speed": "Very Fast"
            },
            "RandomForestRegressor": {
                "name": "Random Forest Regressor",
                "pros": ["Handles non-linear data", "Robust"],
                "cons": ["Can be slow", "Memory intensive"],
                "complexity": "Medium",
                "speed": "Medium"
            },
            "XGBoostRegressor": {
                "name": "XGBoost Regressor",
                "pros": ["High performance", "Regularization"],
                "cons": ["Complex tuning", "Black box"],
                "complexity": "High",
                "speed": "Medium"
            },
            "SVR": {
                "name": "Support Vector Regressor",
                "pros": ["Robust to outliers", "Effective in high dims"],
                "cons": ["Hard to scale to large datasets"],
                "complexity": "High",
                "speed": "Slow"
            },
             "KNeighborsRegressor": {
                "name": "KNN Regressor",
                "pros": ["Non-parametric", "Simple"],
                "cons": ["Slow with many features/rows"],
                "complexity": "Low",
                "speed": "Slow"
            },
            "DecisionTreeRegressor": {
                "name": "Decision Tree Regressor",
                "pros": ["Interpretable", "Fast"],
                "cons": ["Poor generalization", "High variance"],
                "complexity": "Low",
                "speed": "Fast"
            }
        }

    def recommend(self, analysis_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates model recommendations based on analysis metrics.
        """
        task_type = analysis_metrics.get("task_type", "classification")
        candidates = self.models_db.get(task_type, [])
        
        scored_models = []
        explanations = []

        
        if analysis_metrics.get("feature_importance_variance", 0) > 0.05:
            explanations.append(f"High feature importance variance ({analysis_metrics.get('feature_importance_variance', 0):.2f}) suggests tree-based models might perform well.")
        
        num_instances = analysis_metrics.get("num_instances", 0)
        if num_instances < 1000:
            explanations.append(f"Small dataset ({num_instances} rows) -> Simpler models or ensembles with care.")
        else:
            explanations.append(f"Larger dataset ({num_instances} rows) -> Supports complex models like XGBoost.")

        if analysis_metrics.get("complexity_score", 0) > 0.6:
            explanations.append("High estimated complexity -> Recommendations favor non-linear models (RandomForest, XGBoost, SVM).")

        for model_id in candidates:
            score = self._calculate_model_score(model_id, analysis_metrics)
            
            
            meta = self.model_metadata.get(model_id, {})
            
            suggested_params = self._get_suggested_parameters(model_id, analysis_metrics)

            scored_models.append(ModelRecommendation(
                model=model_id,
                name=meta.get("name", model_id),
                score=round(score, 2),
                pros=meta.get("pros", []),
                cons=meta.get("cons", []),
                complexity=meta.get("complexity", "Medium"),
                speed=meta.get("speed", "Medium"),
                suggestedParameters=suggested_params
            ))

        
        scored_models.sort(key=lambda x: x.score, reverse=True)

        if not scored_models:
             
            default_model = "LogisticRegression" if task_type == "classification" else "LinearRegression"
            meta = self.model_metadata.get(default_model, {})
            return {
                "recommendedModel": default_model,
                "confidence": 0.5,
                "ranking": [
                     ModelRecommendation(
                        model=default_model,
                        name=meta.get("name", default_model), 
                        score=0.5,
                        pros=meta.get("pros", []),
                        cons=meta.get("cons", []),
                        complexity="Low",
                        speed="Fast"
                    )
                ],
                "explanations": ["No suitable models found, returning default."]
            }

        best_model = scored_models[0]
        
        return {
            "recommendedModel": best_model.model,
            "confidence": best_model.score,
            "ranking": scored_models,
            "explanations": explanations
        }

    def _calculate_model_score(self, model_name: str, metrics: Dict[str, Any]) -> float:
        """
        Calculates the final score for a specific model based on:
        modelScore = 0.4 * featureQuality + 0.2 * datasetSize + 0.2 * complexity + 0.2 * heuristicMatch
        """
        
        
        
        feature_quality = metrics.get("avg_feature_importance", 0.5) 
        
        feature_quality_score = feature_quality 
        
        if "Tree" in model_name or "Forest" in model_name or "XGB" in model_name:
             # Reduced bias: Boost score slightly for tree-based models
            feature_quality_score = min(1.0, feature_quality_score + 0.05)

        # 2. Dataset Size Suitability
        n_rows = metrics.get("num_instances", 100)
        size_score = 0.5
        
        if "Logistic" in model_name or "Linear" in model_name or "SVM" in model_name or "SVR" in model_name:
            # Prefer these for small to medium datasets
            if n_rows < 2000: size_score = 0.9
            elif n_rows < 20000: size_score = 0.7
            else: size_score = 0.5
        elif "RandomForest" in model_name or "XGB" in model_name:
            # Prefer these for larger datasets where their overhead is justified
            if n_rows < 1000: size_score = 0.6
            elif n_rows < 5000: size_score = 0.8
            else: size_score = 0.95
        
        
        complexity = metrics.get("complexity_score", 0.5)
        complexity_match_score = 0.5
        
        is_linear_model = "Logistic" in model_name or "Linear" in model_name
        
        if is_linear_model:
            
            complexity_match_score = 1.0 - complexity
        else:
            
            complexity_match_score = 0.5 + (complexity / 2)

        
        heuristic_score = self._apply_heuristics(model_name, metrics)

        
        final_score = (
            0.4 * feature_quality_score +
            0.2 * size_score +
            0.2 * complexity_match_score +
            0.2 * heuristic_score
        )
        
        return min(0.99, max(0.01, final_score))

    def _get_suggested_parameters(self, model_id: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        params = {}
        n_rows = metrics.get("num_instances", 1000)
        complexity = metrics.get("complexity_score", 0.5)

        if "RandomForest" in model_id or "XGBoost" in model_id:
            # Scale estimators with dataset size
            if n_rows < 1000: params["n_estimators"] = 100
            elif n_rows < 10000: params["n_estimators"] = 200
            else: params["n_estimators"] = 300

            # Scale depth with complexity
            if complexity < 0.3: params["max_depth"] = 5
            elif complexity < 0.7: params["max_depth"] = 10
            else: params["max_depth"] = 15

            if "XGBoost" in model_id:
                params["learning_rate"] = 0.05 if n_rows > 5000 else 0.1
        
        elif "Logistic" in model_id or "Linear" in model_id:
            params["fit_intercept"] = True
        
        elif "SVM" in model_id or "SVR" in model_id:
             params["C"] = 1.0
             params["kernel"] = "rbf" if complexity > 0.5 else "linear"

        return params

    def _apply_heuristics(self, model_name: str, metrics: Dict[str, Any]) -> float:
        score = 0.5
        n_rows = metrics.get("num_instances", 100)
        n_cols = metrics.get("num_features", 10)
        task_type = metrics.get("task_type", "classification")

        if task_type == "classification":
            if "Logistic" in model_name and n_cols < 20 and n_rows < 1000:
                score = 0.9 
            elif "RandomForest" in model_name and n_rows > 1000:
                score = 0.9 
            elif "XGB" in model_name and metrics.get("complexity_score", 0) > 0.7:
                 score = 0.95 
        
        elif task_type == "regression":
            if "Linear" in model_name and metrics.get("complexity_score", 0) < 0.3:
                score = 0.9
            elif "RandomForest" in model_name and metrics.get("complexity_score", 0) >= 0.3:
                score = 0.8
            elif "XGB" in model_name and metrics.get("feature_importance_variance", 0) > 0.1:
                score = 0.9

        return score
