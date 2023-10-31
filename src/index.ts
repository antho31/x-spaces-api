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
 * /spaces/{userId}:
 *   get:
 *     summary: Retrieve space IDs associated with an X user.
 *     description: Leverages the internal GraphQL API to obtain tweets from the specified user and filters the results to only return spaces.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The unique ID of the user (e.g., 1511552753444741120 for RadioChadFr).
 *         required: true
 *         type: string
 *       - name: count
 *         in: query
 *         description: Specifies the maximum number of results to return, sorted by descending creation date. Default value is 10.
 *         required: false
 *         type: string
 *       - name: cursor
 *         in: query
 *         description: Provides the cursor from the last query, allowing for the retrieval of subsequent data.
 *         required: false
 *         type: string
 *     responses:
 *       '200':
 *         description: A successful operation. Returns a JSON object containing success, count, cursor, and an array of space information.
 *       '400':
 *         description: Bad request, usually indicating a missing or invalid parameter.
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
