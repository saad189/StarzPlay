import request from 'supertest';
import InventoryService from '../services/inventory.service';
import app from '../app';

jest.mock('../services/inventory.service');

describe('Inventory Routes', () => {
    beforeEach(() => {
        // Clear mock calls before each test
        jest.clearAllMocks();

    });

    const mockQuantity = 1050;
    const mockID = "SKU123";

    describe('GET /api/inventory/stock-levels/:productId', () => {

        it('should return the current stock for the given product', async () => {

            const mockedGetStock = jest.mocked(InventoryService.getStock);
            mockedGetStock.mockResolvedValue(mockQuantity);

            // 3) Act - call the endpoint
            const res = await request(app).get(`/api/inventory/stock-levels/${mockID}`);

            // 4) Assert
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ productId: mockID, quantity: mockQuantity });
            expect(InventoryService.getStock).toHaveBeenCalledWith(mockID);
        });

        it('should handle errors from the service', async () => {
            (InventoryService.getStock as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app).get(`/api/inventory/stock-levels/${mockID}`);

            expect(res.status).toBe(500);
        });
    });

    describe('PUT /api/inventory/update-stock', () => {
        const timestamp = new Date().toISOString();
        it('should update the stock and return the updated data', async () => {
            (InventoryService.updateStock as jest.Mock).mockResolvedValue({
                productId: mockID,
                quantity: 50,
                timestamp
            });

            const res = await request(app)
                .put('/api/inventory/update-stock')
                .send({ productId: mockID, quantity: 50, timestamp });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ productId: mockID, quantity: 50, timestamp });
            expect(InventoryService.updateStock).toHaveBeenCalledWith(mockID, 50, timestamp);
        });

        it('should return an error if updateStock throws', async () => {
            (InventoryService.updateStock as jest.Mock).mockRejectedValue(
                new Error('Something went wrong')
            );

            const res = await request(app)
                .put('/api/inventory/update-stock')
                .send({ productId: mockID, quantity: 50, timestamp });

            expect(res.status).toBe(500);
        });
    });
});
