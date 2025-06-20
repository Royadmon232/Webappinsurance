const handler = require('../pages/api/verifyZip');
const { createMocks } = require('node-mocks-http');

// Mock native fetch
global.fetch = jest.fn();

describe('/api/verifyZip', () => {

    beforeEach(() => {
        fetch.mockClear();
        // Mock the environment variable
        process.env.GOOGLE_MAPS_KEY = 'test-api-key';
    });

    it('should return 400 if city or userZip is missing', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { street: 'Herzl', house: '1', userZip: '12345' }, // Missing city
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'City and userZip are required.' });
    });

    it('should return valid: true for a correct zip code', async () => {
        const mockApiResponse = {
            status: 'OK',
            results: [{
                address_components: [{
                    long_name: '67890',
                    types: ['postal_code']
                }],
                types: ['street_address']
            }]
        };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
        });

        const { req, res } = createMocks({
            method: 'POST',
            body: { city: 'Tel Aviv', street: 'Dizengoff', house: '100', userZip: '67890' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            valid: true,
            official: '67890'
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return valid: false for an incorrect zip code', async () => {
        const mockApiResponse = {
            status: 'OK',
            results: [{
                address_components: [{
                    long_name: '11111', // Official zip
                    types: ['postal_code']
                }],
                 types: ['street_address']
            }]
        };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
        });

        const { req, res } = createMocks({
            method: 'POST',
            body: { city: 'Jerusalem', street: 'Jaffa', house: '50', userZip: '99999' }, // User's wrong zip
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            valid: false,
            official: '11111'
        });
    });
    
    it('should correctly build address for a kibbutz (missing street/house)', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'OK', results: [] }), // We only care about the URL called
        });

        const { req, res } = createMocks({
            method: 'POST',
            body: { city: 'Kibbutz Givat Haim', userZip: '3893500' },
        });
        
        await handler(req, res);

        const expectedAddress = 'Kibbutz Givat Haim, Israel';
        const calledUrl = new URL(fetch.mock.calls[0][0]);
        expect(calledUrl.searchParams.get('address')).toBe(expectedAddress);
    });

    it('should handle Google API errors gracefully', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Service Unavailable',
        });

        const { req, res } = createMocks({
            method: 'POST',
            body: { city: 'Error City', userZip: '12345' },
        });
        
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            valid: false,
            official: null,
            error: 'Could not verify address.'
        });
    });
    
    it('should handle "address not found" from Google API', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
        });

        const { req, res } = createMocks({
            method: 'POST',
            body: { city: 'Nonexistent City', userZip: '00000' },
        });
        
        await handler(req, res);
        
        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            valid: false,
            official: null,
            error: 'Could not verify address.'
        });
    });
}); 