---
name: "data-pipeline"
description: "Data processing pipelines for comparison, transformation, deduplication, and scheduled execution"
---

# Data Pipeline Skill

## Overview
Reusable patterns for data processing pipelines including change detection, deduplication, transformation, and scheduled execution.

## Procedures

### 1. Change Detection (Diff)
**Use when:** Finding new/changed records between runs

**Pattern:**
```javascript
const detectChanges = (current, previous, keyFn) => {
  const previousKeys = new Set(previous.map(keyFn));
  const newItems = current.filter(item => !previousKeys.has(keyFn(item)));
  
  const currentKeys = new Set(current.map(keyFn));
  const removedItems = previous.filter(item => !currentKeys.has(keyFn(item)));
  
  return { new: newItems, removed: removedItems, unchanged: current.length - newItems.length };
};
```

**Key Functions:**
- License data: `(b) => `${b.license_number}-${b.business_name}`
- Contact data: `(c) => c.email || c.phone`
- Generic: `(item) => JSON.stringify(item)`

### 2. Deduplication
**Use when:** Removing duplicate entries from combined data sources

**Pattern:**
```javascript
const dedupe = (items, keyFn) => {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
```

### 3. Data Transformation
**Use when:** Converting between formats

**CSV to JSON:**
```javascript
const csvToJson = (csv) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
};
```

**JSON to CSV:**
```javascript
const jsonToCsv = (json) => {
  if (json.length === 0) return '';
  const headers = Object.keys(json[0]);
  const rows = json.map(obj => 
    headers.map(h => {
      const val = obj[h] || '';
      if (String(val).includes(',') || String(val).includes('"')) {
        return `"${String(val).replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};
```

### 4. State Management
**Use when:** Persisting data between runs

**Pattern:**
```javascript
const loadState = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { data: [], timestamp: null };
  }
};

const saveState = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify({
    data,
    timestamp: new Date().toISOString(),
    count: data.length
  }, null, 2));
};
```

### 5. Scheduled Execution
**Use when:** Running pipelines on a schedule

**Cron Pattern:**
```bash
# Daily at 9 AM
0 9 * * * cd /path && ./run-pipeline.sh

# Weekly on Monday
0 9 * * 1 cd /path && ./run-pipeline.sh
```

**OpenClaw Cron:**
```json
{
  "schedule": { "kind": "cron", "expr": "0 9 * * *", "tz": "America/Los_Angeles" },
  "payload": { "kind": "agentTurn", "message": "Run daily pipeline" }
}
```

### 6. Notification Formatting
**Use when:** Creating human-readable summaries

**Pattern:**
```javascript
const formatNotification = (newItems, allCount) => {
  if (newItems.length === 0) {
    return `No new items. Total: ${allCount}`;
  }
  
  // Group by category
  const byCategory = groupBy(newItems, 'category');
  
  let msg = `${newItems.length} new items:\n\n`;
  for (const [cat, items] of Object.entries(byCategory)) {
    msg += `${cat}: ${items.length}\n`;
    for (const item of items.slice(0, 5)) {
      msg += `  • ${item.name}\n`;
    }
  }
  
  return msg;
};
```

## Pipeline Architecture

### Standard Pipeline Flow
1. **Extract** - Fetch data from source(s)
2. **Transform** - Clean, normalize, enrich
3. **Compare** - Detect changes vs previous run
4. **Load** - Save to database/CRM
5. **Notify** - Alert on changes

### Error Handling
- Log all errors but don't stop pipeline
- Send alert on critical failures
- Maintain partial state on error

### Data Quality Checks
- Validate required fields
- Check for obviously bad data (future dates, invalid ZIPs)
- Flag duplicates for review

## Example Usage
```javascript
const pipeline = require('./data-pipeline');

// Daily LCB pipeline
const runPipeline = async () => {
  // Extract
  const current = await scrapeLCB();
  
  // Load previous
  const previous = pipeline.loadState('./previous.json');
  
  // Compare
  const { new: newBusinesses } = pipeline.detectChanges(
    current, 
    previous.data,
    (b) => `${b.license}-${b.name}`
  );
  
  // Notify
  if (newBusinesses.length > 0) {
    await notify(pipeline.formatNotification(newBusinesses, current.length));
  }
  
  // Save state
  pipeline.saveState('./previous.json', current);
};
```
