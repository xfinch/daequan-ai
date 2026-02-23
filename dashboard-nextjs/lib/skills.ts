// Skill metadata - static configuration
export const skillMetadata: Record<string, {
  icon: string;
  description: string;
  type: 'Custom' | 'System';
  triggers: string[];
  outputs: string[];
}> = {
  'voice-notes-router': {
    icon: '🎙️',
    description: 'Route voice memos to PERSONAL, TTL, or COMCAST buckets with AI classification',
    type: 'Custom',
    triggers: ['Plaud webhook', 'Manual process'],
    outputs: ['GHL', 'MongoDB', 'iMessage']
  },
  'business-card-capture': {
    icon: '📇',
    description: 'Extract contact info from card images with OCR and validate required fields',
    type: 'Custom',
    triggers: ['WhatsApp image', 'Manual upload'],
    outputs: ['GHL contacts', 'MongoDB visits']
  },
  'doc-chat': {
    icon: '📄',
    description: 'Upload documents and chat with them for answers, summaries, and audio',
    type: 'System',
    triggers: ['.upload command', '.podcast command'],
    outputs: ['Chat responses', 'Audio files']
  },
  'model-router': {
    icon: '🎯',
    description: 'Route tasks to optimal LLM models based on task type and cost',
    type: 'System',
    triggers: ['Heartbeat tasks', 'spawn requests'],
    outputs: ['Sub-agent execution']
  },
  'github': {
    icon: '🐙',
    description: 'GitHub operations via gh CLI: issues, PRs, CI, code review',
    type: 'System',
    triggers: ['PR checks', 'Issue management'],
    outputs: ['Git operations']
  },
  'gh-issues': {
    icon: '🔧',
    description: 'Auto-implement GitHub issues, open PRs, monitor reviews',
    type: 'System',
    triggers: ['/gh-issues command'],
    outputs: ['Pull requests', 'Code changes']
  },
  'gog': {
    icon: '🔑',
    description: 'Google Workspace: Gmail, Calendar, Drive, Sheets, Docs',
    type: 'System',
    triggers: ['Calendar queries', 'Email tasks'],
    outputs: ['Google API results']
  },
  'goplaces': {
    icon: '📍',
    description: 'Google Places API for business lookup and reviews',
    type: 'System',
    triggers: ['Business search', 'Place details'],
    outputs: ['Place information']
  },
  'nano-pdf': {
    icon: '📑',
    description: 'Edit PDFs with natural language instructions',
    type: 'System',
    triggers: ['PDF edit requests'],
    outputs: ['Modified PDFs']
  },
  'sag': {
    icon: '🔊',
    description: 'ElevenLabs text-to-speech with voice selection',
    type: 'System',
    triggers: ['TTS requests', '.podcast'],
    outputs: ['Audio files']
  },
  'wacli': {
    icon: '💬',
    description: 'WhatsApp messaging via CLI for external notifications',
    type: 'System',
    triggers: ['Automated messages'],
    outputs: ['WhatsApp sends']
  },
  'weather': {
    icon: '🌤️',
    description: 'Weather forecasts via wttr.in or Open-Meteo',
    type: 'System',
    triggers: ['Weather queries'],
    outputs: ['Forecast data']
  },
  'healthcheck': {
    icon: '🔒',
    description: 'Security hardening and risk assessment for OpenClaw',
    type: 'System',
    triggers: ['Security audits'],
    outputs: ['Security reports']
  },
  'himalaya': {
    icon: '📧',
    description: 'Email management via IMAP/SMTP',
    type: 'System',
    triggers: ['Email checks', 'Send mail'],
    outputs: ['Email operations']
  }
};

export function getSkillDisplayName(skillId: string): string {
  return skillId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
