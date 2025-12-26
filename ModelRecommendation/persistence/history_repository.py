import sqlite3
import json
from datetime import datetime
from models.request_response_models import RecommendationRequest, RecommendationResponse

class HistoryRepository:
    def __init__(self, db_path: str = "history.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                task_type TEXT,
                recommended_model TEXT,
                confidence REAL,
                request_data TEXT,
                response_data TEXT
            )
        """)
        conn.commit()
        conn.close()

    def save(self, request: RecommendationRequest, response: RecommendationResponse):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO recommendations (timestamp, task_type, recommended_model, confidence, request_data, response_data)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().isoformat(),
                request.datasetProfile.taskType,
                response.recommendedModel,
                response.confidence,
                request.model_dump_json(),
                response.model_dump_json()
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Failed to save history: {e}")
    def get_recent_recommendations(self, limit: int = 10):
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM recommendations ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            
            conn.close()
            return [dict(row) for row in rows]
        except Exception as e:
            print(f"Failed to fetch history: {e}")
            return []

    def get_stats(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM recommendations")
            total_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT MAX(confidence) FROM recommendations")
            max_confidence = cursor.fetchone()[0] or 0.0
            
            conn.close()
            return {
                "totalModelsTrained": total_count,
                "bestAccuracy": f"{max_confidence * 100:.1f}%"
            }
        except Exception as e:
            print(f"Failed to fetch stats: {e}")
            return {"totalModelsTrained": 0, "bestAccuracy": "0%"}
