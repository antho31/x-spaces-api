import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';

import { getUserSpaceIds } from './utils/twitter';

const app = new Hono();

app.use('*', poweredBy());

type SpacesUserIdParams = {
	userId: string;
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
 *    responses:
 *    	'200':
 *         description: Successful operation. Returns JSON with space ids
 *      '400':
 *         description: Bad Request. Indicates missing or invalid parameters.
 */
app.get('/spaces/:userId', async (c) => {
	try {
		const { env, req } = c;

		const { userId } = req.param() as SpacesUserIdParams;

		const spacesIds: string[] = await getUserSpaceIds(userId);
		return c.json({ spacesIds, uccess: true });
	} catch (e: any) {
		c.status(400);
		return c.json({ error: e.message });
	}
});

export default app;
