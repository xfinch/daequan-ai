const fs = require('fs');
const path = require('path');

// Parse kanban markdown file into structured data
function parseKanbanMarkdown(content) {
  const lines = content.split('\n');
  const result = {
    title: '',
    internal: { backlog: [], active: [], completed: [] },
    client: { pipeline: [], active: [], completed: [] }
  };
  
  let currentSection = null;
  let currentSubsection = null;
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
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
    
    // Subsection headers (columns)
    if (line.includes('### 📥 BACKLOG') || line.includes('### 📥 PIPELINE')) {
      currentSubsection = currentSection === 'internal' ? 'backlog' : 'pipeline';
      inTable = false;
      continue;
    }
    if (line.includes('### 🚀 ACTIVE')) {
      currentSubsection = 'active';
      inTable = false;
      continue;
    }
    if (line.includes('### ✅ COMPLETED') || line.includes('### ✅ DELIVERED')) {
      currentSubsection = currentSection === 'internal' ? 'completed' : 'completed';
      inTable = false;
      continue;
    }
    
    // Table rows
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 3 && !cells[0].includes('Project') && !cells[0].includes('Client')) {
        if (currentSection && currentSubsection) {
          const item = parseTableRow(cells, currentSection);
          if (item) {
            result[currentSection][currentSubsection].push(item);
          }
        }
      }
    }
  }
  
  return result;
}

function parseTableRow(cells, section) {
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

function getKanbanData(type) {
  const fileMap = {
    'ttl': 'kanban-ttl.md',
    'comcast': 'kanban-comcast.md',
    'personal': 'kanban-personal.md'
  };
  
  const filename = fileMap[type] || 'kanban-ttl.md';
  const filepath = path.join(process.cwd(), filename);
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return parseKanbanMarkdown(content);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return null;
  }
}

module.exports = { getKanbanData, parseKanbanMarkdown };
