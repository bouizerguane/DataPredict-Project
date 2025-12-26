# Setup Consul Discovery Service

## 1. Prerequisites
- **Docker** and **Docker Compose** installed on your machine.
- OR download **Consul binary** directly from [HashiCorp](https://developer.hashicorp.com/consul/install).

## 2. Running Standalone (Required - No Docker)
1. Download `consul.exe` from [HashiCorp](https://developer.hashicorp.com/consul/install).
2. Add the directory containing `consul.exe` to your system PATH (or run from the directory).
3. Open a terminal and run:
   ```bash
   consul agent -dev -ui
   ```
4. Access UI at [http://localhost:8500](http://localhost:8500)

## 3. Running with Docker (Alternative)
*Skipped as per request suitable for environments where Docker is not available/desired.*
If needed later, use `docker-compose up -d`.

## 4. Verification
- Once Consul is running, and your microservices are started, you should see them appear in the "Services" tab of the Consul UI.
