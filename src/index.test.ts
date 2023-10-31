import { UserSpaceInfosResponse } from './utils/twitter';

describe('Test /spaces/:userId route', () => {
	it('Should return 200 response and spaces information for a valid X account (RadioChadFr)', async () => {
		const res = await fetch('http://localhost:8787/spaces/1511552753444741120');
		const parsedBody: UserSpaceInfosResponse = await res.json();

		expect(res.status).toBe(200);

		expect(parsedBody.data).toBeInstanceOf(Array);

		const firstSpaceInfo = parsedBody.data[0];

		expect(typeof firstSpaceInfo.space_id).toBe('string');
		expect(typeof firstSpaceInfo.embed).toBe('string');
		expect(typeof firstSpaceInfo.creator).toBe('string');
		expect(typeof firstSpaceInfo.title).toBe('string');
		expect(typeof firstSpaceInfo.state).toBe('string');
		expect(typeof firstSpaceInfo.media_key).toBe('string');
		if (firstSpaceInfo.playlist) expect(typeof firstSpaceInfo.playlist).toBe('string');
		expect(typeof firstSpaceInfo.created_at).toBe('number');
		expect(typeof firstSpaceInfo.scheduled_start).toBe('number');
		expect(typeof firstSpaceInfo.started_at).toBe('number');
		expect(typeof firstSpaceInfo.ended_at).toBe('string');
		expect(typeof firstSpaceInfo.is_space_available_for_replay).toBe('boolean');
		expect(typeof firstSpaceInfo.total_replay_watched).toBe('number');
		expect(typeof firstSpaceInfo.total_live_listeners).toBe('number');

		expect(typeof parsedBody.cursor).toBe('string');
		expect(parsedBody.count).toBe(10);
	});

	it('Should return empty data array for invalid user ID', async () => {
		const res = await fetch('http://localhost:8787/spaces/nonexistant');
		const parsedBody: UserSpaceInfosResponse = await res.json();

		expect(res.status).toBe(200);
		expect(parsedBody.data).toBeInstanceOf(Array);
		expect(parsedBody.data).toHaveLength(0);
	});

	it('Should return limited spaces information based on the count', async () => {
		const res = await fetch('http://localhost:8787/spaces/1511552753444741120?count=5');
		const parsedBody: UserSpaceInfosResponse = await res.json();

		expect(res.status).toBe(200);
		expect(parsedBody.data).toHaveLength(5);
	});

	it('Should fetch next data using the cursor', async () => {
		const fetch4ItemsRes = await fetch('http://localhost:8787/spaces/1511552753444741120?count=10');
		const fetch4ItemsBody: UserSpaceInfosResponse = await fetch4ItemsRes.json();

		const fetch2ItemsRes = await fetch('http://localhost:8787/spaces/1511552753444741120?count=2');
		const fetch2ItemsBody: UserSpaceInfosResponse = await fetch2ItemsRes.json();
		const cursor = fetch2ItemsBody.cursor;

		const fetch2MoreItemsRes = await fetch(`http://localhost:8787/spaces/1511552753444741120?count=2&cursor=${cursor}`);
		const fetch2MoreItemsBody: UserSpaceInfosResponse = await fetch2MoreItemsRes.json();

		expect(fetch2MoreItemsBody.data[1]['space_id']).toBe(fetch4ItemsBody.data[3]['space_id']);
	});
});
