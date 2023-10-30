export type TwitterGuestHeaders = {
	authorization: string;
	'x-guest-token': string;
};

export const TWITTER_PUBLIC_AUTHORIZATION: string =
	'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

export async function getGuestToken(): Promise<string> {
	const response: Response = await fetch('https://api.twitter.com/1.1/guest/activate.json', {
		method: 'POST',
		headers: new Headers({
			authorization: TWITTER_PUBLIC_AUTHORIZATION,
		}),
	});
	const { guest_token: guestToken }: { guest_token: string } = await response.json();

	return guestToken;
}

export async function getGuestRequestHeaders(): Promise<Headers & TwitterGuestHeaders> {
	const guestToken: string = await getGuestToken();

	const guestRequestHeaders: TwitterGuestHeaders = {
		authorization: TWITTER_PUBLIC_AUTHORIZATION,
		'x-guest-token': guestToken,
	};

	return new Headers(guestRequestHeaders) as Headers & TwitterGuestHeaders;
}

async function getUserTweets(userId: string) {
	const baseUrl = 'https://twitter.com/i/api/graphql/QvCV3AU7X1ZXr9JSrH9EOA/UserTweets';
	const headers = await getGuestRequestHeaders();
	const params = new URLSearchParams({
		variables: JSON.stringify({
			userId,
			count: 10,
			withTweetQuoteCount: false,
			includePromotedContent: false,
			withQuickPromoteEligibilityTweetFields: false,
			withSuperFollowsUserFields: false,
			withBirdwatchPivots: false,
			withDownvotePerspective: false,
			withReactionsMetadata: false,
			withReactionsPerspective: false,
			withSuperFollowsTweetFields: false,
			withVoice: false,
			withV2Timeline: false,
		}),
	});

	const response = await fetch(`${baseUrl}?${params.toString()}`, {
		method: 'GET',
		headers: headers,
	});

	return await response.json();
}

export async function getUserSpaceIds(userId: string): Promise<string[]> {
	const data = await getUserTweets(userId);

	// @ts-ignore
	const instructions = data?.data?.user?.result?.timeline?.timeline?.instructions || [];

	const instruction = instructions.find((v) => v?.type === 'TimelineAddEntries');
	const tweets: any[] =
		instruction?.entries
			?.filter((v) => v?.content?.entryType === 'TimelineTimelineItem')
			?.map((v) => v?.content?.itemContent?.tweet_results?.result)
			?.filter((v) => v?.card) || [];

	const spaceIds: string[] = [
		// @ts-ignore
		...new Set(
			tweets.map((tweet) => tweet?.card?.legacy?.binding_values?.find?.((v) => v?.key === 'id')?.value?.string_value).filter((v) => v),
		),
	];

	return spaceIds;
}
