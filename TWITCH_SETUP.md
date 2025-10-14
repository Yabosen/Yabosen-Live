# Twitch Live Status Integration Setup

This guide will help you set up the Twitch API integration so your website automatically shows "Live" when you're streaming on Twitch.

## Step 1: Get Twitch API Credentials

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Log in with your Twitch account
3. Click "Register Your Application"
4. Fill in the details:
   - **Name**: Your website name (e.g., "Yabosen Live Site")
   - **OAuth Redirect URLs**: Your website URL (e.g., `https://yourdomain.com`)
   - **Category**: Choose "Website Integration" or similar
5. After registering, you'll get:
   - **Client ID** (keep this safe)
   - **Client Secret** (keep this VERY safe)

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

**Important**: Never commit this file to git! It's already in `.gitignore`.

## Step 3: Deploy and Test

1. Deploy your site with the environment variables set
2. The live status will automatically update every 30 seconds
3. When you go live on Twitch, the status will change from "Offline" to "Live"

## How It Works

- The site checks your Twitch status every 30 seconds
- When you're live, it shows:
  - Stream title
  - Game being played
  - Viewer count
  - Live indicator with animation
- When offline, the live status component is hidden

## Troubleshooting

- If the status doesn't update, check your environment variables
- Make sure your Twitch username in the API call matches exactly: `yab0sen`
- Check the browser console for any error messages
- Verify your Twitch app is properly configured in the developer console

## Features

✅ Real-time stream status checking  
✅ Automatic title and game display  
✅ Viewer count display  
✅ 30-second polling for updates  
✅ Fallback to config if API fails  
✅ Works with both top-right and multi-stream status components  

Your live status will now automatically update when you start streaming on Twitch!
