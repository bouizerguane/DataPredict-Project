import requests
import logging

logger = logging.getLogger(__name__)

class TrainingServiceClient:
    def __init__(self, base_url: str = "http://training-service:8000"):
        self.base_url = base_url

    def start_training(self, model_config: dict):
        
        try:
            response = requests.post(f"{self.base_url}/api/training/start", json=model_config)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to start training: {e}")
            return None
