/**
 * Website Knowledge Base - Legacy Configuration
 * 
 * IMPORTANT: This file is being phased out in favor of the new comprehensive
 * knowledge base system located in /src/data/voice-agent/
 * 
 * New system includes:
 * - /src/data/voice-agent/content/ - Complete service and founder information
 * - /src/data/voice-agent/conversation/ - Natural conversation flows
 * - /src/data/voice-agent/objections/ - Professional objection handling
 * - /src/data/voice-agent/discovery/ - Qualification and booking process
 * - /src/data/voice-agent/functions/ - OpenAI function definitions
 * - /src/data/voice-agent/updates/ - Dynamic content management
 * 
 * Use /src/data/voice-agent/index.json as the master reference.
 */

import type { WebsiteKnowledge } from '../types';

// Legacy knowledge structure - migrate to new system
// New comprehensive knowledge system available at /src/data/voice-agent/

export const websiteKnowledge: WebsiteKnowledge = {
  services: {
    executiveAITraining: {
      name: 'Executive AI Masterclass',
      description: 'Transform from overwhelmed observer to Master of Synthetic Intelligence™ with our private custom AI masterclass for executives.',
      duration: '3-day intensive or 6-week program options',
      pricing: 'Investment starts at $15,000 - Contact for enterprise pricing',
      outcomes: [
        'Confident AI strategy development and implementation',
        'Complete AI implementation roadmap for your business',
        'Team alignment and buy-in for AI initiatives',
        'ROI-focused AI deployment framework',
        'Competitive advantage through strategic AI adoption',
        'Risk mitigation and ethical AI governance'
      ],
      targetAudience: [
        'C-suite executives (CEO, CTO, COO, CMO)',
        'Senior leadership teams',
        'Business owners and entrepreneurs',
        'Department heads driving digital transformation'
      ],
      deliverables: [
        'Personalized AI strategy document',
        'Implementation timeline and milestones',
        'Team training and change management plan',
        'Vendor evaluation and technology recommendations',
        'Risk assessment and mitigation strategies',
        'ROI measurement framework'
      ]
    },
    
    strategySessions: {
      name: '15-Minute Discovery Call',
      description: 'Complimentary strategic consultation to assess your AI readiness and identify high-impact opportunities.',
      duration: '15 minutes',
      pricing: 'Complimentary',
      outcomes: [
        'Quick assessment of your AI readiness and maturity',
        '2-3 specific recommendations for your situation',
        'Clear next steps for AI implementation',
        'Understanding of potential ROI and timeline',
        'Qualification for executive training programs'
      ],
      targetAudience: [
        'Executives exploring AI opportunities',
        'Leaders facing AI implementation challenges',
        'Decision-makers evaluating AI investments',
        'Companies planning digital transformation'
      ],
      deliverables: [
        'AI readiness assessment',
        'Personalized recommendations',
        'Resource recommendations',
        'Next steps action plan'
      ]
    },

    aiAudit: {
      name: 'AI Opportunity Audit',
      description: 'Complimentary 2-minute assessment to identify your #1 AI opportunity and receive a personalized brief.',
      duration: '2 minutes to complete, instant results',
      pricing: 'Complimentary',
      outcomes: [
        'Identification of most profitable AI deployment area',
        'Personalized opportunity brief',
        'Quick wins and long-term strategy alignment',
        'Risk assessment for AI initiatives',
        'Resource and next step recommendations'
      ],
      targetAudience: [
        'Busy executives wanting quick insights',
        'Leaders exploring AI without commitment',
        'Companies in early AI exploration phase',
        'Decision-makers needing validation'
      ],
      deliverables: [
        'AI opportunity assessment report',
        'Personalized recommendations',
        'Implementation priority matrix',
        'Resource links and guides'
      ]
    }
  },

  founder: {
    name: 'Russell Deming',
    title: 'Executive AI Strategy Expert & Founder',
    expertise: [
      'Executive AI Strategy Development',
      'Digital Transformation Leadership',
      'AI Implementation and Governance',
      'Technology ROI Optimization',
      'Change Management for AI Adoption',
      'Enterprise Risk Management'
    ],
    background: 'Former Fortune 500 CTO with nearly a decade of experience guiding executives through AI transformation. Russell has personally helped dozens of companies successfully navigate AI implementation, from strategy development to full deployment.',
    achievements: [
      'Guided 100+ executives through successful AI transformations',
      'Former Fortune 500 Chief Technology Officer',
      'Expert in translating AI capabilities into business results',
      'Proven track record of ROI-positive AI implementations',
      'Recognized thought leader in executive AI education',
      'Developer of the AI Dominance Blueprint methodology'
    ]
  },

  caseStudies: [
    {
      title: 'Manufacturing Giant Achieves 2-Year Competitive Advantage',
      industry: 'Manufacturing',
      challenge: 'Company struggled with AI strategy confusion and scattered pilot projects with no clear ROI.',
      solution: 'Implemented Russell\'s AI Dominance Blueprint with focused executive training and strategic implementation roadmap.',
      results: [
        'Deployed comprehensive AI strategy in 6 weeks',
        'Achieved 2-year competitive advantage over industry peers',
        'Clear ROI measurement and tracking systems',
        'Executive team alignment on AI priorities',
        'Successful scaling from pilots to production systems'
      ],
      testimonial: 'In six weeks, we went from AI confusion to deploying a strategy that put us two years ahead of our competition. Russell doesn\'t just teach; he delivers a decisive edge.',
      clientTitle: 'CTO, Innovate Dynamics'
    },
    
    {
      title: 'Financial Services Firm Transforms Customer Experience',
      industry: 'Financial Services',
      challenge: 'Traditional firm facing disruption from AI-powered fintech competitors.',
      solution: 'Executive AI training focused on customer experience transformation and regulatory compliance.',
      results: [
        '40% improvement in customer satisfaction scores',
        'Successful AI-powered customer service deployment',
        'Regulatory compliance framework for AI systems',
        'Team confidence and adoption of AI tools',
        'New revenue streams from AI-enhanced services'
      ],
      testimonial: 'Russell helped us transform from AI skeptics to AI leaders. Our customers notice the difference, and our competitors are scrambling to catch up.',
      clientTitle: 'CEO, Regional Financial Group'
    },
    
    {
      title: 'Healthcare System Improves Patient Outcomes',
      industry: 'Healthcare',
      challenge: 'Large healthcare system needed to improve patient outcomes while managing costs and compliance.',
      solution: 'Comprehensive AI strategy focusing on patient care optimization and operational efficiency.',
      results: [
        '25% reduction in patient wait times',
        'Improved diagnostic accuracy through AI assistance',
        'HIPAA-compliant AI implementation framework',
        'Staff productivity gains of 30%',
        'Better patient satisfaction and outcomes'
      ],
      testimonial: 'The AI implementation Russell guided us through has transformed patient care while maintaining our commitment to privacy and ethics.',
      clientTitle: 'Chief Medical Officer, Regional Health System'
    }
  ],

  resources: [
    {
      type: 'Guide',
      title: 'Executive AI Readiness Assessment',
      description: 'Comprehensive self-assessment tool to evaluate your organization\'s AI readiness and identify key preparation areas.',
      downloadUrl: '/downloads/ai-readiness-assessment.pdf'
    },
    {
      type: 'Playbook',
      title: 'AI ROI Calculation Framework',
      description: 'Step-by-step methodology for calculating and tracking return on investment for AI initiatives.',
      downloadUrl: '/downloads/ai-roi-framework.pdf'
    },
    {
      type: 'Template',
      title: 'AI Strategy Presentation Template',
      description: 'Executive-ready presentation template for communicating AI strategy to stakeholders and board members.',
      downloadUrl: '/downloads/ai-strategy-template.pptx'
    },
    {
      type: 'Checklist',
      title: 'AI Implementation Checklist',
      description: 'Comprehensive checklist covering technical, legal, and organizational requirements for AI deployment.',
      downloadUrl: '/downloads/ai-implementation-checklist.pdf'
    },
    {
      type: 'Report',
      title: 'Industry AI Benchmarks',
      description: 'Current AI adoption rates, success metrics, and ROI benchmarks across different industries.',
      downloadUrl: '/downloads/industry-ai-benchmarks.pdf'
    }
  ],

  pricing: {
    discoveryCall: {
      duration: '15 minutes',
      price: 'Complimentary',
      description: 'Strategic consultation to assess AI readiness and identify opportunities'
    },
    masterclass: {
      duration: '3-day intensive or 6-week program',
      price: 'Starting at $15,000',
      description: 'Comprehensive executive AI training with personalized strategy development'
    }
  }
};

// Conversation prompts and responses
export const conversationPrompts = {
  greeting: `Hello! I'm Russell Deming's AI assistant. I help executives understand how AI can transform their business and drive real ROI. 

I have complete knowledge of our executive AI training programs, Russell's background, our success stories, and available resources. 

How can I help you explore AI opportunities for your business today?`,

  serviceInquiry: `I'd be happy to tell you about our executive AI programs. We offer several options depending on your needs and timeline:

🎯 **15-Minute Discovery Call** (Complimentary)
A strategic consultation to assess your AI readiness and identify high-impact opportunities.

🚀 **Executive AI Masterclass** (Starting at $15,000)
Transform from overwhelmed observer to Master of Synthetic Intelligence™ with our comprehensive training program.

📊 **AI Opportunity Audit** (Complimentary)
A quick 2-minute assessment to identify your #1 AI opportunity.

Which of these interests you most, or would you like me to recommend the best starting point based on your situation?`,

  schedulingFlow: `Perfect! I can help you schedule a 15-minute discovery call with Russell. This complimentary session will give you:

✅ A quick assessment of your AI readiness and maturity level
✅ 2-3 specific recommendations tailored to your situation  
✅ Clear next steps for AI implementation in your business
✅ Understanding of potential ROI and realistic timelines

The call is designed for busy executives - we'll pack maximum value into those 15 minutes.

Would you prefer a morning, afternoon, or evening slot? And what timezone are you in?`,

  qualificationQuestions: [
    "What's your role in the company? This helps me understand your decision-making authority and perspective.",
    "What industry are you in? This helps me share relevant examples and benchmarks.",
    "What's driving your interest in AI right now? Is it competitive pressure, efficiency needs, or growth opportunities?",
    "Have you started any AI initiatives yet? I'd love to understand your current AI maturity level.",
    "What's your biggest concern about AI implementation? Common concerns include ROI uncertainty, team readiness, or technical complexity."
  ],

  objectionHandling: {
    cost: `I understand cost is always a consideration for executive training. Here's how our clients typically think about the investment:

The average Fortune 500 company spends $12.8 million on failed AI pilots. Our $15,000 investment helps you avoid those costly mistakes while accelerating successful implementation.

Most clients see ROI within 90 days through improved decision-making, better vendor selection, and more effective team alignment. Would you like me to share some specific ROI examples from companies in your industry?`,

    time: `I know your time is incredibly valuable. That's why our program is designed specifically for busy executives:

- **3-day intensive option**: Get everything you need in concentrated sessions
- **6-week program**: Spread learning across manageable time blocks  
- **Just-in-time delivery**: Focused on immediate application, not academic theory

Most participants say it's the best ROI on their time because every hour directly translates to better AI decisions. Which format sounds more feasible for your schedule?`,

    readiness: `It's smart to question readiness - that shows good executive judgment. Here's what I've learned from working with 100+ executives:

You don't need to be technical to lead AI successfully. In fact, the most successful AI implementations are led by business-focused executives who understand strategy and ROI.

The biggest risk isn't lack of technical knowledge - it's waiting too long while competitors gain advantage. Would you like to take our quick AI readiness assessment to see exactly where you stand?`
  },

  caseStudyPrompts: {
    manufacturing: `Let me share a relevant example from our manufacturing clients:

One of our clients, a major manufacturing company, came to us completely overwhelmed by AI. They had scattered pilot projects with no clear strategy or ROI.

After our 6-week executive program, they deployed a comprehensive AI strategy that put them 2 years ahead of their competition. Their CTO told us: "Russell doesn't just teach; he delivers a decisive edge."

The key was focusing on business outcomes first, then building the technical implementation around those goals. Is this kind of strategic clarity what you're looking for?`,

    financial: `Here's a great example from financial services:

A regional financial firm was being disrupted by AI-powered fintech competitors. They needed to transform but were concerned about regulatory compliance and customer trust.

Through our executive training, they developed an AI strategy that improved customer satisfaction by 40% while maintaining full regulatory compliance. Their CEO said we helped them "transform from AI skeptics to AI leaders."

The framework we developed helped them see AI as a competitive advantage rather than a compliance risk. Does this resonate with challenges you're facing?`,

    healthcare: `I have a compelling healthcare example:

A large health system wanted to improve patient outcomes while managing costs. They were overwhelmed by AI vendor promises and unsure about HIPAA compliance.

Our AI strategy program helped them reduce patient wait times by 25% and improve diagnostic accuracy, all while maintaining strict compliance. Their Chief Medical Officer said our guidance "transformed patient care while maintaining commitment to privacy and ethics."

The key was building AI governance into the strategy from day one. Is patient outcome improvement something you're focused on?`
  }
};

// Function calling configurations
export const availableFunctions = {
  scheduleDiscoveryCall: {
    name: 'schedule_discovery_call',
    description: 'Opens Calendly scheduling widget for 15-minute discovery call with Russell Deming',
    parameters: {
      type: 'object',
      properties: {
        timePreference: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'flexible'],
          description: 'Preferred time of day for the call'
        },
        timezone: {
          type: 'string',
          description: 'User timezone for scheduling'
        },
        urgency: {
          type: 'string',
          enum: ['this_week', 'next_week', 'flexible'],
          description: 'How quickly they want to schedule'
        },
        contactInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            company: { type: 'string' },
            title: { type: 'string' }
          }
        }
      }
    }
  },

  getServiceDetails: {
    name: 'get_service_details',
    description: 'Provides detailed information about specific services and programs',
    parameters: {
      type: 'object',
      properties: {
        serviceType: {
          type: 'string',
          enum: ['executiveAITraining', 'strategySessions', 'aiAudit'],
          description: 'Type of service to get details about'
        }
      },
      required: ['serviceType']
    }
  },

  sendResourceEmail: {
    name: 'send_resource_email',
    description: 'Sends AI resources and guides to user email',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address'
        },
        resourceType: {
          type: 'string',
          enum: ['readiness-assessment', 'roi-framework', 'strategy-template', 'implementation-checklist', 'industry-benchmarks'],
          description: 'Type of resource to send'
        },
        reason: {
          type: 'string',
          description: 'Why the user requested this resource'
        }
      },
      required: ['email', 'resourceType']
    }
  },

  captureLeadInfo: {
    name: 'capture_lead_info',
    description: 'Captures visitor information for CRM and follow-up',
    parameters: {
      type: 'object',
      properties: {
        contactInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            company: { type: 'string' },
            title: { type: 'string' },
            phone: { type: 'string' }
          },
          required: ['name', 'email']
        },
        companyInfo: {
          type: 'object',
          properties: {
            industry: { type: 'string' },
            size: { type: 'string', enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
            aiMaturity: { type: 'string', enum: ['exploring', 'piloting', 'scaling', 'mature'] }
          }
        },
        needs: {
          type: 'object',
          properties: {
            primaryChallenge: { type: 'string' },
            timeframe: { type: 'string' },
            budget: { type: 'string' },
            decisionMakers: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['contactInfo']
    }
  },

  openAIAudit: {
    name: 'open_ai_audit',
    description: 'Opens the AI Opportunity Audit assessment',
    parameters: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          enum: ['voice_agent', 'direct_request'],
          description: 'How the user discovered the audit'
        }
      }
    }
  }
};