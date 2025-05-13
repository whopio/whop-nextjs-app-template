This is a template for a whop app built in NextJS. Fork it and keep the parts you need for your app. 

# Whop NextJS App Template

To run this project: 

1. Install dependencies with: `pnpm i`

2. Create a Whop App on your [whop dashboard](https://whop.com/dashboard/) under the `Api Keys` section.
	- Ensure the "Base Domain" is set to the domain you intend to deploy the site on.
	- Ensure the "App Path" is set to `/experience/[experienceId]`

3. Copy the environment variables from the `.env.development` into a `.env.local`. Ensure to use real values from the whop dashboard.

4. Go to a whop created in the same org as the app you created. Navigate to the tools section and add you app.

5. Run `pnpm dev` to start the dev server. Then in the top right of the window find a translucent settings icon. Select "localhost". The default port 3000 should work.

## Deploying

1. Upload your fork / copy of this template to github. 

2. Go to [Vercel](https://vercel.com/new) and link the repository. Deploy your application with the environment variables from your `.env.local`

3. If necessary update you "Base Domain" and webhook callback urls on the app settings page on the whop dashboard.
