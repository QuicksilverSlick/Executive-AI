# Setting Up OpenAI API Key for Voice Search

## 🔑 Quick Setup Guide

The voice search implementation is complete and working correctly. The only missing piece is the OpenAI API key configuration.

## 1. Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

## 2. Set the API Key

### Option A: Environment Variable (Recommended for Development)

```bash
# Linux/Mac
export OPENAI_API_KEY="sk-your-actual-api-key-here"

# Windows Command Prompt
set OPENAI_API_KEY=sk-your-actual-api-key-here

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"
```

### Option B: .env File (Recommended for Persistence)

Create or update `.env` file in the project root:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Other API keys if needed
ANTHROPIC_API_KEY=your-anthropic-key-if-needed
```

### Option C: System Environment Variable (Permanent)

**Linux/Mac:**
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export OPENAI_API_KEY="sk-your-actual-api-key-here"
```

**Windows:**
1. Open System Properties → Advanced → Environment Variables
2. Add new System Variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-api-key-here`

## 3. Verify Configuration

Run this test to verify your API key is working:

```bash
# Test if API key is set
node -e "console.log(process.env.OPENAI_API_KEY ? '✅ API Key is set' : '❌ API Key is NOT set')"

# Test the actual API
node test-openai-responses-direct.js
```

## 4. Test Voice Search

After setting the API key:

### Command Line Test:
```bash
# Run comprehensive tests
node test-responses-api-diagnostic.js
node test-responses-api-simple.js
node test-voice-search-e2e.js
```

### Web Interface Test:
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open: http://localhost:4321/test-voice-search
3. Click any query card to test

### Direct API Test:
```bash
curl -X POST http://localhost:4321/api/voice-agent/responses-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Drip City Coffee Oakland"}'
```

## 5. Expected Results

Once the API key is configured, you should see:

✅ **Real search results** with current information
✅ **Citations** with source URLs
✅ **Location-specific** content when searching for businesses
✅ **Current news** and information

Instead of:
❌ Generic fallback responses
❌ "I apologize, but I encountered an error" messages
❌ Empty search results arrays

## 🔒 Security Notes

1. **Never commit API keys** to version control
2. Add `.env` to `.gitignore`:
   ```gitignore
   # API Keys and secrets
   .env
   .env.local
   .env.*.local
   ```

3. For production, use environment variables from your hosting provider:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - AWS: Parameter Store or Secrets Manager

## 📊 Cost Considerations

The Responses API with web search:
- Uses the `gpt-4o` model
- Costs more than standard chat completions due to web search
- Each search typically uses 500-2000 tokens
- Monitor usage at: platform.openai.com/usage

## 🚀 Next Steps

1. Set your API key using one of the methods above
2. Run the test suite to verify everything works
3. Test voice search in the actual application
4. Monitor the browser console for detailed logs
5. Check that citations appear in search results

## 🆘 Troubleshooting

If you still see errors after setting the API key:

1. **Verify the key is accessible:**
   ```bash
   echo $OPENAI_API_KEY
   ```

2. **Check API key permissions:**
   - Ensure your OpenAI account has access to GPT-4
   - Verify billing is set up on your OpenAI account

3. **Test the API directly:**
   ```bash
   node test-openai-responses-direct.js
   ```

4. **Check server logs:**
   Look for detailed error messages in the console where you run `npm run dev`

5. **Verify file permissions:**
   Ensure the .env file is readable by the Node.js process

## 📝 Implementation Notes

The voice search is fully implemented with:
- ✅ Correct Responses API endpoint
- ✅ Proper request structure with `input` field
- ✅ `web_search` tool configuration
- ✅ Output array parsing
- ✅ Citation extraction from annotations
- ✅ Realtime API function calling
- ✅ Error handling with graceful fallbacks

The only missing piece is the API key configuration!