import { processInventoryMessage } from '../consumers/inventory.consumer';
import InventoryService from '../services/inventory.service';

// Mock the entire InventoryService
jest.mock('../services/inventory.service');

describe('processInventoryMessage', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const timestamp = new Date().toISOString();
    it('should handle stockUpdate event', async () => {
        const mockMessage = JSON.stringify({
            eventType: 'stockUpdate',
            productId: 'SKU123',
            quantity: 150,
            timestamp
        });

        (InventoryService.updateStock as jest.Mock).mockResolvedValue({
            productId: 'SKU123',
            quantity: 150,
            timestamp
        });

        await processInventoryMessage(mockMessage);

        expect(InventoryService.updateStock).toHaveBeenCalledWith('SKU123', 150, timestamp);
        expect(InventoryService.processOrder).not.toHaveBeenCalled();
    });

    it('should handle orderPlaced event', async () => {
        const mockMessage = JSON.stringify({
            eventType: 'orderPlaced',
            productId: 'SKU123',
            quantity: 10,
            timestamp
        });

        (InventoryService.processOrder as jest.Mock).mockResolvedValue({
            productId: 'SKU123',
            quantity: 140,
            timestamp
        });

        await processInventoryMessage(mockMessage);

        expect(InventoryService.processOrder).toHaveBeenCalledWith('SKU123', 10, timestamp);
        expect(InventoryService.updateStock).not.toHaveBeenCalled();
    });

    it('should log a warning for unknown event types', async () => {
        const mockMessage = JSON.stringify({
            eventType: 'unknownType',
            productId: 'SKU123',
            quantity: 99,
            timestamp
        });

        await processInventoryMessage(mockMessage);
        // You can check logs if you have a mock logger, or just ensure no calls to updateStock/processOrder
        expect(InventoryService.updateStock).not.toHaveBeenCalled();
        expect(InventoryService.processOrder).not.toHaveBeenCalled();
    });

    it('should throw error for invalid JSON', async () => {
        // pass something that can't be parsed
        await expect(processInventoryMessage('INVALID_JSON')).rejects.toThrow();
    });
});
