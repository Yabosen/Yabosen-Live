# Discord Status Integration Setup

This guide will help you set up the Discord API integration so your website automatically shows your Discord online/offline status.

## Prerequisites

- A Discord account
- Access to Discord Developer Portal
- The bot must be in at least one server (guild) with the user whose status you want to check

## Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Log in with your Discord account
3. Click the **"New Application"** button in the top right
4. Give your application a name (e.g., "Yabosen Status Bot")
5. Click **"Create"**

## Step 2: Get Your Bot Token

1. In your application page, go to the **"Bot"** section in the left sidebar
2. Click **"Add Bot"** if you haven't created a bot yet
3. Under the **"Token"** section, click **"Reset Token"** or **"Copy"** to get your bot token
4. **IMPORTANT**: Keep this token secret! Never share it publicly or commit it to version control

## Step 3: Enable Required Intents

Discord requires you to enable specific intents to access presence information:

1. Still in the **"Bot"** section, scroll down to **"Privileged Gateway Intents"**
2. Enable the following intents:
   - ✅ **Presence Intent** (Required for checking user online/offline status)
   - ✅ **Server Members Intent** (Required if checking status in servers)
3. Click **"Save Changes"**

**Note**: These are privileged intents and require verification if your bot is in 100+ servers.

## Step 4: Get Your Discord User ID

You need the User ID (not username) of the Discord user whose status you want to check:

1. Open Discord and go to **User Settings** (gear icon)
2. Go to **Advanced** settings
3. Enable **Developer Mode**
4. Right-click on your profile (or the user's profile you want to check)
5. Click **"Copy User ID"** (or **"Copy ID"**)
6. Save this ID - you'll need it for the environment variable

**Alternative Method**:
- You can also get your User ID by typing `\@YourUsername` in Discord and copying the ID from the mention

## Step 5: Invite Bot to a Server

The bot needs to be in at least one server (guild) with the user whose status you're checking:

1. In the Discord Developer Portal, go to the **"OAuth2"** section
2. Select **"URL Generator"** in the left sidebar
3. Under **"Scopes"**, select:
   - ✅ `bot`
4. Under **"Bot Permissions"**, select:
   - ✅ `View Channels` (basic permission)
   - ✅ `Read Message History` (optional, but recommended)
5. Copy the generated URL at the bottom
6. Open the URL in your browser and select a server to invite the bot to
7. Make sure the user whose status you're checking is also in this server

## Step 6: Set Up Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_USER_ID=your_discord_user_id_here
```

**Important**: 
- Never commit `.env.local` to git! It's already in `.gitignore`
- Replace `your_bot_token_here` with the bot token from Step 2
- Replace `your_discord_user_id_here` with the User ID from Step 4

### Example `.env.local`:

```env
DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OTA.Xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_USER_ID=123456789012345678
```

## Step 7: Deploy and Test

1. **Local Development**:
   - Restart your Next.js development server: `npm run dev` or `pnpm dev`
   - The status will check every hour (3600000ms)

2. **Production Deployment**:
   - Add the same environment variables to your hosting platform:
     - **Vercel**: Go to Project Settings → Environment Variables
     - **Netlify**: Go to Site Settings → Environment Variables
     - **Other platforms**: Check their documentation for environment variable setup
   - Redeploy your application

3. **Testing**:
   - The Discord status will update every hour
   - When you're online on Discord, the status should show "ONLINE"
   - When offline, it will show "OFFLINE" or hide the status component

## How It Works

- The site checks your Discord status every **1 hour** (3600000ms)
- When you're online, it shows:
  - Online status indicator (green circle)
  - "ONLINE" badge
  - Your Discord username (if available)
- Status types supported:
  - **online** - User is online (green)
  - **idle** - User is idle/away (yellow)
  - **dnd** - User is in Do Not Disturb mode (red)
  - **offline** - User is offline (gray, or component hidden)

## Important Notes

### Gateway API vs REST API

Discord's REST API doesn't provide real-time presence information. To get accurate, real-time presence:

1. **Current Implementation**: Uses REST API to verify user exists and basic status
2. **Full Presence**: Requires Gateway API (WebSocket connection) for real-time updates

For production use with real-time presence, you would need to:
- Implement a Discord Gateway connection (using discord.js or similar)
- Cache presence updates in a database or in-memory store
- The API route would read from the cache

The current implementation provides a foundation that can be extended with Gateway API for real-time presence checking.

### Bot Token Security

- **Never** commit your bot token to version control
- **Never** share your bot token publicly
- If your token is compromised, immediately reset it in the Discord Developer Portal
- Use environment variables for all sensitive credentials

### Rate Limits

Discord API has rate limits:
- REST API: Varies by endpoint
- Gateway API: Connection-based, not request-based
- The 1-hour polling interval helps avoid hitting rate limits

## Troubleshooting

### Status Always Shows Offline

1. **Check Environment Variables**:
   - Verify `DISCORD_BOT_TOKEN` is set correctly
   - Verify `DISCORD_USER_ID` is set correctly (must be numeric, no spaces)

2. **Check Bot Permissions**:
   - Ensure the bot is in a server with the user
   - Verify Presence Intent is enabled in Developer Portal

3. **Check Bot Status**:
   - Make sure the bot is online and connected
   - Check if the bot token is valid (not expired or reset)

4. **Check User ID**:
   - Verify the User ID is correct (should be a long number)
   - Make sure you're using User ID, not username

### "User not found" Error

- Verify the `DISCORD_USER_ID` is correct
- Make sure the user exists and the ID is valid
- Check that the bot token has proper permissions

### "Failed to check Discord status" Error

- Check your bot token is valid
- Verify the bot is properly configured in Developer Portal
- Check network connectivity
- Review server logs for detailed error messages

### Status Not Updating

- The status checks every hour, so changes may take up to 1 hour to reflect
- For faster updates, you can modify the polling interval in `lib/hooks/use-discord-status.ts`
- Check browser console for any errors

## Advanced: Real-Time Presence with Gateway API

For real-time presence updates (instead of hourly polling), you would need to:

1. Install `discord.js`: `npm install discord.js` or `pnpm add discord.js`
2. Create a Gateway connection service
3. Listen for presence updates
4. Cache presence in a database or in-memory store
5. Update the API route to read from cache

This is more complex but provides instant status updates. The current implementation provides a solid foundation for this enhancement.

## Features

✅ Discord online/offline status checking  
✅ Hourly automatic status updates  
✅ Support for online, idle, dnd, and offline statuses  
✅ Username display when available  
✅ Fallback to config if API fails  
✅ Works with both top-right and multi-stream status components  

Your Discord status will now automatically update every hour on your website!

