#!/usr/bin/env python3
"""
Migrate existing contacts to use structured contact fields.
Safe to re-run - only processes records where new fields are empty.
"""

import sqlite3
import json
import sys
from contact_parser import ContactParser

DB_PATH = "/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db"

def migrate_contacts(dry_run=True):
    """
    Parse existing contact_name fields and populate structured fields.
    Only updates records where structured fields are currently NULL.
    """
    parser = ContactParser()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Find records that need migration (have contact_name but no structured fields)
    cursor.execute("""
        SELECT id, business_name, contact_name, notes
        FROM business_visits
        WHERE contact_name IS NOT NULL 
          AND contact_name != ''
          AND decision_maker_first_name IS NULL
          AND gatekeeper_first_name IS NULL
        ORDER BY id
    """)
    
    to_migrate = cursor.fetchall()
    
    if not to_migrate:
        print("No contacts need migration. All records already have structured fields.")
        return
    
    print(f"Found {len(to_migrate)} contacts to migrate")
    print("=" * 80)
    
    migrated = 0
    skipped = 0
    errors = []
    
    for row in to_migrate:
        try:
            contact_id = row['id']
            business_name = row['business_name']
            contact_name = row['contact_name']
            existing_notes = row['notes'] or ""
            
            # Parse the contact name
            parsed = parser.parse(contact_name)
            
            # Build enhanced notes
            enhanced_notes = existing_notes
            if parsed.role_notes:
                if enhanced_notes:
                    enhanced_notes += f"\n\nContact roles: {parsed.role_notes}"
                else:
                    enhanced_notes = f"Contact roles: {parsed.role_notes}"
            
            # Prepare other_contacts JSON
            other_contacts_json = json.dumps([o.to_dict() for o in parsed.others]) if parsed.others else None
            
            if dry_run:
                # Preview mode - show what would change
                print(f"\nID {contact_id}: {business_name}")
                print(f"  Input: {contact_name}")
                print(f"  GK: {parsed.gatekeeper.first_name if parsed.gatekeeper else None} {parsed.gatekeeper.last_name if parsed.gatekeeper else ''}")
                print(f"  DM: {parsed.decision_maker.first_name if parsed.decision_maker else None} {parsed.decision_maker.last_name if parsed.decision_maker else ''}")
                print(f"  Others: {len(parsed.others)} additional contacts")
                if parsed.role_notes:
                    print(f"  Role notes added: {parsed.role_notes[:60]}...")
            else:
                # Actually update
                cursor.execute("""
                    UPDATE business_visits
                    SET gatekeeper_first_name = ?,
                        gatekeeper_last_name = ?,
                        decision_maker_first_name = ?,
                        decision_maker_last_name = ?,
                        other_contacts = ?,
                        notes = ?
                    WHERE id = ?
                """, (
                    parsed.gatekeeper.first_name if parsed.gatekeeper else None,
                    parsed.gatekeeper.last_name if parsed.gatekeeper else None,
                    parsed.decision_maker.first_name if parsed.decision_maker else None,
                    parsed.decision_maker.last_name if parsed.decision_maker else None,
                    other_contacts_json,
                    enhanced_notes,
                    contact_id
                ))
                migrated += 1
                
                if migrated % 10 == 0:
                    print(f"  Migrated {migrated} contacts...")
                    
        except Exception as e:
            errors.append((row['id'], row['business_name'], str(e)))
            skipped += 1
    
    if not dry_run:
        conn.commit()
        print(f"\n{'=' * 80}")
        print(f"Migration complete:")
        print(f"  Migrated: {migrated}")
        print(f"  Skipped (errors): {skipped}")
        
        if errors:
            print(f"\nErrors:")
            for contact_id, business_name, error in errors[:10]:
                print(f"  ID {contact_id} ({business_name}): {error}")
            if len(errors) > 10:
                print(f"  ... and {len(errors) - 10} more")
    else:
        print(f"\n{'=' * 80}")
        print(f"DRY RUN - No changes made")
        print(f"Would migrate {len(to_migrate)} contacts")
        print(f"Run with --apply to execute migration")

if __name__ == "__main__":
    dry_run = "--apply" not in sys.argv
    
    if dry_run:
        print("DRY RUN MODE - Previewing changes (no data modified)")
        print("Run with --apply to execute the migration\n")
    else:
        print("APPLY MODE - Will modify database")
        confirm = input("Are you sure? Type 'yes' to continue: ")
        if confirm != 'yes':
            print("Aborted")
            sys.exit(0)
    
    migrate_contacts(dry_run=dry_run)
