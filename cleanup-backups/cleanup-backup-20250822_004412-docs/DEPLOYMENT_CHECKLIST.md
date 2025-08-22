# Cloudflare Pages Deployment Checklist

## ✅ Pre-Deployment Complete

The application is now fully prepared for Cloudflare Pages deployment:

### Completed Tasks:
- ✅ **Cloudflare adapter installed** - `@astrojs/cloudflare` v12.6.3
- ✅ **Wrangler CLI installed** - v4.30.0 
- ✅ **Configuration updated** - `astro.config.mjs` using Cloudflare adapter
- ✅ **Environment variables migrated** - All API files use `import.meta.env`
- ✅ **Deployment scripts added** - `cf:deploy`, `cf:preview` commands
- ✅ **wrangler.toml configured** - Ready for Pages deployment
- ✅ **Build tested** - Successfully builds with Cloudflare adapter
- ✅ **Documentation created** - Full deployment guide available

## 🚀 Manual Deployment Steps

### Option 1: Via Cloudflare Dashboard (Recommended for First Deploy)

1. **Go to Cloudflare Pages**
   - Navigate to https://dash.cloudflare.com/
   - Select "Workers & Pages" from left sidebar
   - Click "Create application" → "Pages"

2. **Connect Git Repository**
   - Choose "Connect to Git"
   - Select your GitHub/GitLab account
   - Choose the `executive-ai-training` repository
   - Grant Cloudflare access if prompted

3. **Configure Build Settings**
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18 or higher

4. **Set Environment Variables**
   Click "Add variable" for each:
   - `OPENAI_API_KEY` = Your OpenAI API key
   - `NODE_VERSION` = 18
   - `ALLOWED_ORIGINS` = https://executiveaitraining.com,https://www.executiveaitraining.com

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (2-3 minutes)

### Option 2: Via CLI (After Initial Setup)

1. **Get API Token**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Cloudflare Pages:Edit" permission
   - Copy the token

2. **Set Environment Variable**
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   ```

3. **Deploy**
   ```bash
   npm run cf:deploy
   ```

## 📋 Post-Deployment Configuration

### 1. Custom Domain Setup
- In Pages dashboard → "Custom domains"
- Add `executiveaitraining.com`
- Add `www.executiveaitraining.com`
- DNS will be auto-configured

### 2. Environment Variables (Production)
In Pages dashboard → Settings → Environment variables:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | sk-... (your key) |
| `ALLOWED_ORIGINS` | https://executiveaitraining.com,https://www.executiveaitraining.com |
| `VOICE_AGENT_TOKEN_DURATION` | 1800 |
| `VOICE_AGENT_RATE_LIMIT` | 10 |

### 3. Verify Deployment
Test these endpoints:
- https://executiveaitraining.com/ - Main page
- https://executiveaitraining.com/voice-agent - Voice agent
- https://executiveaitraining.com/api/voice-agent/compatibility - API check

## 🔍 Monitoring

### Real-time Logs
- Pages dashboard → Functions → Real-time logs
- Or use CLI: `wrangler tail`

### Analytics
- Pages dashboard → Analytics
- Monitor usage, errors, and performance

## ⚠️ Important Notes

1. **API Key Security**: Never commit API keys to git
2. **First Deploy**: May take 5-10 minutes for DNS propagation
3. **SSL Certificate**: Automatically provisioned by Cloudflare
4. **Caching**: Static assets cached automatically
5. **Rate Limits**: Configured at 10 requests/minute per IP

## 📞 Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Troubleshooting Guide](./CLOUDFLARE_DEPLOYMENT.md#troubleshooting)

---

## Status: READY FOR DEPLOYMENT ✅

The application is fully configured and tested locally. You can now proceed with either deployment option above. The dashboard method is recommended for the first deployment as it provides a visual interface for configuration.