import requests
import logging

logger = logging.getLogger(__name__)

class FeatureSelectionClient:
    def __init__(self, base_url: str = "http://feature-selection-service:8080"):
        self.base_url = base_url

    def get_selection_results(self, selection_id: str):
        
        try:
            response = requests.get(f"{self.base_url}/api/feature-selection/{selection_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch selection results: {e}")
            return None
