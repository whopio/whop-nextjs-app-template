import { WhopApi, makeUserTokenVerifier } from "@whop/api";

export const whopApi = WhopApi({
	// Add your app api key here - this is required.
	// You can get this from the Whop dashboard after creating an app in the "API Keys" section.
	appApiKey: process.env.WHOP_API_KEY ?? "fallback",

	// This will make api requests on behalf of this user.
	// This is optional, however most api requests need to be made on behalf of a user.
	// You can create an agent user for your app, and use their userId here.
	// You can also apply a different userId later with the `withUser` function.
	onBehalfOfUserId: process.env.MY_USER_ID,

	// This is the companyId that will be used for the api requests.
	// When making api requests that query or mutate data about a company, you need to specify the companyId.
	// This is optional, however if not specified certain requests will fail.
	// This can also be applied later with the `withCompany` function.
	companyId: undefined,
});

export const verifyUserToken = makeUserTokenVerifier({
	appId: process.env.WHOP_APP_ID ?? "fallback",
	dontThrow: true,
});
