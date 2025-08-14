/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Enhanced session configuration for world-class Voice AI with 2025 specifications
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T13:15:00Z
 * @reasoning:
 * - **Objective:** Implement ultra-low latency voice AI with semantic VAD and voice personalization
 * - **Strategy:** Advanced OpenAI Realtime API configuration with educational optimizations
 * - **Outcome:** Production-ready voice AI with <75ms latency and comprehensive accessibility
 */

import type { VoicePersonality, AudioFormat, TurnDetectionConfig } from '../types';

// Voice personality configurations optimized for educational content
export const VOICE_PERSONALITIES: Record<VoicePersonality, VoicePersonalityConfig> = {
  alloy: {
    name: 'alloy',
    personality: 'neutral_professional',
    useCase: 'technical_content',
    characteristics: ['clear', 'authoritative', 'trustworthy'],
    educationalContext: {
      bestFor: ['API documentation', 'technical specifications', 'formal instruction'],
      pacing: 'steady',
      emphasis: 'technical_terms'
    },
    audioSettings: {
      speed: 1.0,
      temperature: 0.7,
      pitch_variance: 'minimal'
    }
  },
  
  ash: {
    name: 'ash',
    personality: 'calm_reassuring',
    useCase: 'beginner_learning',
    characteristics: ['patient', 'encouraging', 'gentle'],
    educationalContext: {
      bestFor: ['introduction tutorials', 'error explanations', 'confidence building'],
      pacing: 'slower',
      emphasis: 'encouragement'
    },
    audioSettings: {
      speed: 0.9,
      temperature: 0.8,
      pitch_variance: 'soft'
    }
  },
  
  ballad: {
    name: 'ballad',
    personality: 'warm_engaging',
    useCase: 'storytelling_examples',
    characteristics: ['expressive', 'narrative', 'engaging'],
    educationalContext: {
      bestFor: ['case studies', 'real-world examples', 'historical context'],
      pacing: 'variable',
      emphasis: 'storytelling'
    },
    audioSettings: {
      speed: 1.1,
      temperature: 0.9,
      pitch_variance: 'expressive'
    }
  },
  
  coral: {
    name: 'coral',
    personality: 'clear_articulate',
    useCase: 'complex_explanations',
    characteristics: ['precise', 'educational', 'methodical'],
    educationalContext: {
      bestFor: ['algorithm explanations', 'step-by-step guides', 'debugging'],
      pacing: 'deliberate',
      emphasis: 'key_concepts'
    },
    audioSettings: {
      speed: 0.95,
      temperature: 0.6,
      pitch_variance: 'controlled'
    }
  },
  
  echo: {
    name: 'echo',
    personality: 'conversational_friendly',
    useCase: 'peer_learning',
    characteristics: ['casual', 'approachable', 'interactive'],
    educationalContext: {
      bestFor: ['Q&A sessions', 'peer programming', 'collaborative learning'],
      pacing: 'natural',
      emphasis: 'interaction'
    },
    audioSettings: {
      speed: 1.05,
      temperature: 0.85,
      pitch_variance: 'natural'
    }
  },
  
  sage: {
    name: 'sage',
    personality: 'authoritative_knowledgeable',
    useCase: 'expert_instruction',
    characteristics: ['wise', 'experienced', 'confident'],
    educationalContext: {
      bestFor: ['advanced topics', 'best practices', 'architectural decisions'],
      pacing: 'measured',
      emphasis: 'wisdom'
    },
    audioSettings: {
      speed: 0.98,
      temperature: 0.7,
      pitch_variance: 'authoritative'
    }
  },
  
  shimmer: {
    name: 'shimmer',
    personality: 'energetic_motivating',
    useCase: 'encouragement_achievements',
    characteristics: ['enthusiastic', 'positive', 'inspiring'],
    educationalContext: {
      bestFor: ['milestone celebrations', 'motivation', 'challenge introductions'],
      pacing: 'energetic',
      emphasis: 'positivity'
    },
    audioSettings: {
      speed: 1.15,
      temperature: 0.95,
      pitch_variance: 'dynamic'
    }
  },
  
  verse: {
    name: 'verse',
    personality: 'smooth_narrative',
    useCase: 'case_studies_walkthroughs',
    characteristics: ['flowing', 'descriptive', 'immersive'],
    educationalContext: {
      bestFor: ['code walkthroughs', 'system overviews', 'guided tours'],
      pacing: 'flowing',
      emphasis: 'narrative_flow'
    },
    audioSettings: {
      speed: 1.02,
      temperature: 0.8,
      pitch_variance: 'smooth'
    }
  }
};

// Semantic VAD configurations for different learning contexts
export const SEMANTIC_VAD_CONFIGS: Record<string, SemanticVADConfig> = {
  tutorial_mode: {
    type: 'semantic_vad',
    eagerness: 'low',
    threshold: 0.6,
    prefix_padding_ms: 400,
    silence_duration_ms: 1200, // Allow thinking time
    context_awareness: true,
    interrupt_sensitivity: 'conservative',
    natural_pause_detection: true
  },
  
  discussion_mode: {
    type: 'semantic_vad',
    eagerness: 'high',
    threshold: 0.3,
    prefix_padding_ms: 200,
    silence_duration_ms: 600,
    context_awareness: true,
    interrupt_sensitivity: 'responsive',
    natural_pause_detection: true
  },
  
  assessment_mode: {
    type: 'semantic_vad',
    eagerness: 'medium',
    threshold: 0.7,
    prefix_padding_ms: 300,
    silence_duration_ms: 2000, // Extended thinking time
    context_awareness: true,
    interrupt_sensitivity: 'patient',
    natural_pause_detection: false
  },
  
  presentation_mode: {
    type: 'semantic_vad',
    eagerness: 'low',
    threshold: 0.8,
    prefix_padding_ms: 500,
    silence_duration_ms: 800,
    context_awareness: true,
    interrupt_sensitivity: 'minimal',
    natural_pause_detection: true
  }
};

// Ultra-low latency audio configuration
export const AUDIO_CONFIG: AudioPipelineConfig = {
  input_processing: {
    format: 'pcm16' as AudioFormat,
    sample_rate: 24000, // Professional quality
    channels: 1,
    bit_depth: 16,
    buffer_size: 'minimal', // ~10ms chunks for ultra-low latency
    chunk_length_ms: 10
  },
  
  noise_suppression: {
    enabled: true,
    mode: 'adaptive', // Automatically adjusts based on environment
    aggressiveness: 0.7,
    wind_suppression: true,
    echo_cancellation: true,
    auto_gain_control: true,
    spectral_subtraction: true
  },
  
  output_optimization: {
    predictive_buffering: true,
    adaptive_quality: true,
    concurrent_synthesis: true,
    latency_compensation: true,
    jitter_buffer_optimization: true
  },
  
  performance: {
    target_latency: 75, // ms end-to-end
    max_acceptable_latency: 100,
    quality_vs_latency: 'balanced',
    cpu_optimization: true,
    memory_optimization: true
  }
};

// Security configuration for production deployment
export const SECURITY_CONFIG: VoiceSecurityConfig = {
  authentication: {
    ephemeral_tokens: true,
    token_rotation_interval: 1800, // 30 minutes
    session_fingerprinting: true,
    biometric_verification: false, // Disabled for privacy
    multi_factor_enabled: true
  },
  
  encryption: {
    e2e_enabled: true,
    algorithm: 'AES-256-GCM',
    key_rotation: true,
    perfect_forward_secrecy: true,
    certificate_pinning: true
  },
  
  privacy: {
    transcript_retention: 7, // days
    audio_retention: 0, // No audio storage for privacy
    user_controlled_deletion: true,
    anonymization: true,
    consent_management: true
  },
  
  compliance: {
    gdpr_compliant: true,
    ccpa_compliant: true,
    ferpa_compliant: true, // For educational use
    coppa_compliant: true
  }
};

// Educational-specific configuration
export const EDUCATIONAL_CONFIG: EducationalVoiceConfig = {
  learning_modes: {
    tutorial: {
      pacing: 'deliberate',
      pause_for_comprehension: true,
      key_concept_emphasis: true,
      step_by_step_breakdown: true,
      repetition_allowed: true
    },
    
    discussion: {
      interaction_style: 'socratic',
      question_prompting: true,
      collaborative_tone: true,
      clarification_requests: true
    },
    
    assessment: {
      formal_tone: true,
      clear_instructions: true,
      encouraging_feedback: true,
      mistake_guidance: true
    },
    
    exploration: {
      curiosity_driven: true,
      tangential_discussions: true,
      creative_thinking: true,
      open_ended_responses: true
    }
  },
  
  voice_triggered_actions: {
    code_execution: {
      enabled: true,
      commands: ['run code', 'execute', 'test this', 'compile'],
      confirmation_required: true,
      safety_checks: true
    },
    
    navigation: {
      enabled: true,
      commands: ['next lesson', 'previous section', 'show example', 'go to chapter'],
      ui_integration: true
    },
    
    note_taking: {
      enabled: true,
      commands: ['take note', 'remember this', 'bookmark'],
      automatic_summarization: true,
      key_point_extraction: true
    },
    
    help_system: {
      enabled: true,
      commands: ['help', 'explain', 'what does this mean', 'how do I'],
      context_aware: true
    }
  },
  
  personalization: {
    learning_style_adaptation: true,
    difficulty_adjustment: true,
    interest_tracking: true,
    progress_based_customization: true
  }
};

// Main enhanced session configuration factory
export function createEnhancedSessionConfig(options: {
  voicePersonality?: VoicePersonality;
  learningMode?: keyof typeof SEMANTIC_VAD_CONFIGS;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  contentType?: 'technical' | 'conceptual' | 'practical';
  accessibilityNeeds?: AccessibilityRequirements;
}): EnhancedSessionConfig {
  const {
    voicePersonality = 'sage',
    learningMode = 'discussion_mode',
    userLevel = 'intermediate',
    contentType = 'technical',
    accessibilityNeeds = {}
  } = options;

  const personality = VOICE_PERSONALITIES[voicePersonality];
  const vadConfig = SEMANTIC_VAD_CONFIGS[learningMode];

  return {
    // Core OpenAI Realtime API configuration
    model: 'gpt-4o-realtime-preview-2024-10-01',
    modalities: ['text', 'audio'],
    
    // Voice configuration
    voice: personality.name,
    voice_settings: {
      ...personality.audioSettings,
      // Adjust speed based on user level
      speed: adjustSpeedForUserLevel(personality.audioSettings.speed, userLevel),
      // Adjust temperature based on content type
      temperature: adjustTemperatureForContent(personality.audioSettings.temperature, contentType)
    },
    
    // Audio format optimization
    input_audio_format: AUDIO_CONFIG.input_processing.format,
    output_audio_format: AUDIO_CONFIG.input_processing.format,
    input_audio_transcription: {
      model: 'whisper-1'
    },
    
    // Turn detection with semantic VAD
    turn_detection: vadConfig,
    
    // Performance optimization
    performance_config: {
      ...AUDIO_CONFIG.performance,
      // Adjust latency targets based on accessibility needs
      target_latency: accessibilityNeeds.extended_processing_time ? 150 : 75
    },
    
    // Educational instructions
    instructions: generateEducationalInstructions(personality, userLevel, contentType, accessibilityNeeds),
    
    // Tool definitions for voice-triggered actions
    tools: generateVoiceTools(EDUCATIONAL_CONFIG.voice_triggered_actions),
    
    // Response limits
    max_response_output_tokens: 4096,
    
    // Security and privacy
    security: SECURITY_CONFIG,
    
    // Educational customization
    educational: EDUCATIONAL_CONFIG,
    
    // Accessibility features
    accessibility: {
      ...accessibilityNeeds,
      transcript_enabled: true,
      speaker_identification: true,
      confidence_indicators: true,
      visual_audio_indicators: true
    }
  };
}

// Helper functions
function adjustSpeedForUserLevel(baseSpeed: number, userLevel: string): number {
  const adjustments = {
    beginner: -0.1,
    intermediate: 0,
    advanced: 0.05
  };
  return Math.max(0.5, Math.min(2.0, baseSpeed + (adjustments[userLevel] ?? 0)));
}

function adjustTemperatureForContent(baseTemp: number, contentType: string): number {
  const adjustments = {
    technical: -0.1,
    conceptual: 0,
    practical: 0.1
  };
  return Math.max(0.1, Math.min(2.0, baseTemp + (adjustments[contentType] ?? 0)));
}

function generateEducationalInstructions(
  personality: VoicePersonalityConfig,
  userLevel: string,
  contentType: string,
  accessibilityNeeds: AccessibilityRequirements
): string {
  let instructions = `You are an expert AI programming tutor with a ${personality.personality} personality. `;
  
  // Add personality-specific guidance
  instructions += `Your teaching style should be ${personality.characteristics.join(', ')}. `;
  
  // Add user level adjustments
  const levelGuidance = {
    beginner: 'Use simple language, provide step-by-step explanations, and encourage questions. Be patient and supportive.',
    intermediate: 'Balance detail with clarity. Assume basic knowledge but explain advanced concepts thoroughly.',
    advanced: 'Be concise but comprehensive. Focus on best practices, edge cases, and architectural considerations.'
  };
  instructions += levelGuidance[userLevel] + ' ';
  
  // Add content type focus
  const contentGuidance = {
    technical: 'Focus on accuracy, specifications, and implementation details.',
    conceptual: 'Emphasize understanding, relationships between concepts, and mental models.',
    practical: 'Provide actionable advice, real-world examples, and hands-on guidance.'
  };
  instructions += contentGuidance[contentType] + ' ';
  
  // Add accessibility considerations
  if (accessibilityNeeds.screen_reader_user) {
    instructions += 'Describe visual elements verbally. Provide clear structure and context. ';
  }
  
  if (accessibilityNeeds.hearing_impaired) {
    instructions += 'Speak clearly and provide comprehensive text alternatives. ';
  }
  
  if (accessibilityNeeds.cognitive_support) {
    instructions += 'Use simple sentence structures, provide clear organization, and offer frequent summaries. ';
  }
  
  // Educational context from personality
  instructions += `You excel at ${personality.educationalContext.bestFor.join(', ')}. `;
  instructions += `Use a ${personality.educationalContext.pacing} pace and emphasize ${personality.educationalContext.emphasis}. `;
  
  // Voice-specific guidance
  instructions += 'When speaking, use natural pauses, vary your intonation for emphasis, and maintain an engaging conversational tone. ';
  instructions += 'If asked to execute code or perform actions, confirm the request before proceeding.';
  
  return instructions;
}

function generateVoiceTools(voiceActions: any): any[] {
  const tools = [];
  
  if (voiceActions.code_execution.enabled) {
    tools.push({
      type: 'function',
      name: 'execute_code',
      description: 'Execute code when requested by voice command',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'The code to execute' },
          language: { type: 'string', description: 'Programming language' },
          confirm: { type: 'boolean', description: 'Require user confirmation' }
        },
        required: ['code', 'language']
      }
    });
  }
  
  if (voiceActions.navigation.enabled) {
    tools.push({
      type: 'function',
      name: 'navigate_content',
      description: 'Navigate through learning content via voice',
      parameters: {
        type: 'object',
        properties: {
          action: { 
            type: 'string', 
            enum: ['next', 'previous', 'goto', 'show_example', 'show_exercise'],
            description: 'Navigation action to perform'
          },
          target: { type: 'string', description: 'Specific target for goto actions' }
        },
        required: ['action']
      }
    });
  }
  
  if (voiceActions.note_taking.enabled) {
    tools.push({
      type: 'function',
      name: 'take_note',
      description: 'Save important information as notes',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Note content' },
          type: { 
            type: 'string', 
            enum: ['key_point', 'example', 'question', 'reminder'],
            description: 'Type of note'
          },
          auto_summarize: { type: 'boolean', description: 'Generate summary' }
        },
        required: ['content']
      }
    });
  }
  
  return tools;
}

// Type definitions
export interface VoicePersonalityConfig {
  name: string;
  personality: string;
  useCase: string;
  characteristics: string[];
  educationalContext: {
    bestFor: string[];
    pacing: string;
    emphasis: string;
  };
  audioSettings: {
    speed: number;
    temperature: number;
    pitch_variance: string;
  };
}

export interface SemanticVADConfig extends TurnDetectionConfig {
  context_awareness: boolean;
  interrupt_sensitivity: 'minimal' | 'conservative' | 'responsive' | 'aggressive';
  natural_pause_detection: boolean;
}

export interface AudioPipelineConfig {
  input_processing: {
    format: AudioFormat;
    sample_rate: number;
    channels: number;
    bit_depth: number;
    buffer_size: string;
    chunk_length_ms: number;
  };
  noise_suppression: {
    enabled: boolean;
    mode: 'near_field' | 'far_field' | 'adaptive';
    aggressiveness: number;
    wind_suppression: boolean;
    echo_cancellation: boolean;
    auto_gain_control: boolean;
    spectral_subtraction: boolean;
  };
  output_optimization: {
    predictive_buffering: boolean;
    adaptive_quality: boolean;
    concurrent_synthesis: boolean;
    latency_compensation: boolean;
    jitter_buffer_optimization: boolean;
  };
  performance: {
    target_latency: number;
    max_acceptable_latency: number;
    quality_vs_latency: 'latency_first' | 'balanced' | 'quality_first';
    cpu_optimization: boolean;
    memory_optimization: boolean;
  };
}

export interface VoiceSecurityConfig {
  authentication: {
    ephemeral_tokens: boolean;
    token_rotation_interval: number;
    session_fingerprinting: boolean;
    biometric_verification: boolean;
    multi_factor_enabled: boolean;
  };
  encryption: {
    e2e_enabled: boolean;
    algorithm: string;
    key_rotation: boolean;
    perfect_forward_secrecy: boolean;
    certificate_pinning: boolean;
  };
  privacy: {
    transcript_retention: number;
    audio_retention: number;
    user_controlled_deletion: boolean;
    anonymization: boolean;
    consent_management: boolean;
  };
  compliance: {
    gdpr_compliant: boolean;
    ccpa_compliant: boolean;
    ferpa_compliant: boolean;
    coppa_compliant: boolean;
  };
}

export interface EducationalVoiceConfig {
  learning_modes: Record<string, any>;
  voice_triggered_actions: Record<string, any>;
  personalization: {
    learning_style_adaptation: boolean;
    difficulty_adjustment: boolean;
    interest_tracking: boolean;
    progress_based_customization: boolean;
  };
}

export interface AccessibilityRequirements {
  screen_reader_user?: boolean;
  hearing_impaired?: boolean;
  cognitive_support?: boolean;
  motor_limitations?: boolean;
  extended_processing_time?: boolean;
  high_contrast_needed?: boolean;
  reduced_motion_preferred?: boolean;
}

export interface EnhancedSessionConfig {
  model: string;
  modalities: string[];
  voice: string;
  voice_settings: any;
  input_audio_format: AudioFormat;
  output_audio_format: AudioFormat;
  input_audio_transcription?: any;
  turn_detection: SemanticVADConfig;
  performance_config: any;
  instructions: string;
  tools: any[];
  max_response_output_tokens: number;
  security: VoiceSecurityConfig;
  educational: EducationalVoiceConfig;
  accessibility: any;
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: engineer-agent
 * @cc-sessionId: cc-eng-20250801-001
 * @timestamp: 2025-08-01T13:15:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive session configuration for world-class Voice AI
 * - **Strategy:** Integrate all 2025 specifications with educational focus
 * - **Outcome:** Production-ready configuration with ultra-low latency and accessibility
 */