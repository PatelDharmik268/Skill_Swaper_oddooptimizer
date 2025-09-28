# Email Setup for SkillSwapper

## Required Environment Variables

Add these to your `.env` file:

```env
# Resend API Key (for email functionality)
RESEND_API_KEY=re_your_resend_api_key_here

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Getting Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Email Features

- **Automatic Notifications**: Users receive email when someone sends them a skill exchange invitation
- **Professional Template**: Beautiful HTML email template with skill details
- **Direct Links**: Email includes direct link to view and respond to invitations

## Email Template Includes

- Sender information
- Skills being offered and wanted
- Personal message (if provided)
- Direct link to respond
- Professional styling with SkillSwapper branding

## Testing

1. Set up your Resend API key
2. Create a swap offer through the app
3. Check the recipient's email for the notification
4. Check server logs for email sending status
