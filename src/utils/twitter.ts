export type TwitterAuthenticatedHeaders = {
	authorization: string;
	cookie: string;
	'x-csrf-token': string;
};

export type TwitterGuestHeaders = {
	authorization: string;
	'x-guest-token': string;
};

export type SpaceIdsResponse = {
	spaceIds: string[];
	cursor: string | undefined;
};

export const TWITTER_PUBLIC_AUTHORIZATION: string =
	'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

export function getAuthenticatedHeader(authToken: string, csrf: string): Headers & TwitterAuthenticatedHeaders {
	const cookies = {
		auth_token: authToken,
		ct0: csrf,
	};

	const cookie = Object.keys(cookies)
		.filter((key) => cookies[key])
		.map((key) => `${key}=${cookies[key]}`)
		.join('; ');

	return new Headers({
		authorization: TWITTER_PUBLIC_AUTHORIZATION,
		cookie,
		'x-csrf-token': csrf,
	}) as Headers & TwitterAuthenticatedHeaders;
}

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

export async function getUserTweets(userId: string, authToken: string, csrf: string, cursor: string | undefined) {
	const baseUrl = 'https://twitter.com/i/api/graphql/QvCV3AU7X1ZXr9JSrH9EOA/UserTweets';

	// We don't get all tweets with await getGuestRequestHeaders();
	const headers = await getAuthenticatedHeader(authToken, csrf);

	const variables = {
		userId,
		count: 20,
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
	};
	if (cursor) variables['cursor'] = cursor;

	const params = new URLSearchParams({
		variables: JSON.stringify(variables),
	});

	const response = await fetch(`${baseUrl}?${params.toString()}`, {
		method: 'GET',
		headers: headers,
	});

	return await response.json();
}

export async function getUserSpaceIds(
	userId: string,
	authToken: string,
	csrf: string,
	count: number,
	cursor: string | undefined,
): Promise<SpaceIdsResponse> {
	let spaceIds: string[] = [];

	do {
		const data = await getUserTweets(userId, authToken, csrf, cursor);

		// @ts-ignore
		const instructions = data?.data?.user?.result?.timeline?.timeline?.instructions || [];

		const instruction = instructions.find((v) => v?.type === 'TimelineAddEntries');
		const tweets: any[] =
			instruction?.entries
				?.filter((v) => v?.content?.entryType === 'TimelineTimelineItem')
				?.map((v) => v?.content?.itemContent?.tweet_results?.result)
				?.filter((v) => v?.card) || [];

		const requestedSpaceIds: string[] = [
			// @ts-ignore
			...new Set(
				tweets.map((tweet) => tweet?.card?.legacy?.binding_values?.find?.((v) => v?.key === 'id')?.value?.string_value).filter((v) => v),
			),
		];
		spaceIds.push(...requestedSpaceIds);

		const cursors: any[] = instruction?.entries
			?.filter((v) => v?.content?.entryType === 'TimelineTimelineCursor' && v?.content?.cursorType === 'Bottom')
			?.map((v) => v?.content?.value);
		cursor = cursors?.length ? cursors[0] : undefined;
	} while (cursor && spaceIds.length < count);

	return { cursor, spaceIds: spaceIds.length > count ? spaceIds.slice(0, count) : spaceIds };
}

export async function getSpace(spaceId: string, authToken: string, csrf: string) {
	const baseUrl = 'https://api.twitter.com/graphql/kZ9wfR8EBtiP0As3sFFrBA/AudioSpaceById';

	const headers = getAuthenticatedHeader(authToken, csrf);

	const params = new URLSearchParams({
		variables: JSON.stringify({
			id: spaceId,
			isMetatagsQuery: true,
			withReplays: true,
			withListeners: true,
		}),
		features: JSON.stringify({
			spaces_2022_h2_clipping: true,
			spaces_2022_h2_spaces_communities: true,
			responsive_web_graphql_exclude_directive_enabled: true,
			verified_phone_label_enabled: false,
			creator_subscriptions_tweet_preview_api_enabled: true,
			responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
			tweetypie_unmention_optimization_enabled: true,
			responsive_web_edit_tweet_api_enabled: true,
			graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
			view_counts_everywhere_api_enabled: true,
			longform_notetweets_consumption_enabled: true,
			responsive_web_twitter_article_tweet_consumption_enabled: false,
			tweet_awards_web_tipping_enabled: false,
			freedom_of_speech_not_reach_fetch_enabled: true,
			standardized_nudges_misinfo: true,
			tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
			responsive_web_graphql_timeline_navigation_enabled: true,
			longform_notetweets_rich_text_read_enabled: true,
			longform_notetweets_inline_media_enabled: true,
			responsive_web_media_download_video_enabled: false,
			responsive_web_enhance_cards_enabled: false,
		}),
		fieldToggles: JSON.stringify({
			withArticleRichContentState: false,
		}),
	});

	const response = await fetch(`${baseUrl}?${params.toString()}`, {
		method: 'GET',
		headers: headers,
	});

	const data = await response.json();

	/*
	{
		data: {
			audioSpace: {
				metadata: {
					rest_id: '1kvKpmBjLgaGE',
					state: 'Ended',
					title: 'DES NFT BACKÉS PAR DES BITCOINS ?',
					media_key: '28_1595524194783363072',
					created_at: 1669237586085,
					scheduled_start: 1669240822452,
					started_at: 1669240846977,
					ended_at: '1669245273323',
					updated_at: 1669245274320,
					disallow_join: false,
					narrow_cast_space_type: 0,
					is_employee_only: false,
					is_locked: false,
					is_space_available_for_replay: true,
					is_space_available_for_clipping: false,
					conversation_controls: 0,
					total_replay_watched: 155,
					total_live_listeners: 206,
					creator_results: {
						result: {
							__typename: 'User',
							id: 'VXNlcjoxNTExNTUyNzUzNDQ0NzQxMTIw',
							rest_id: '1511552753444741120',
							affiliates_highlighted_label: {},
							has_graduated_access: true,
							is_blue_verified: true,
							profile_image_shape: 'Circle',
							legacy: {
								can_dm: true,
								can_media_tag: true,
								created_at: 'Wed Apr 06 03:55:06 +0000 2022',
								default_profile: true,
								default_profile_image: false,
								description:
									'Émission de radio expérimentale pour les épris de liberté et de réflexion. Organisateur du @chadbattlefr.\nÉPISODES SUR SPOTIFY ET EXTRAITS : https://t.co/cMfs3hI1vr',
								entities: {
									description: {
										urls: [
											{
												display_url: 'lnk.bio/radiochad',
												expanded_url: 'http://lnk.bio/radiochad',
												url: 'https://t.co/cMfs3hI1vr',
												indices: [141, 164],
											},
										],
									},
								},
								fast_followers_count: 0,
								favourites_count: 2729,
								followers_count: 2188,
								friends_count: 284,
								has_custom_timelines: true,
								is_translator: false,
								listed_count: 20,
								location: 'France',
								media_count: 490,
								name: 'Radio Chad',
								normal_followers_count: 2188,
								pinned_tweet_ids_str: ['1716433742380622110'],
								possibly_sensitive: false,
								profile_banner_url: 'https://pbs.twimg.com/profile_banners/1511552753444741120/1688316229',
								profile_image_url_https: 'https://pbs.twimg.com/profile_images/1675546793545703424/mUllOejL_normal.jpg',
								profile_interstitial_type: '',
								screen_name: 'RadioChadFr',
								statuses_count: 2953,
								translator_type: 'none',
								verified: false,
								want_retweets: false,
								withheld_in_countries: [],
							},
						},
					},
				},
				is_subscribed: false,
				participants: {
					total: 0,
					admins: [
						{
							periscope_user_id: '1DYEXpMRZvDEg',
							start: 1669237586085,
							twitter_screen_name: 'RadioChadFr',
							display_name: 'Radio Chad',
							avatar_url: 'https://pbs.twimg.com/profile_images/1675546793545703424/mUllOejL_normal.jpg',
							is_verified: true,
							is_muted_by_admin: false,
							is_muted_by_guest: false,
							user_results: {
								rest_id: '1511552753444741120',
								result: {
									__typename: 'User',
									identity_profile_labels_highlighted_label: {},
									has_nft_avatar: false,
									is_blue_verified: true,
									legacy: {},
								},
							},
						},
					],
					speakers: [
						{
							periscope_user_id: '1DYEXgmXezojg',
							start: 1669240885056,
							twitter_screen_name: 'DocMarmott',
							display_name: 'DocMarmott',
							avatar_url: 'https://pbs.twimg.com/profile_images/1301465763786764289/HCQ4jvL5_normal.jpg',
							is_verified: false,
							is_muted_by_admin: false,
							is_muted_by_guest: true,
							user_results: {
								rest_id: '1222246060640407554',
								result: {
									__typename: 'User',
									identity_profile_labels_highlighted_label: {},
									has_nft_avatar: false,
									is_blue_verified: false,
									legacy: {},
								},
							},
						},
						{
							periscope_user_id: '4965491',
							start: 1669242127061,
							twitter_screen_name: 'slashbin_FR',
							display_name: 'Slashbin',
							avatar_url: 'https://pbs.twimg.com/profile_images/1699542092681216000/mtw8WEuW_normal.jpg',
							is_verified: false,
							is_muted_by_admin: false,
							is_muted_by_guest: true,
							user_results: {
								rest_id: '32411540',
								result: {
									__typename: 'User',
									identity_profile_labels_highlighted_label: {},
									has_nft_avatar: false,
									is_blue_verified: false,
									legacy: {},
								},
							},
						},
						{
							periscope_user_id: '1edjnZwYmdMjo',
							start: 1669243337812,
							twitter_screen_name: 'GuruTanuki_',
							display_name: 'GuruTanuki.avax🔺',
							avatar_url: 'https://pbs.twimg.com/profile_images/1662402218757361664/R74rHDzJ_normal.jpg',
							is_verified: false,
							is_muted_by_admin: false,
							is_muted_by_guest: true,
							user_results: {
								rest_id: '2883849205',
								result: {
									__typename: 'User',
									identity_profile_labels_highlighted_label: {},
									has_nft_avatar: false,
									is_blue_verified: false,
									legacy: {},
								},
							},
						},
						{
							periscope_user_id: '1AmjzRrBYpjew',
							start: 1669242468557,
							twitter_screen_name: 'hodlersanspaniq',
							display_name: 'superman',
							avatar_url: 'https://pbs.twimg.com/profile_images/1639760214663606274/MYKIIu22_normal.jpg',
							is_verified: false,
							is_muted_by_admin: false,
							is_muted_by_guest: true,
							user_results: {
								rest_id: '713461748624408577',
								result: {
									__typename: 'User',
									identity_profile_labels_highlighted_label: {},
									has_nft_avatar: false,
									is_blue_verified: false,
									legacy: {},
								},
							},
						},
					],
					listeners: [
						{
							periscope_user_id: 'tw-306953820',
							twitter_screen_name: 'ZofiaSchwalbe13',
							display_name: 'Zofia Schwalbe',
							avatar_url: 'https://pbs.twimg.com/profile_images/1649952921331589125/lvdvY3ds_normal.png',
							is_verified: false,
							user_results: {
								rest_id: '306953820',
								result: {
									__typename: 'User',
									identity_profile_labels_highlighted_label: {},
									has_nft_avatar: false,
									is_blue_verified: false,
									legacy: {},
								},
							},
						},
					],
				},
			},
		},
	};
    */

	return data;
}

export async function getMedia(mediaKey: string, authToken: string, csrf: string) {
	const headers = getAuthenticatedHeader(authToken, csrf);

	const response = await fetch(`https://twitter.com/i/api/1.1/live_video_stream/status/${mediaKey}`, {
		method: 'GET',
		headers: headers,
	});

	const data = await response.json();

	/*
	{
		source: {
			location:
				'https://prod-fastly-us-east-1.video.pscp.tv/Transcoding/v1/hls/9xA1GCTzSh9uvolMCmGfv0WTnSb2wDICZvKbgjRI35ZLLexvUOEz3cCPkkMID3Xq8MotBd-BzkA_YGBn3aouBg/non_transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/playlist_16777498795261702303.m3u8?type=replay',
			noRedirectPlaybackUrl:
				'https://prod-fastly-us-east-1.video.pscp.tv/Transcoding/v1/hls/9xA1GCTzSh9uvolMCmGfv0WTnSb2wDICZvKbgjRI35ZLLexvUOEz3cCPkkMID3Xq8MotBd-BzkA_YGBn3aouBg/non_transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/playlist_16777498795261702303.m3u8?type=replay',
			status: 'LIVE_PUBLIC',
			streamType: 'HLS',
		},
		sessionId: '1718982138370908160',
		chatToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg3NTg2NTMsImFtYmlndW91c191c2VyX2lkIjoiZXlKVWQybDBkR1Z5VlhObGNrbGtJam96TURZNU5UTTRNakI5IiwiYnJvYWRjYXN0X2lkIjoiMWt2S3BtQmpMZ2FHRSIsImxvd19sYXRlbmN5IjpmYWxzZSwicmVhZF9vbmx5Ijp0cnVlLCJwYXJ0aWNpcGFudF9pbmRleCI6MzA4NDYzNzc5fQ.JACly5K1DM-kcOGZwNN4M32aBZrwUV3vzLBmt-EimZ0',
		lifecycleToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg3NTg2NTMsImJyb2FkY2FzdF9pZCI6IjFrdktwbUJqTGdhR0UiLCJjcmVhdGVkIjoxNjk4NjcyMjUzLCJpZ25vcmUiOmZhbHNlLCJwYXJ0aWNpcGFudF9pbmRleCI6MzA4NDYzNzc5LCJpc19saXZlIjpmYWxzZSwiaXNfaGlnaGxpZ2h0cyI6ZmFsc2UsInRva2VuX3ZlcnNpb24iOjF9.ZUdh2Vjx5nPHyHTkOonShFGZTUh6hD-REQ5jwpHJNp4',
		shareUrl: 'https://twitter.com/i/broadcasts/1kvKpmBjLgaGE',
	};
    */

	return data;
}

export async function getUserSpaceInfos(userId: string, authToken: string, csrf: string, count: number, reqCursor: string | undefined) {
	const { spaceIds, cursor }: SpaceIdsResponse = await getUserSpaceIds(userId, authToken, csrf, count, reqCursor);

	const userSpaceInfos = await Promise.all(
		spaceIds.map(async (spaceId) => {
			const spaceInfos = await getSpace(spaceId, authToken, csrf);

			const {
				rest_id,
				state,
				title,
				media_key,
				created_at,
				scheduled_start,
				started_at,
				ended_at,
				is_space_available_for_replay,
				total_replay_watched,
				total_live_listeners,
				creator_results,
				// @ts-ignore
			} = spaceInfos?.data?.audioSpace?.metadata || {};

			const creator = creator_results?.result?.legacy?.name;

			let playlist;
			if (media_key && is_space_available_for_replay) {
				const mediaInfos = await getMedia(media_key, authToken, csrf);
				// @ts-ignore
				playlist = mediaInfos?.source?.location;
			}

			return {
				space_id: rest_id,
				embed: `https://twitter.com/i/spaces/${rest_id}`,
				creator,
				title,
				state,
				media_key,
				playlist,
				created_at,
				scheduled_start,
				started_at,
				ended_at,
				is_space_available_for_replay,
				total_replay_watched,
				total_live_listeners,
			};
		}),
	);

	return {
		data: userSpaceInfos,
		cursor,
	};
}
