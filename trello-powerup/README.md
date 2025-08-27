# 🚀 LinkLoom Trello Power-Up Setup Guide

This guide will walk you through setting up the LinkLoom Trello Power-Up, which allows users to automatically sync their Trello content to their bio pages.

## 📋 What This Power-Up Does

- **Board Integration**: Connect Trello boards to LinkLoom bio pages
- **Card Management**: Add individual cards to bio pages with custom titles and descriptions
- **Auto-Sync**: Automatically update bio pages when Trello content changes
- **Visual Indicators**: Show sync status with badges and icons
- **Smart Rules**: Configure how many cards to sync and display

## 🏗️ File Structure

```
trello-powerup/
├── connector.html      # Main Power-Up connector (iframe)
├── popup.html         # Board connection popup
├── card-popup.html    # Individual card management popup
├── manifest.json      # Power-Up configuration
└── README.md          # This file
```

## 🚀 Step 1: Deploy the Power-Up

### Option A: Deploy to Netlify (Recommended)

1. **Create a new folder** on your computer
2. **Copy all files** from `trello-powerup/` into this folder
3. **Go to [netlify.com](https://netlify.com)** and sign up/login
4. **Drag and drop** your folder to deploy
5. **Note your domain** (e.g., `https://your-powerup.netlify.app`)

### Option B: Deploy to GitHub Pages

1. **Create a new GitHub repository**
2. **Upload all files** from `trello-powerup/`
3. **Enable GitHub Pages** in repository settings
4. **Note your domain** (e.g., `https://username.github.io/repository-name`)

### Option C: Deploy to Vercel

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Navigate to your folder**: `cd trello-powerup`
3. **Deploy**: `vercel --prod`
4. **Note your domain** from the output

## ⚙️ Step 2: Update Configuration

After deploying, you need to update the configuration files with your actual domain:

### Update `manifest.json`

Replace `https://your-powerup-domain.com` with your actual domain:

```json
{
  "connectors": {
    "iframeConnectorUrl": "https://your-powerup.netlify.app/connector.html"
  },
  "origins": [
    "https://your-powerup.netlify.app"
  ]
}
```

### Update Icon URLs

In `connector.html`, update the icon URLs to point to your domain:

```javascript
icon: {
  dark: 'https://your-powerup.netlify.app/icon-dark.png',
  light: 'https://your-powerup.netlify.app/icon-light.png'
}
```

## 🔐 Step 3: Register with Trello

1. **Go to [trello.com/power-ups/admin](https://trello.com/power-ups/admin)**
2. **Click "New Power-Up"**
3. **Fill in the details:**
   - **Name**: `LinkLoom`
   - **Details**: `Automatically sync your Trello content to your bio page`
   - **Icon**: Upload a 64x64 PNG icon
   - **Iframe Connector URL**: `https://your-powerup.netlify.app/connector.html`
   - **Origins**: `https://your-powerup.netlify.app`
4. **Click "Create Power-Up"**
5. **Copy the Power-Up ID** (you'll need this for the backend)

## 🔗 Step 4: Connect to LinkLoom Backend

The Power-Up needs to communicate with your LinkLoom backend to actually sync data. You'll need to:

1. **Create a webhook endpoint** in your LinkLoom backend
2. **Update the Power-Up code** to send data to your backend
3. **Handle authentication** between Trello and LinkLoom

## 🧪 Step 5: Test the Power-Up

1. **Go to any Trello board**
2. **Click "Show Menu"** → **"Power-Ups"**
3. **Search for "LinkLoom"** and enable it
4. **Click the LinkLoom button** on the board
5. **Test the connection flow**

## 🔧 Customization Options

### Change Colors and Styling

Update the CSS in `popup.html` and `card-popup.html` to match your brand:

```css
.btn {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Add More Features

You can extend the Power-Up with additional capabilities:

- **List filtering**: Only sync cards from specific lists
- **Label-based rules**: Sync cards with specific labels
- **Scheduled syncing**: Sync at specific times
- **Multiple bio pages**: Connect to multiple LinkLoom accounts

### Modify Sync Rules

Update the sync options in `popup.html`:

```javascript
<select id="syncRule">
  <option value="latest">Latest 5 cards</option>
  <option value="all">All cards</option>
  <option value="pinned">Pinned cards only</option>
  <option value="labeled">Cards with specific labels</option>
  <option value="custom">Custom rule</option>
</select>
```

## 🐛 Troubleshooting

### Common Issues

1. **Power-Up not appearing**
   - Check that the iframe connector URL is correct
   - Verify the domain is HTTPS
   - Ensure the Power-Up is enabled on the board

2. **Popups not loading**
   - Check browser console for errors
   - Verify all file paths are correct
   - Ensure CORS is properly configured

3. **Data not syncing**
   - Check that the backend webhook is working
   - Verify authentication between services
   - Check Trello API permissions

### Debug Mode

Add this to your connector.html for debugging:

```javascript
// Enable debug mode
TrelloPowerUp.initialize({
  'board-buttons': function (t, opts) {
    console.log('Board buttons called:', opts);
    // ... rest of your code
  }
});
```

## 📚 Next Steps

Once the Power-Up is working:

1. **Integrate with LinkLoom backend** for actual data syncing
2. **Add user authentication** to link Trello accounts with LinkLoom accounts
3. **Implement webhook handling** for real-time updates
4. **Add analytics** to track Power-Up usage
5. **Create user documentation** for end users

## 🆘 Need Help?

- **Trello Power-Up Docs**: [developers.trello.com](https://developers.trello.com)
- **Power-Up Community**: [community.trello.com](https://community.trello.com)
- **LinkLoom Support**: Create an issue in the main repository

---

**Happy Power-Up building! 🎉**
