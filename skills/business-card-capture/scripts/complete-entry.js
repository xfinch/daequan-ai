#!/usr/bin/env node
/**
 * Complete a partial business card entry
 * Usage: complete-entry.js --id card_123456 --field phone --value "(253) 555-1234"
 */

const fs = require('fs');
const path = require('path');

const PARTIAL_DIR = path.join(__dirname, '..', 'data', 'partial');

function main() {
  const args = parseArgs();
  
  if (!args.id || !args.field || args.value === undefined) {
    console.error('Usage: complete-entry.js --id <card_id> --field <field> --value <value>');
    console.error('Fields: name, phone, email, address.street, address.city, address.state, address.zip');
    process.exit(1);
  }

  const partialPath = path.join(PARTIAL_DIR, `${args.id}.json`);
  
  if (!fs.existsSync(partialPath)) {
    console.error(`Error: Partial entry not found: ${args.id}`);
    process.exit(1);
  }

  const partial = JSON.parse(fs.readFileSync(partialPath, 'utf8'));
  
  // Update the field
  setField(partial.data, args.field, args.value);
  
  // Remove from missing list
  partial.missing = partial.missing.filter(m => m !== args.field);
  
  // Save updated partial
  fs.writeFileSync(partialPath, JSON.stringify(partial, null, 2));
  
  console.log(`✅ Updated ${args.field} = "${args.value}"`);
  
  if (partial.missing.length === 0) {
    console.log('🎉 All fields complete! Run process-card.js to finalize.');
    
    // Could auto-trigger finalization here
    // const { finalizeEntry } = require('./finalize-entry');
    // finalizeEntry(partial);
  } else {
    console.log(`⏳ Still missing: ${partial.missing.join(', ')}`);
  }
}

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = process.argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function setField(obj, fieldPath, value) {
  const parts = fieldPath.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
}

main();
