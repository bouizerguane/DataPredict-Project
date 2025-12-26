import logging
from fastapi import FastAPI
from controllers.model_recommendation_controller import router as recommendation_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ModelRecommendation-Service",
    description="Microservice for recommending ML models based on dataset analysis",
    version="1.0.0"
)

app.include_router(recommendation_router, prefix="/api/recommendation", tags=["Recommendation"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

import consul
import socket
import os

CONSUL_HOST = os.environ.get("CONSUL_HOST", "localhost")
CONSUL_PORT = int(os.environ.get("CONSUL_PORT", 8500))
SERVICE_NAME = "modelrecommendation-service"
SERVICE_PORT = 8084
SERVICE_ID = f"{SERVICE_NAME}-{SERVICE_PORT}"

@app.on_event("startup")
def startup_event():
    try:
        
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        
        c = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)
        c.agent.service.register(
            name=SERVICE_NAME,
            service_id=SERVICE_ID,
            address=local_ip,
            port=SERVICE_PORT,
            check={
                "http": f"http://{local_ip}:{SERVICE_PORT}/health",
                "interval": "10s"
            }
        )
        logger.info(f"Registered service {SERVICE_NAME} with Consul")
    except Exception as e:
        logger.error(f"Failed to register with Consul: {e}")

@app.on_event("shutdown")
def shutdown_event():
    try:
        c = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)
        c.agent.service.deregister(SERVICE_ID)
        logger.info(f"Deregistered service {SERVICE_NAME} from Consul")
    except Exception as e:
        logger.error(f"Failed to deregister from Consul: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8084, reload=True)
