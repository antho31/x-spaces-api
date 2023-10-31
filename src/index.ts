import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';

import { Bindings } from './types';

import { getUserSpaceInfos, UserSpaceInfosResponse } from './utils/twitter';

const app = new Hono<{ Bindings }>();

app.use('*', poweredBy());

type SpacesUserIdParams = {
	userId: string;
};
type SpacesUserIdQuery = {
	count: number;
	cursor: string | undefined;
};

/**
 * @openapi
 * //spaces/:userId:
 * 	get:
 *    summary: Get spaces ids from X's user ID
 *    description: Use the internal GraphQL API to fetch user tweets and filter to return spaces only
 * 		produces:
 * 		- application/json
 * 		parameters:
 * 		- name: userId
 * 			in: path
 * 			description: User ID, 1511552753444741120 for RadioChadFr
 * 		 	required: true
 * 			type: string
 * 		- name: count
 * 			in: query
 * 			description: Maximum number of elements to return (sorted by decreasing creation date), default = 10
 * 		 	required: false
 * 			type: string
 * 		- name: cursor
 * 			in: query
 * 			description: Cursor to fetch next data from previous query
 * 		 	required: false
 * 			type: string
 *    responses:
 *    	'200':
 *         description: Successful operation. Returns JSON with success, count, cursor and data (space infos array)
 *      '400':
 *         description: Bad Request. Indicates missing or invalid parameters.
 */
app.get('/spaces/:userId', async (c) => {
	try {
		const { env, req } = c;

		const query: SpacesUserIdQuery = Number.isNaN(Number(req.query().count))
			? { count: Number(10), cursor: req.query().cursor }
			: { count: Number(req.query().count), cursor: req.query().cursor };
		const { userId } = req.param() as SpacesUserIdParams;

		const { data, cursor }: UserSpaceInfosResponse = await getUserSpaceInfos(userId, env.AUTH_TOKEN, env.CSRF, query.count, query.cursor);

		return c.json({
			success: true,
			count: data?.length,
			data,
			cursor,
		});
	} catch (e: any) {
		c.status(400);
		return c.json({ error: e.message });
	}
});

export default app;
