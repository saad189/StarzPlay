## Inventory Management Microservice

# Features:
- Built in Node with Typescript
- Uses Redis for High Throughput
- Event Management through Kafka
- Added unit tests for Controller and Consumer
- **Additional Feature: Low Stock Alert**

 #### Get Started:

```
1. git clone https://github.com/saad189/StarzPlay.git
2. cd inventoryService
3. npm install
4. Setup Environment (.env):

# Database Configuration
DB_NAME=starzdb
DB_USERNAME=root
DB_PASSWORD=12345
DB_HOST=localhost

# Server Port
PORT=3000

# Redis Configuration
REDIS_HOST=redis://localhost
REDIS_PORT=6379

# Kafka Broker
KAFKA_BROKER=localhost:9092

5. npm run migrate
6. docker-compose up -d
7. npm run start
8. npx ts-node src/utils/kafkaTestProducer.ts (for testing events with kafka)

```
#### API Endpoints (Examples):

- REQUEST: GET api/inventory/stock-levels/:productId
  
  RESPONSE: { "productId": "1234", "quantity": 50 }

- REQUEST: PUT /update-stock
  Content-Type: application/json
  
  BODY:
  {
    "productId": "1234",
    "quantity": 100,
    "timestamp": "2025-02-03T12:30:00Z"
  }
  
  RESPONSE:
  {
    "productId": "1234",
    "quantity": 100,
    "timestamp": "2025-02-03T12:30:00Z"
  }

#### Assumptions:
- I am assuming that all the services will consider Redis as the single source of truth and MySQL is updated synchronously


#### Limitations:
- Implementing Eventual Consistency, DB will lag behind Redis






  
  
