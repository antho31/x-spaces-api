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
	});

	it('Should return empty data array for invalid user ID', async () => {
		const res = await fetch('http://localhost:8787/spaces/nonexistant');
		const parsedBody: UserSpaceInfosResponse = await res.json();

		expect(res.status).toBe(200);
		expect(parsedBody.data).toBeInstanceOf(Array);
		expect(parsedBody.data).toHaveLength(0);
	});

	it('Should fetch next data using the cursor', async () => {
		const res1 = await fetch('http://localhost:8787/spaces/1511552753444741120');
		const body1: UserSpaceInfosResponse = await res1.json();
		const cursor = body1.cursor;

		const res2 = await fetch(`http://localhost:8787/spaces/1511552753444741120?cursor=${cursor}`);
		const body2: UserSpaceInfosResponse = await res2.json();

		const res3 = await fetch(`http://localhost:8787/spaces/1511552753444741120?cursor=${cursor}`);
		const body3: UserSpaceInfosResponse = await res3.json();

		expect(body3.data[0]['space_id'] === body2.data[0]['space_id']).toBe(true);
		expect(body3.data[0]['space_id'] === body1.data[0]['space_id']).toBe(false);
	});
});
