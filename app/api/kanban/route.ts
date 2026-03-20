import { NextRequest, NextResponse } from 'next/server';
import { getKanbanData, KanbanData } from '@/lib/kanban-parser';

// Fallback data for when markdown files aren't accessible
const fallbackData: Record<string, KanbanData> = {
  ttl: {
    title: '📊 TTL Kanban',
    internal: {
      backlog: [
        { title: 'Client Management Automation', priority: 'HIGH', description: 'Automated follow-ups, status tracking via GHL' },
        { title: 'Lead Generation System', priority: 'HIGH', description: 'Cold email campaigns, LinkedIn outreach' },
        { title: 'Proposal/Contract Automation', priority: 'MEDIUM', description: 'Template-based SOWs, DocuSign integration' },
      ],
      active: [
        { title: 'Email Monitoring (Himalaya)', priority: 'HIGH', description: 'Priority-based alerts: P0→GHL notification, P1→10min task' },
        { title: 'GHL/TTL Integration', priority: 'HIGH', description: 'API access confirmed, new tokens in Keychain' },
        { title: 'Voice Coaching', priority: 'HIGH', description: 'Telnyx API v2 key issue — waiting on fix' },
      ],
      completed: [
        { title: 'GHL API Integration', priority: 'HIGH', description: 'Full TTL sub-account access operational (2026-02-16)' },
      ]
    },
    client: {
      pipeline: [
        { client: 'AK Branding', project: 'CRM Setup', status: '🔥 Hot Lead', lastContact: '2026-03-10', nextAction: 'Schedule meeting by 2026-03-19' },
      ],
      active: [
        { client: 'Trina Fallardo', project: 'Cold Email Campaign', status: '🟡 WARMING UP', lastContact: '2026-02-16', nextAction: 'Launch ~1 week' },
        { client: 'Kristy Tivnan', project: 'Real Estate Lead Filtering', status: '🟢 DEMO SENT', lastContact: '2026-03-10', nextAction: 'Await feedback' },
      ],
      completed: []
    }
  },
  comcast: {
    title: '📡 Comcast CRM',
    internal: {
      backlog: [
        { title: 'Partner Affiliate Portal', priority: 'MEDIUM', description: 'Sign-up and tracking for paid partners' },
        { title: 'Territory Analytics', priority: 'LOW', description: 'Visit density, conversion rates by ZIP' },
      ],
      active: [
        { title: 'Comcast Map v2', priority: 'HIGH', description: 'Mobile-responsive, visit editing in-place' },
        { title: 'Newsletter System', priority: 'MEDIUM', description: 'Connected Partners email template' },
      ],
      completed: [
        { title: 'MongoDB Visit Sync', priority: 'HIGH', description: 'GHL → MongoDB pipeline operational' },
        { title: 'Interactive Territory Map', priority: 'HIGH', description: 'Live at daequanai.com/comcast' },
      ]
    },
    client: {
      pipeline: [
        { client: 'Vance Richardson', project: 'Partner Referral', status: '🤝 MEETING SCHEDULED', lastContact: '2026-03-20', nextAction: 'Mon 2nd, 2 PM at Point Ruston' },
        { client: 'Tara Groody', project: 'Partner Referral', status: '🤝 MEETING SCHEDULED', lastContact: '2026-03-20', nextAction: 'Tue 11:30 AM at 512 Pacific Hwy' },
      ],
      active: [
        { client: "Knapp's Restaurant", project: 'Triple Play (Fiber + Voice + TV)', status: '🟢 SALES ENGINEER ENGAGED', lastContact: '2026-02-26', nextAction: 'March 4th appointment' },
        { client: 'MQF - Museum Quality Framing', project: 'IT Services Assessment', status: '🟡 NETWORKING CONTACT', lastContact: '2026-02-26', nextAction: 'Follow up on managed IT arrangement' },
        { client: 'Proctor Mercantile', project: 'Multi-property Deal', status: '🟡 GATEKEEPER IDENTIFIED', lastContact: '2026-02-26', nextAction: 'Email Anya Evans (owner)' },
      ],
      completed: []
    }
  },
  personal: {
    title: '👤 Personal',
    internal: {
      backlog: [
        { title: 'Health & Fitness Routine', priority: 'MEDIUM', description: 'Consistent schedule, meal prep' },
      ],
      active: [
        { title: 'Comcast Ramp-up', priority: 'HIGH', description: 'Building territory, partner network' },
        { title: 'TTL Infrastructure', priority: 'HIGH', description: 'Systems before scaling' },
      ],
      completed: []
    },
    client: {
      pipeline: [],
      active: [],
      completed: []
    }
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'ttl';
  
  // Try to get data from markdown files first
  const data = getKanbanData(type);
  
  if (data) {
    return NextResponse.json(data);
  }
  
  // Fall back to embedded data
  if (fallbackData[type]) {
    console.log(`Using fallback data for kanban type: ${type}`);
    return NextResponse.json(fallbackData[type]);
  }
  
  return NextResponse.json({ error: 'Board not found' }, { status: 404 });
}
