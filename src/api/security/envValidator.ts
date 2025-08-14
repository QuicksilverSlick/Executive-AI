/**
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Environment variable validation and secure configuration management
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250806-secure-api
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Implement secure environment variable validation with encryption support
 * - **Strategy:** Validate, encrypt, and monitor all environment variables containing secrets
 * - **Outcome:** Secure configuration management preventing accidental exposure
 */

import crypto from 'crypto';
import { SecurityAuditor } from '../config/security';

export interface EnvValidationRule {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'apikey';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  sensitive?: boolean; // Whether to encrypt this value
  validator?: (value: string) => boolean;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Record<string, any>;
  encryptedConfig: Record<string, string>; // Encrypted sensitive values
}

export interface SecureEnvConfig {
  encryptionKey: string;
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  validateOnStartup: boolean;
  allowDevOverrides: boolean;
}

/**
 * Environment Variable Security Validator
 * Validates, encrypts, and monitors environment variables with security focus
 */
export class EnvValidator {
  private encryptedValues: Map<string, string> = new Map();
  private readonly algorithm = 'aes-256-gcm';

  constructor(private config: SecureEnvConfig) {}

  /**
   * Define validation rules for the application
   */
  public static getValidationRules(): EnvValidationRule[] {
    return [
      {
        key: 'OPENAI_API_KEY',
        required: true,
        type: 'apikey',
        pattern: /^sk-[a-zA-Z0-9]{20,}$/,
        minLength: 40,
        sensitive: true,
        validator: (value) => value.startsWith('sk-') && value.length >= 40,
        description: 'OpenAI API key with proper format (sk-...)'
      },
      {
        key: 'KEY_ENCRYPTION_SECRET',
        required: true,
        type: 'string',
        minLength: 32,
        sensitive: true,
        validator: (value) => value.length >= 32,
        description: 'Encryption key for API key storage (minimum 32 characters)'
      },
      {
        key: 'OPENAI_ORGANIZATION_ID',
        required: false,
        type: 'string',
        pattern: /^org-[a-zA-Z0-9]+$/,
        sensitive: true,
        description: 'OpenAI Organization ID (optional)'
      },
      {
        key: 'ALLOWED_ORIGINS',
        required: true,
        type: 'string',
        defaultValue: 'http://localhost:4321,https://executiveaitraining.com',
        validator: this.validateOriginsList,
        description: 'Comma-separated list of allowed CORS origins'
      },
      {
        key: 'VOICE_AGENT_RATE_LIMIT',
        required: false,
        type: 'number',
        defaultValue: '10',
        validator: (value) => parseInt(value) > 0 && parseInt(value) <= 1000,
        description: 'Rate limit for voice agent requests per minute'
      },
      {
        key: 'VOICE_AGENT_TOKEN_DURATION',
        required: false,
        type: 'number',
        defaultValue: '60',
        validator: (value) => parseInt(value) >= 30 && parseInt(value) <= 300,
        description: 'Token duration in seconds (30-300)'
      },
      {
        key: 'VOICE_AGENT_DEMO_MODE',
        required: false,
        type: 'boolean',
        defaultValue: 'false',
        description: 'Enable demo mode for testing without API calls'
      },
      {
        key: 'PUBLIC_SITE_URL',
        required: true,
        type: 'url',
        defaultValue: 'https://executiveaitraining.com',
        validator: this.validateUrl,
        description: 'Public site URL for SEO and canonical URLs'
      },
      {
        key: 'PUBLIC_SITE_NAME',
        required: false,
        type: 'string',
        defaultValue: 'Executive AI Training',
        description: 'Site name for metadata'
      },
      {
        key: 'NODE_ENV',
        required: false,
        type: 'string',
        defaultValue: 'development',
        validator: (value) => ['development', 'staging', 'production'].includes(value),
        description: 'Node environment'
      },
      {
        key: 'DEBUG',
        required: false,
        type: 'boolean',
        defaultValue: 'false',
        description: 'Enable debug logging'
      },
      {
        key: 'SENTRY_DSN',
        required: false,
        type: 'url',
        sensitive: true,
        description: 'Sentry DSN for error tracking'
      },
      {
        key: 'GA_MEASUREMENT_ID',
        required: false,
        type: 'string',
        pattern: /^G-[A-Z0-9]+$/,
        description: 'Google Analytics Measurement ID'
      }
    ];
  }

  /**
   * Validate origins list format
   */
  private static validateOriginsList(value: string): boolean {
    const origins = value.split(',').map(o => o.trim());
    return origins.every(origin => {
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
  private static validateUrl(value: string): boolean {
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
  private encrypt(plaintext: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.config.encryptionKey);
    cipher.setAAD(Buffer.from('env'));

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive value
   */
  private decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.config.encryptionKey);
    decipher.setAAD(Buffer.from('env'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate environment variables against rules
   */
  public validate(
    env: Record<string, string | undefined> = process.env,
    rules: EnvValidationRule[] = EnvValidator.getValidationRules()
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Record<string, any> = {};
    const encryptedConfig: Record<string, string> = {};

    // Audit log validation start
    if (this.config.enableAuditLogging) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'ENV_VALIDATION_STARTED',
        clientIP: 'system',
        details: { ruleCount: rules.length },
        severity: 'low'
      });
    }

    for (const rule of rules) {
      const rawValue = env[rule.key];
      let value = rawValue || rule.defaultValue;

      // Check if required value is missing
      if (rule.required && !value) {
        errors.push(`Required environment variable '${rule.key}' is missing. ${rule.description}`);
        continue;
      }

      // Skip validation if value is undefined and not required
      if (!value && !rule.required) {
        continue;
      }

      // Type conversion and validation
      try {
        let validatedValue: any = value;

        switch (rule.type) {
          case 'number':
            validatedValue = parseInt(value!);
            if (isNaN(validatedValue)) {
              errors.push(`'${rule.key}' must be a valid number`);
              continue;
            }
            break;
          
          case 'boolean':
            validatedValue = value!.toLowerCase() === 'true';
            break;
          
          case 'url':
            try {
              new URL(value!);
            } catch {
              errors.push(`'${rule.key}' must be a valid URL`);
              continue;
            }
            break;
          
          case 'email':
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value!)) {
              errors.push(`'${rule.key}' must be a valid email address`);
              continue;
            }
            break;
          
          case 'apikey':
            if (!value!.match(/^[a-zA-Z0-9\-_]+$/)) {
              errors.push(`'${rule.key}' contains invalid characters for API key`);
              continue;
            }
            break;
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value!)) {
          errors.push(`'${rule.key}' does not match required pattern: ${rule.pattern.toString()}`);
          continue;
        }

        // Length validation
        if (rule.minLength && value!.length < rule.minLength) {
          errors.push(`'${rule.key}' must be at least ${rule.minLength} characters long`);
          continue;
        }

        if (rule.maxLength && value!.length > rule.maxLength) {
          errors.push(`'${rule.key}' must be no more than ${rule.maxLength} characters long`);
          continue;
        }

        // Custom validator
        if (rule.validator && !rule.validator(value!)) {
          errors.push(`'${rule.key}' failed custom validation. ${rule.description}`);
          continue;
        }

        // Store validated value
        config[rule.key] = validatedValue;

        // Encrypt sensitive values
        if (rule.sensitive && this.config.enableEncryption) {
          const encrypted = this.encrypt(value!);
          encryptedConfig[rule.key] = JSON.stringify(encrypted);
          this.encryptedValues.set(rule.key, JSON.stringify(encrypted));

          // Replace original value with placeholder in logs
          if (this.config.enableAuditLogging) {
            SecurityAuditor.log({
              timestamp: Date.now(),
              event: 'SENSITIVE_VALUE_ENCRYPTED',
              clientIP: 'system',
              details: { key: rule.key, valueLength: value!.length },
              severity: 'low'
            });
          }
        }

        // Generate warnings
        if (rule.key.includes('API_KEY') && value === rule.defaultValue) {
          warnings.push(`'${rule.key}' is using default value - consider using environment-specific value`);
        }

        if (rule.key === 'DEBUG' && validatedValue === true && config['NODE_ENV'] === 'production') {
          warnings.push('DEBUG mode is enabled in production environment');
        }

      } catch (error) {
        errors.push(`Error validating '${rule.key}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Check for unknown environment variables
    const knownKeys = new Set(rules.map(rule => rule.key));
    const unknownKeys = Object.keys(env).filter(key => 
      key.startsWith('OPENAI_') || 
      key.startsWith('VOICE_') || 
      key.startsWith('PUBLIC_') ||
      key.includes('API_KEY')
    ).filter(key => !knownKeys.has(key));

    unknownKeys.forEach(key => {
      warnings.push(`Unknown environment variable '${key}' detected - not validated`);
    });

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      config,
      encryptedConfig
    };

    // Audit log validation result
    if (this.config.enableAuditLogging) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'ENV_VALIDATION_COMPLETED',
        clientIP: 'system',
        details: {
          isValid: result.isValid,
          errorCount: errors.length,
          warningCount: warnings.length,
          encryptedValuesCount: Object.keys(encryptedConfig).length
        },
        severity: result.isValid ? 'low' : 'high'
      });
    }

    return result;
  }

  /**
   * Get decrypted sensitive value
   */
  public getDecryptedValue(key: string): string | null {
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
  public generateEnvTemplate(rules: EnvValidationRule[] = EnvValidator.getValidationRules()): string {
    const timestamp = new Date().toISOString();
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

    const sections = new Map<string, EnvValidationRule[]>();
    
    // Group rules by section
    rules.forEach(rule => {
      let section = 'OTHER';
      
      if (rule.key.startsWith('OPENAI_')) section = 'OPENAI_CONFIGURATION';
      else if (rule.key.startsWith('VOICE_')) section = 'VOICE_AGENT_CONFIGURATION';
      else if (rule.key.startsWith('PUBLIC_')) section = 'SITE_CONFIGURATION';
      else if (rule.key.includes('DEBUG') || rule.key === 'NODE_ENV') section = 'DEVELOPMENT';
      else if (rule.key.includes('SENTRY') || rule.key.includes('GA_')) section = 'MONITORING';
      else if (rule.key.includes('ENCRYPTION') || rule.key.includes('SECRET')) section = 'SECURITY';

      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(rule);
    });

    // Generate sections
    for (const [sectionName, sectionRules] of sections) {
      template += `# ${sectionName.replace(/_/g, ' ')}\n`;
      template += `# ${'='.repeat(sectionName.length + 2)}\n\n`;

      for (const rule of sectionRules) {
        // Add description
        template += `# ${rule.description}\n`;
        
        if (rule.required) {
          template += `# REQUIRED\n`;
        }
        
        if (rule.sensitive) {
          template += `# SENSITIVE - Keep secure and rotate regularly\n`;
        }

        if (rule.pattern) {
          template += `# Pattern: ${rule.pattern.toString()}\n`;
        }

        if (rule.validator === EnvValidator.validateOriginsList) {
          template += `# Format: comma-separated URLs (e.g., https://domain1.com,https://domain2.com)\n`;
        }

        // Add the environment variable
        if (rule.defaultValue) {
          template += `${rule.key}=${rule.defaultValue}\n`;
        } else if (rule.required && rule.sensitive) {
          template += `${rule.key}=your_${rule.key.toLowerCase()}_here\n`;
        } else {
          template += `# ${rule.key}=\n`;
        }
        
        template += '\n';
      }
      
      template += '\n';
    }

    return template;
  }

  /**
   * Check environment security posture
   */
  public checkSecurityPosture(env: Record<string, string | undefined> = process.env): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for exposed API keys in process environment
    const apiKeys = ['OPENAI_API_KEY'];
    apiKeys.forEach(key => {
      const value = env[key];
      if (value && value.length < 40) {
        issues.push(`${key} appears to be too short for a valid API key`);
        score -= 20;
      }
      
      if (value === 'your_api_key_here' || value?.includes('example')) {
        issues.push(`${key} appears to contain placeholder value`);
        score -= 30;
      }
    });

    // Check encryption secret
    const encryptionSecret = env['KEY_ENCRYPTION_SECRET'];
    if (!encryptionSecret) {
      issues.push('KEY_ENCRYPTION_SECRET is not set - API keys cannot be encrypted');
      score -= 25;
      recommendations.push('Generate a secure 32+ character encryption secret');
    } else if (encryptionSecret.length < 32) {
      issues.push('KEY_ENCRYPTION_SECRET is too short (minimum 32 characters)');
      score -= 15;
    }

    // Check NODE_ENV
    const nodeEnv = env['NODE_ENV'];
    if (nodeEnv === 'production') {
      if (env['DEBUG'] === 'true') {
        issues.push('DEBUG mode is enabled in production');
        score -= 10;
        recommendations.push('Disable DEBUG mode in production');
      }

      if (env['VOICE_AGENT_DEMO_MODE'] === 'true') {
        issues.push('Demo mode is enabled in production');
        score -= 15;
        recommendations.push('Disable demo mode in production');
      }
    }

    // Check CORS configuration
    const allowedOrigins = env['ALLOWED_ORIGINS'];
    if (allowedOrigins?.includes('localhost') && nodeEnv === 'production') {
      issues.push('Localhost origins allowed in production');
      score -= 20;
      recommendations.push('Remove localhost from allowed origins in production');
    }

    // General recommendations
    if (score === 100) {
      recommendations.push('Environment security posture looks good!');
      recommendations.push('Consider implementing regular API key rotation');
      recommendations.push('Monitor API key usage patterns for anomalies');
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
  public clearEncryptedValues(): void {
    this.encryptedValues.clear();
  }
}

/**
 * Initialize and validate environment on startup
 */
export function initializeSecureEnvironment(config?: Partial<SecureEnvConfig>): ValidationResult {
  const defaultConfig: SecureEnvConfig = {
    encryptionKey: process.env.KEY_ENCRYPTION_SECRET || crypto.randomBytes(32).toString('hex'),
    enableEncryption: process.env.NODE_ENV === 'production',
    enableAuditLogging: process.env.NODE_ENV === 'production',
    validateOnStartup: true,
    allowDevOverrides: process.env.NODE_ENV !== 'production'
  };

  const finalConfig = { ...defaultConfig, ...config };
  const validator = new EnvValidator(finalConfig);
  
  const result = validator.validate();
  
  if (!result.isValid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  • ${error}`));
    
    if (finalConfig.validateOnStartup) {
      throw new Error('Environment validation failed - cannot start application');
    }
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
  
  // Security posture check
  const securityCheck = validator.checkSecurityPosture();
  console.log(`🛡️ Environment security score: ${securityCheck.score}/100`);
  
  if (securityCheck.issues.length > 0) {
    console.warn('🚨 Security issues detected:');
    securityCheck.issues.forEach(issue => console.warn(`  • ${issue}`));
  }
  
  if (securityCheck.recommendations.length > 0) {
    console.log('💡 Security recommendations:');
    securityCheck.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  return result;
}

/**
 * Generate new .env.example file
 */
export function generateEnvExample(): void {
  const validator = new EnvValidator({
    encryptionKey: '',
    enableEncryption: false,
    enableAuditLogging: false,
    validateOnStartup: false,
    allowDevOverrides: true
  });
  
  const template = validator.generateEnvTemplate();
  console.log('Generated .env.example template:');
  console.log('='.repeat(50));
  console.log(template);
}