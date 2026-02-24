import fs from 'fs';
import path from 'path';

export interface KanbanData {
  title: string;
  internal: {
    backlog: Array<{ title: string; priority: string; description: string }>;
    active: Array<{ title: string; priority: string; description: string }>;
    completed: Array<{ title: string; priority: string; description: string }>;
  };
  client: {
    pipeline: Array<{ client: string; project: string; status: string; lastContact: string; nextAction: string }>;
    active: Array<{ client: string; project: string; status: string; lastContact: string; nextAction: string }>;
    completed: Array<{ client: string; project: string; status: string; lastContact: string; nextAction: string }>;
  };
}

export function parseKanbanMarkdown(content: string): KanbanData {
  const lines = content.split('\n');
  const result: KanbanData = {
    title: '',
    internal: { backlog: [], active: [], completed: [] },
    client: { pipeline: [], active: [], completed: [] }
  };
  
  let currentSection: 'internal' | 'client' | null = null;
  let currentSubsection: 'backlog' | 'active' | 'completed' | 'pipeline' | null = null;
  
  for (const line of lines) {
    // Title
    if (line.startsWith('# ')) {
      result.title = line.replace('# ', '').trim();
      continue;
    }
    
    // Section headers
    if (line.includes('🏢 INTERNAL PROJECTS')) {
      currentSection = 'internal';
      continue;
    }
    if (line.includes('👥 CLIENT PROJECTS')) {
      currentSection = 'client';
      continue;
    }
    
    // Subsection headers
    if (line.includes('### 📥 BACKLOG') || line.includes('### 📥 PIPELINE')) {
      currentSubsection = currentSection === 'internal' ? 'backlog' : 'pipeline';
      continue;
    }
    if (line.includes('### 🚀 ACTIVE')) {
      currentSubsection = 'active';
      continue;
    }
    if (line.includes('### ✅ COMPLETED') || line.includes('### ✅ DELIVERED')) {
      currentSubsection = 'completed';
      continue;
    }
    
    // Table rows
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 3 && !cells[0].includes('Project') && !cells[0].includes('Client')) {
        if (currentSection && currentSubsection) {
          const item = parseTableRow(cells, currentSection);
          if (item) {
            (result as any)[currentSection][currentSubsection].push(item);
          }
        }
      }
    }
  }
  
  return result;
}

function parseTableRow(cells: string[], section: 'internal' | 'client') {
  if (section === 'internal') {
    // Internal: Project | Priority | Description
    return {
      title: cells[0],
      priority: cells[1],
      description: cells[2]
    };
  } else {
    // Client: Client | Project | Status | Last Contact | Next Action
    return {
      client: cells[0],
      project: cells[1],
      status: cells[2],
      lastContact: cells[3],
      nextAction: cells[4]
    };
  }
}

export function getKanbanData(type: string): KanbanData | null {
  const fileMap: Record<string, string> = {
    'ttl': 'kanban-ttl.md',
    'comcast': 'kanban-comcast.md',
    'personal': 'kanban-personal.md'
  };
  
  const filename = fileMap[type];
  if (!filename) return null;
  
  // Try multiple paths (for local dev and production)
  const paths = [
    path.join(process.cwd(), filename),           // Same directory
    path.join(process.cwd(), '..', filename),     // Parent directory
    path.join(process.cwd(), '..', '..', filename), // Grandparent (monorepo)
  ];
  
  for (const filepath of paths) {
    try {
      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf-8');
        return parseKanbanMarkdown(content);
      }
    } catch (err) {
      // Try next path
    }
  }
  
  console.error(`Could not find ${filename} in any of:`, paths);
  return null;
}
