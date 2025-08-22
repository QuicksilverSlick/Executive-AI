# Cloudflare Workers Deployment Setup Guide

## 🔐 Step 1: Authenticate with Cloudflare

You need to log in to Cloudflare first. Run:

```bash
npx wrangler login
```

This will open a browser window. Log in with your Cloudflare account and grant Wrangler permission to access your account.

### Alternative: API Token Authentication

If you prefer to use an API token (for CI/CD or non-interactive environments):

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Set the token permissions:
   - Account: Cloudflare Workers Scripts:Edit
   - Account: Workers KV Storage:Edit
   - Zone: Workers Routes:Edit (if using custom domain)
5. Copy the token and set it as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

## 📦 Step 2: Create KV Namespaces

After authentication, create the KV namespaces:

```bash
npm run workers:kv:create
```

This will create all required namespaces and automatically update your `wrangler.toml` file.

## 🔑 Step 3: Set Secrets

Set the required secrets for your Workers deployment:

```bash
# OpenAI API Key (required for voice agent)
npx wrangler secret put OPENAI_API_KEY
# Enter your OpenAI API key when prompted

# JWT Secret (for session management)
npx wrangler secret put JWT_SECRET
# Enter a secure random string (32+ characters)

# Admin Password (for admin endpoints)
npx wrangler secret put ADMIN_PASSWORD
# Enter a secure password
```

### Generating Secure Secrets

To generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## 🏗️ Step 4: Build the Application

Build the application for Workers:

```bash
npm run build:workers
```

This will:
- Build the Astro application
- Bundle assets for Workers
- Optimize the deployment bundle

## 🚀 Step 5: Deploy to Workers

### Deploy to Production

```bash
npm run workers:deploy
```

### Deploy to Staging (Optional)

```bash
npm run workers:deploy:staging
```

## ✅ Step 6: Verify Deployment

After deployment, Wrangler will output your Workers URL:

```
✨ Deployment complete!
🌍 Worker deployed to: https://executive-ai-training.your-subdomain.workers.dev
```

Visit the URL to verify your voice agent is working.

## 🌐 Step 7: Custom Domain (Optional)

To use a custom domain:

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages > Your Worker
3. Click "Custom Domains"
4. Add your domain (e.g., voice.yourdomain.com)
5. Update DNS records as instructed

## 🧪 Testing the Voice Agent

Once deployed, test the voice agent:

1. Visit your Workers URL
2. Click the microphone icon
3. Grant microphone permissions
4. Start speaking to test the voice interaction

### Test Endpoints

- Health check: `https://your-worker.workers.dev/api/voice-agent/health`
- Compatibility: `https://your-worker.workers.dev/api/voice-agent/compatibility`
- Voice test page: `https://your-worker.workers.dev/voice-agent-test`

## 🔍 Monitoring

View logs and metrics:

```bash
# View live logs
npx wrangler tail

# View logs for specific deployment
npx wrangler tail --env production
```

## 🐛 Troubleshooting

### Authentication Issues

If you see "not authenticated" errors:
```bash
npx wrangler logout
npx wrangler login
```

### KV Namespace Issues

List existing namespaces:
```bash
npx wrangler kv namespace list
```

Delete a namespace (be careful!):
```bash
npx wrangler kv namespace delete --namespace-id=<id>
```

### Build Issues

Clean build:
```bash
rm -rf dist .wrangler
npm run build:workers
```

### Deployment Issues

Check deployment status:
```bash
npx wrangler deployments list
```

Rollback to previous version:
```bash
npx wrangler rollback
```

## 📊 Performance Monitoring

Your Workers deployment includes built-in performance monitoring:

1. **KV Performance Logs**: Automatically logs slow requests (>1s)
2. **Rate Limiting**: Prevents abuse with configurable limits
3. **Session Management**: 30-minute session TTL with KV storage

View performance metrics in your Cloudflare dashboard:
Workers & Pages > Your Worker > Analytics

## 🎉 Success!

Once all steps are complete, your Executive AI Training voice agent will be live on Cloudflare Workers with:

- ✅ Ultra-low latency (<50ms API responses)
- ✅ Global edge deployment
- ✅ Automatic scaling
- ✅ Built-in DDoS protection
- ✅ WebRTC voice support
- ✅ OpenAI Realtime API integration

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Workers KV Documentation](https://developers.cloudflare.com/kv/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)

---

**Need Help?** Check the logs with `npx wrangler tail` or view the [troubleshooting guide](#-troubleshooting) above.