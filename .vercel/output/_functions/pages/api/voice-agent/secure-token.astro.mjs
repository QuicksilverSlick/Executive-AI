import { c as createTokenRateLimiter, b as createRateLimitMiddleware } from '../../../chunks/rateLimiter_B7mgpYIE.mjs';
import { S as SecurityAuditor, g as getSecurityConfig, c as getKeyManager, a as getSecureProxy, b as getSecurityHeaders, v as validateRequest } from '../../../chunks/secureProxy_8Wiy_pmD.mjs';
import crypto from 'crypto';
export { renderers } from '../../../renderers.mjs';

class EnvValidator {
  constructor(config) {
    this.config = config;
  }
  encryptedValues = /* @__PURE__ */ new Map();
  algorithm = "aes-256-gcm";
  /**
   * Define validation rules for the application
   */
  static getValidationRules() {
    return [
      {
        key: "OPENAI_API_KEY",
        required: true,
        type: "apikey",
        pattern: /^sk-[a-zA-Z0-9]{20,}$/,
        minLength: 40,
        sensitive: true,
        validator: (value) => value.startsWith("sk-") && value.length >= 40,
        description: "OpenAI API key with proper format (sk-...)"
      },
      {
        key: "KEY_ENCRYPTION_SECRET",
        required: true,
        type: "string",
        minLength: 32,
        sensitive: true,
        validator: (value) => value.length >= 32,
        description: "Encryption key for API key storage (minimum 32 characters)"
      },
      {
        key: "OPENAI_ORGANIZATION_ID",
        required: false,
        type: "string",
        pattern: /^org-[a-zA-Z0-9]+$/,
        sensitive: true,
        description: "OpenAI Organization ID (optional)"
      },
      {
        key: "ALLOWED_ORIGINS",
        required: true,
        type: "string",
        defaultValue: "http://localhost:4321,https://executiveaitraining.com",
        validator: this.validateOriginsList,
        description: "Comma-separated list of allowed CORS origins"
      },
      {
        key: "VOICE_AGENT_RATE_LIMIT",
        required: false,
        type: "number",
        defaultValue: "10",
        validator: (value) => parseInt(value) > 0 && parseInt(value) <= 1e3,
        description: "Rate limit for voice agent requests per minute"
      },
      {
        key: "VOICE_AGENT_TOKEN_DURATION",
        required: false,
        type: "number",
        defaultValue: "60",
        validator: (value) => parseInt(value) >= 30 && parseInt(value) <= 300,
        description: "Token duration in seconds (30-300)"
      },
      {
        key: "VOICE_AGENT_DEMO_MODE",
        required: false,
        type: "boolean",
        defaultValue: "false",
        description: "Enable demo mode for testing without API calls"
      },
      {
        key: "PUBLIC_SITE_URL",
        required: true,
        type: "url",
        defaultValue: "https://executiveaitraining.com",
        validator: this.validateUrl,
        description: "Public site URL for SEO and canonical URLs"
      },
      {
        key: "PUBLIC_SITE_NAME",
        required: false,
        type: "string",
        defaultValue: "Executive AI Training",
        description: "Site name for metadata"
      },
      {
        key: "NODE_ENV",
        required: false,
        type: "string",
        defaultValue: "development",
        validator: (value) => ["development", "staging", "production"].includes(value),
        description: "Node environment"
      },
      {
        key: "DEBUG",
        required: false,
        type: "boolean",
        defaultValue: "false",
        description: "Enable debug logging"
      },
      {
        key: "SENTRY_DSN",
        required: false,
        type: "url",
        sensitive: true,
        description: "Sentry DSN for error tracking"
      },
      {
        key: "GA_MEASUREMENT_ID",
        required: false,
        type: "string",
        pattern: /^G-[A-Z0-9]+$/,
        description: "Google Analytics Measurement ID"
      }
    ];
  }
  /**
   * Validate origins list format
   */
  static validateOriginsList(value) {
    const origins = value.split(",").map((o) => o.trim());
    return origins.every((origin) => {
      try {
        new URL(origin);
        return true;
      } catch {
        return false;
      }
    });
  }
  /**
   * Validate URL format
   */
  static validateUrl(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Encrypt sensitive value
   */
  encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.config.encryptionKey);
    cipher.setAAD(Buffer.from("env"));
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();
    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex")
    };
  }
  /**
   * Decrypt sensitive value
   */
  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.config.encryptionKey);
    decipher.setAAD(Buffer.from("env"));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));
    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  /**
   * Validate environment variables against rules
   */
  validate(env = process.env, rules = EnvValidator.getValidationRules()) {
    const errors = [];
    const warnings = [];
    const config = {};
    const encryptedConfig = {};
    if (this.config.enableAuditLogging) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "ENV_VALIDATION_STARTED",
        clientIP: "system",
        details: { ruleCount: rules.length },
        severity: "low"
      });
    }
    for (const rule of rules) {
      const rawValue = env[rule.key];
      let value = rawValue || rule.defaultValue;
      if (rule.required && !value) {
        errors.push(`Required environment variable '${rule.key}' is missing. ${rule.description}`);
        continue;
      }
      if (!value && !rule.required) {
        continue;
      }
      try {
        let validatedValue = value;
        switch (rule.type) {
          case "number":
            validatedValue = parseInt(value);
            if (isNaN(validatedValue)) {
              errors.push(`'${rule.key}' must be a valid number`);
              continue;
            }
            break;
          case "boolean":
            validatedValue = value.toLowerCase() === "true";
            break;
          case "url":
            try {
              new URL(value);
            } catch {
              errors.push(`'${rule.key}' must be a valid URL`);
              continue;
            }
            break;
          case "email":
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
              errors.push(`'${rule.key}' must be a valid email address`);
              continue;
            }
            break;
          case "apikey":
            if (!value.match(/^[a-zA-Z0-9\-_]+$/)) {
              errors.push(`'${rule.key}' contains invalid characters for API key`);
              continue;
            }
            break;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`'${rule.key}' does not match required pattern: ${rule.pattern.toString()}`);
          continue;
        }
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`'${rule.key}' must be at least ${rule.minLength} characters long`);
          continue;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`'${rule.key}' must be no more than ${rule.maxLength} characters long`);
          continue;
        }
        if (rule.validator && !rule.validator(value)) {
          errors.push(`'${rule.key}' failed custom validation. ${rule.description}`);
          continue;
        }
        config[rule.key] = validatedValue;
        if (rule.sensitive && this.config.enableEncryption) {
          const encrypted = this.encrypt(value);
          encryptedConfig[rule.key] = JSON.stringify(encrypted);
          this.encryptedValues.set(rule.key, JSON.stringify(encrypted));
          if (this.config.enableAuditLogging) {
            SecurityAuditor.log({
              timestamp: Date.now(),
              event: "SENSITIVE_VALUE_ENCRYPTED",
              clientIP: "system",
              details: { key: rule.key, valueLength: value.length },
              severity: "low"
            });
          }
        }
        if (rule.key.includes("API_KEY") && value === rule.defaultValue) {
          warnings.push(`'${rule.key}' is using default value - consider using environment-specific value`);
        }
        if (rule.key === "DEBUG" && validatedValue === true && config["NODE_ENV"] === "production") {
          warnings.push("DEBUG mode is enabled in production environment");
        }
      } catch (error) {
        errors.push(`Error validating '${rule.key}': ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
    const knownKeys = new Set(rules.map((rule) => rule.key));
    const unknownKeys = Object.keys(env).filter(
      (key) => key.startsWith("OPENAI_") || key.startsWith("VOICE_") || key.startsWith("PUBLIC_") || key.includes("API_KEY")
    ).filter((key) => !knownKeys.has(key));
    unknownKeys.forEach((key) => {
      warnings.push(`Unknown environment variable '${key}' detected - not validated`);
    });
    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
      config,
      encryptedConfig
    };
    if (this.config.enableAuditLogging) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "ENV_VALIDATION_COMPLETED",
        clientIP: "system",
        details: {
          isValid: result.isValid,
          errorCount: errors.length,
          warningCount: warnings.length,
          encryptedValuesCount: Object.keys(encryptedConfig).length
        },
        severity: result.isValid ? "low" : "high"
      });
    }
    return result;
  }
  /**
   * Get decrypted sensitive value
   */
  getDecryptedValue(key) {
    const encryptedData = this.encryptedValues.get(key);
    if (!encryptedData) {
      return null;
    }
    try {
      const parsed = JSON.parse(encryptedData);
      return this.decrypt(parsed);
    } catch (error) {
      console.error(`Failed to decrypt value for '${key}':`, error);
      return null;
    }
  }
  /**
   * Generate secure .env template
   */
  generateEnvTemplate(rules = EnvValidator.getValidationRules()) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    let template = `# =============================================================================
# Executive AI Training Platform - Secure Environment Configuration
# Generated: ${timestamp}
# =============================================================================
# 
# SECURITY NOTICE:
# - Never commit actual API keys or sensitive values to version control
# - Use environment-specific configuration management in production
# - Rotate API keys regularly (recommended: every 7 days for production)
# - Monitor API key usage for anomalies
#
# =============================================================================

`;
    const sections = /* @__PURE__ */ new Map();
    rules.forEach((rule) => {
      let section = "OTHER";
      if (rule.key.startsWith("OPENAI_")) section = "OPENAI_CONFIGURATION";
      else if (rule.key.startsWith("VOICE_")) section = "VOICE_AGENT_CONFIGURATION";
      else if (rule.key.startsWith("PUBLIC_")) section = "SITE_CONFIGURATION";
      else if (rule.key.includes("DEBUG") || rule.key === "NODE_ENV") section = "DEVELOPMENT";
      else if (rule.key.includes("SENTRY") || rule.key.includes("GA_")) section = "MONITORING";
      else if (rule.key.includes("ENCRYPTION") || rule.key.includes("SECRET")) section = "SECURITY";
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section).push(rule);
    });
    for (const [sectionName, sectionRules] of sections) {
      template += `# ${sectionName.replace(/_/g, " ")}
`;
      template += `# ${"=".repeat(sectionName.length + 2)}

`;
      for (const rule of sectionRules) {
        template += `# ${rule.description}
`;
        if (rule.required) {
          template += `# REQUIRED
`;
        }
        if (rule.sensitive) {
          template += `# SENSITIVE - Keep secure and rotate regularly
`;
        }
        if (rule.pattern) {
          template += `# Pattern: ${rule.pattern.toString()}
`;
        }
        if (rule.validator === EnvValidator.validateOriginsList) {
          template += `# Format: comma-separated URLs (e.g., https://domain1.com,https://domain2.com)
`;
        }
        if (rule.defaultValue) {
          template += `${rule.key}=${rule.defaultValue}
`;
        } else if (rule.required && rule.sensitive) {
          template += `${rule.key}=your_${rule.key.toLowerCase()}_here
`;
        } else {
          template += `# ${rule.key}=
`;
        }
        template += "\n";
      }
      template += "\n";
    }
    return template;
  }
  /**
   * Check environment security posture
   */
  checkSecurityPosture(env = process.env) {
    const issues = [];
    const recommendations = [];
    let score = 100;
    const apiKeys = ["OPENAI_API_KEY"];
    apiKeys.forEach((key) => {
      const value = env[key];
      if (value && value.length < 40) {
        issues.push(`${key} appears to be too short for a valid API key`);
        score -= 20;
      }
      if (value === "your_api_key_here" || value?.includes("example")) {
        issues.push(`${key} appears to contain placeholder value`);
        score -= 30;
      }
    });
    const encryptionSecret = env["KEY_ENCRYPTION_SECRET"];
    if (!encryptionSecret) {
      issues.push("KEY_ENCRYPTION_SECRET is not set - API keys cannot be encrypted");
      score -= 25;
      recommendations.push("Generate a secure 32+ character encryption secret");
    } else if (encryptionSecret.length < 32) {
      issues.push("KEY_ENCRYPTION_SECRET is too short (minimum 32 characters)");
      score -= 15;
    }
    const nodeEnv = env["NODE_ENV"];
    if (nodeEnv === "production") {
      if (env["DEBUG"] === "true") {
        issues.push("DEBUG mode is enabled in production");
        score -= 10;
        recommendations.push("Disable DEBUG mode in production");
      }
      if (env["VOICE_AGENT_DEMO_MODE"] === "true") {
        issues.push("Demo mode is enabled in production");
        score -= 15;
        recommendations.push("Disable demo mode in production");
      }
    }
    const allowedOrigins = env["ALLOWED_ORIGINS"];
    if (allowedOrigins?.includes("localhost") && nodeEnv === "production") {
      issues.push("Localhost origins allowed in production");
      score -= 20;
      recommendations.push("Remove localhost from allowed origins in production");
    }
    if (score === 100) {
      recommendations.push("Environment security posture looks good!");
      recommendations.push("Consider implementing regular API key rotation");
      recommendations.push("Monitor API key usage patterns for anomalies");
    }
    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
  /**
   * Clear encrypted values (for cleanup)
   */
  clearEncryptedValues() {
    this.encryptedValues.clear();
  }
}
function initializeSecureEnvironment(config) {
  const defaultConfig = {
    encryptionKey: process.env.KEY_ENCRYPTION_SECRET || crypto.randomBytes(32).toString("hex"),
    enableEncryption: process.env.NODE_ENV === "production",
    enableAuditLogging: process.env.NODE_ENV === "production",
    validateOnStartup: true,
    allowDevOverrides: process.env.NODE_ENV !== "production"
  };
  const finalConfig = { ...defaultConfig, ...config };
  const validator = new EnvValidator(finalConfig);
  const result = validator.validate();
  if (!result.isValid) {
    console.error("❌ Environment validation failed:");
    result.errors.forEach((error) => console.error(`  • ${error}`));
    if (finalConfig.validateOnStartup) {
      throw new Error("Environment validation failed - cannot start application");
    }
  }
  if (result.warnings.length > 0) {
    console.warn("⚠️ Environment warnings:");
    result.warnings.forEach((warning) => console.warn(`  • ${warning}`));
  }
  const securityCheck = validator.checkSecurityPosture();
  console.log(`🛡️ Environment security score: ${securityCheck.score}/100`);
  if (securityCheck.issues.length > 0) {
    console.warn("🚨 Security issues detected:");
    securityCheck.issues.forEach((issue) => console.warn(`  • ${issue}`));
  }
  if (securityCheck.recommendations.length > 0) {
    console.log("💡 Security recommendations:");
    securityCheck.recommendations.forEach((rec) => console.log(`  • ${rec}`));
  }
  return result;
}

const prerender = false;
let environmentValidation;
try {
  environmentValidation = initializeSecureEnvironment();
} catch (error) {
  console.error("❌ Environment validation failed:", error);
  environmentValidation = { isValid: false, errors: [error.message] };
}
const securityConfig = getSecurityConfig();
const keyManager = getKeyManager(process.env.NODE_ENV);
const secureProxy = getSecureProxy();
const tokenRateLimiter = createTokenRateLimiter({
  windowMs: securityConfig.rateLimit.windowMs,
  maxRequests: securityConfig.rateLimit.maxRequests,
  onLimitReached: (clientIP, attempts) => {
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: "RATE_LIMIT_EXCEEDED",
      clientIP,
      details: { attempts, endpoint: "/api/voice-agent/secure-token" },
      severity: "medium"
    });
  }
});
async function detectAPICapabilities() {
  const warnings = [];
  if (process.env.VOICE_AGENT_DEMO_MODE === "true") {
    return {
      mode: "demo",
      capabilities: ["demo"],
      warnings: ["Running in demo mode - no actual API calls will be made"]
    };
  }
  const apiKey = keyManager.getKey("openai_primary", "system", "capability-check");
  if (!apiKey) {
    return {
      mode: "demo",
      capabilities: ["demo"],
      warnings: ["No API key available - using demo mode"]
    };
  }
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        modalities: ["audio", "text"],
        instructions: "Test connection"
      })
    });
    if (response.ok) {
      return {
        mode: "realtime",
        capabilities: ["realtime", "voice", "text"],
        warnings: []
      };
    } else if (response.status === 403 || response.status === 404) {
      warnings.push("Realtime API not available - using secure proxy mode");
      return {
        mode: "proxy",
        capabilities: ["chat", "tts", "stt"],
        warnings
      };
    } else {
      throw new Error(`API test failed: ${response.status}`);
    }
  } catch (error) {
    warnings.push("API connectivity issues - using secure proxy mode");
    return {
      mode: "proxy",
      capabilities: ["chat", "tts", "stt"],
      warnings
    };
  }
}
async function generateRealtimeToken() {
  const apiKey = keyManager.getKey("openai_primary", "system", "realtime-token");
  if (!apiKey) {
    throw new Error("API key not available");
  }
  const requestBody = {
    model: "gpt-4o-realtime-preview-2024-12-17",
    modalities: ["audio", "text"],
    instructions: "You are a helpful AI assistant for executive training. Provide clear, professional responses with a warm and engaging tone. You have access to web search to provide current information.",
    voice: "sage",
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
    input_audio_transcription: {
      model: "whisper-1"
    },
    turn_detection: {
      type: "server_vad",
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 200
    },
    tools: [{
      type: "function",
      function: {
        name: "web_search",
        description: "Search the web for current information",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query" }
          },
          required: ["query"]
        }
      }
    }]
  };
  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Realtime token generation failed: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  if (!data.client_secret?.value || !data.client_secret?.expires_at) {
    throw new Error("Invalid token response structure from OpenAI API");
  }
  return {
    token: data.client_secret.value,
    expiresAt: data.client_secret.expires_at * 1e3,
    sessionId: data.id || `session_${Date.now()}`
  };
}
async function generateSecureProxyToken(sessionId) {
  const proxyToken = secureProxy.generateSecureProxyToken(sessionId);
  return {
    token: proxyToken.token,
    expiresAt: proxyToken.expiresAt,
    sessionId,
    proxyEndpoint: proxyToken.proxyEndpoint
  };
}
async function generateDemoToken() {
  return {
    token: `demo_${crypto.randomBytes(16).toString("hex")}`,
    expiresAt: Date.now() + 30 * 60 * 1e3,
    // 30 minutes
    sessionId: `demo_session_${Date.now()}`
  };
}
const POST = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString("hex");
  console.log(`🔐 [${requestId}] Secure token request started at ${(/* @__PURE__ */ new Date()).toISOString()}`);
  const clientIP = clientAddress || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const origin = request.headers.get("origin");
  const userAgent = request.headers.get("user-agent") || "unknown";
  try {
    if (!environmentValidation.isValid) {
      console.error(`❌ [${requestId}] Environment validation failed`);
      return new Response(JSON.stringify({
        success: false,
        error: "Service configuration error"
      }), {
        status: 503,
        headers: getSecurityHeaders(securityConfig, origin || void 0)
      });
    }
    const securityValidation = validateRequest(request, clientIP, securityConfig);
    if (!securityValidation.valid) {
      console.error(`❌ [${requestId}] Security validation failed: ${securityValidation.reason}`);
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "SECURITY_VALIDATION_FAILED",
        clientIP,
        userAgent,
        details: {
          reason: securityValidation.reason,
          requestId,
          origin
        },
        severity: securityValidation.shouldBlock ? "high" : "medium"
      });
      if (securityValidation.shouldBlock) {
        return new Response(JSON.stringify({
          success: false,
          error: "Request blocked by security policy"
        }), {
          status: 403,
          headers: getSecurityHeaders(securityConfig, origin || void 0)
        });
      }
    }
    const rateLimitMiddleware = createRateLimitMiddleware(tokenRateLimiter);
    const rateLimitResponse = rateLimitMiddleware(request, clientIP);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    console.log(`✅ [${requestId}] Security checks passed, detecting API capabilities...`);
    const { mode, capabilities, warnings } = await detectAPICapabilities();
    console.log(`🎯 [${requestId}] Detected mode: ${mode}, capabilities: ${capabilities.join(", ")}`);
    let tokenData;
    let responseWarnings = warnings;
    const sessionId = `session_${requestId}_${Date.now()}`;
    switch (mode) {
      case "realtime":
        try {
          const realtimeToken = await generateRealtimeToken();
          tokenData = {
            token: realtimeToken.token,
            expiresAt: realtimeToken.expiresAt,
            sessionId: realtimeToken.sessionId,
            mode: "realtime",
            capabilities
          };
        } catch (error) {
          console.warn(`⚠️ [${requestId}] Realtime token generation failed, falling back to proxy mode`);
          const proxyToken2 = await generateSecureProxyToken(sessionId);
          tokenData = {
            token: proxyToken2.token,
            expiresAt: proxyToken2.expiresAt,
            sessionId: proxyToken2.sessionId,
            proxyEndpoint: proxyToken2.proxyEndpoint,
            mode: "proxy",
            capabilities: ["chat", "tts", "stt"]
          };
          responseWarnings.push("Realtime API temporarily unavailable - using secure proxy mode");
        }
        break;
      case "proxy":
        const proxyToken = await generateSecureProxyToken(sessionId);
        tokenData = {
          token: proxyToken.token,
          expiresAt: proxyToken.expiresAt,
          sessionId: proxyToken.sessionId,
          proxyEndpoint: proxyToken.proxyEndpoint,
          mode: "proxy",
          capabilities
        };
        break;
      case "demo":
        const demoToken = await generateDemoToken();
        tokenData = {
          token: demoToken.token,
          expiresAt: demoToken.expiresAt,
          sessionId: demoToken.sessionId,
          mode: "demo",
          capabilities
        };
        break;
      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }
    const response = {
      success: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      sessionId: tokenData.sessionId,
      mode: tokenData.mode,
      ...tokenData.proxyEndpoint && { proxyEndpoint: tokenData.proxyEndpoint },
      ...tokenData.capabilities && { capabilities: tokenData.capabilities },
      ...responseWarnings.length > 0 && { warnings: responseWarnings }
    };
    const processingTime = Date.now() - startTime;
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: "SECURE_TOKEN_GENERATED",
      clientIP,
      userAgent,
      details: {
        requestId,
        sessionId: response.sessionId,
        mode: response.mode,
        processingTime,
        capabilities: tokenData.capabilities
      },
      severity: "low"
    });
    console.log(`✅ [${requestId}] Secure token generated successfully:`, {
      sessionId: response.sessionId,
      mode: response.mode,
      processingTime: `${processingTime}ms`,
      expiresAt: new Date(response.expiresAt).toISOString()
    });
    const responseHeaders = {
      ...getSecurityHeaders(securityConfig, origin || void 0),
      "Content-Type": "application/json",
      "X-Processing-Time": processingTime.toString(),
      "X-Session-Id": response.sessionId,
      "X-Token-Mode": response.mode,
      "X-Request-Id": requestId
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ [${requestId}] Token generation error:`, error);
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: "SECURE_TOKEN_ERROR",
      clientIP,
      userAgent,
      details: {
        requestId,
        error: errorMessage,
        processingTime
      },
      severity: "high"
    });
    return new Response(JSON.stringify({
      success: false,
      error: "Token generation failed"
    }), {
      status: 500,
      headers: {
        ...getSecurityHeaders(securityConfig, origin || void 0),
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString(),
        "X-Request-Id": requestId
      }
    });
  }
};
const GET = async ({ request }) => {
  const origin = request.headers.get("origin");
  return new Response(JSON.stringify({
    success: false,
    error: "Method not allowed. Use POST to generate secure tokens.",
    hint: "This endpoint generates secure tokens that never expose API keys.",
    documentation: "/docs/api/secure-token"
  }), {
    status: 405,
    headers: {
      ...getSecurityHeaders(securityConfig, origin || void 0),
      "Content-Type": "application/json",
      "Allow": "POST, OPTIONS"
    }
  });
};
const OPTIONS = async ({ request }) => {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 200,
    headers: getSecurityHeaders(securityConfig, origin || void 0)
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
