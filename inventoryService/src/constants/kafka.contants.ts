export const KAFKA_CONSTANTS = {
    CLIENT_ID: "inventory-microservice",
    GROUP_ID: "inventory-group",
    TOPICS: {
        LOW_STOCK_ALERTS: "low_stock_alerts",
        ORDER_UPDATE: "order_update",
        INVENTORY_UPDATES: "inventory_updates"
    },
    EVENT_TYPES: {
        LOW_STOCK: "lowStock",
        ORDER_PROCESSED: "orderProcessed",
        STOCK_UPDATE: "stockUpdate",
        ORDER_PLACED: "orderPlaced"
    }

}