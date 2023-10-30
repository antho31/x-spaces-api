import app from '.';

describe('Test the application', () => {
	it('Should return 200 response', async () => {
		const res = await app.request('http://localhost/spaces/1511552753444741120');
		expect(res.status).toBe(200);
	});
});
