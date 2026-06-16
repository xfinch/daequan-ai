#!/usr/bin/env python3
"""
Contact Name Parser - Durable Executable
Parses contact names with roles/designations into structured fields.

Built for long-term use, configurable, testable, extensible.
"""

import re
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict


@dataclass
class ParsedPerson:
    """Represents a single parsed person"""
    first_name: str
    last_name: str
    role: str
    person_type: str  # 'gatekeeper', 'decision_maker', 'other'
    
    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class ParsedContact:
    """Result of parsing a contact_name string"""
    gatekeeper: Optional[ParsedPerson]
    decision_maker: Optional[ParsedPerson]
    others: List[ParsedPerson]
    role_notes: str  # Formatted string of all roles for notes field
    
    def to_dict(self) -> Dict:
        return {
            'gatekeeper': self.gatekeeper.to_dict() if self.gatekeeper else None,
            'decision_maker': self.decision_maker.to_dict() if self.decision_maker else None,
            'others': [o.to_dict() for o in self.others],
            'role_notes': self.role_notes
        }


class ContactParser:
    """
    Parses contact names with role designations.
    
    Configurable role mappings for gatekeepers and decision makers.
    Handles Dr. prefix as special case.
    """
    
    # Default role mappings - can be extended via config
    GATEKEEPER_ROLES = {
        'gatekeeper', 'gk', 'receptionist', 'receptionist/gatekeeper',
        'receptionist / gatekeeper', 'front desk', 'secretary'
    }
    
    DECISION_MAKER_ROLES = {
        'owner', 'dm', 'decision maker', 'decision-maker', 'president',
        'ceo', 'founder', 'partner'
    }
    
    def __init__(self, gatekeeper_roles: Optional[set] = None,
                 decision_maker_roles: Optional[set] = None):
        """
        Initialize parser with optional custom role mappings.
        
        Args:
            gatekeeper_roles: Set of role strings that indicate gatekeeper
            decision_maker_roles: Set of role strings that indicate decision maker
        """
        self.gatekeeper_roles = gatekeeper_roles or self.GATEKEEPER_ROLES
        self.decision_maker_roles = decision_maker_roles or self.DECISION_MAKER_ROLES
        
        # Compile regex for extracting role from parentheses
        self.role_pattern = re.compile(r'\s*\(([^)]+)\)\s*')
    
    def _capitalize_name(self, name: str) -> str:
        """
        Capitalize a name properly.
        Handles multi-word names and preserves existing capitals for mixed-case names.
        """
        if not name:
            return ''
        # Capitalize each word
        return ' '.join(word.capitalize() for word in name.split())
    
    def parse_name(self, name_str: str) -> Tuple[str, str]:
        """
        Parse a name string into first and last name.
        
        Handles Dr. prefix specially - includes it in first name.
        Always returns properly capitalized names.
        
        Args:
            name_str: Name string (e.g., "Dr. John Smith", "John", "John Smith")
            
        Returns:
            Tuple of (first_name, last_name)
        """
        name_str = name_str.strip()
        if not name_str:
            return '', ''
        
        parts = name_str.split()
        
        # Handle Dr. prefix - include in first name
        if parts[0].lower() in ('dr.', 'dr'):
            if len(parts) == 1:
                return self._capitalize_name(parts[0]), ''
            elif len(parts) == 2:
                return self._capitalize_name(f"{parts[0]} {parts[1]}"), ''
            else:
                first = self._capitalize_name(f"{parts[0]} {parts[1]}")
                last = self._capitalize_name(' '.join(parts[2:]))
                return first, last
        
        # Standard parsing with capitalization
        if len(parts) == 1:
            return self._capitalize_name(parts[0]), ''
        else:
            first = self._capitalize_name(parts[0])
            last = self._capitalize_name(' '.join(parts[1:]))
            return first, last
    
    def extract_role(self, person_str: str) -> Tuple[str, str]:
        """
        Extract role from parentheses in a person string.
        
        Args:
            person_str: String like "John (owner)" or "Jane Smith (Manager)"
            
        Returns:
            Tuple of (clean_name, role)
        """
        match = self.role_pattern.search(person_str)
        if match:
            role = match.group(1).strip().lower()
            clean_name = self.role_pattern.sub('', person_str).strip()
            return clean_name, role
        return person_str.strip(), ''
    
    def classify_role(self, role: str) -> str:
        """
        Classify a role string into person type.
        
        Args:
            role: Lowercase role string
            
        Returns:
            'gatekeeper', 'decision_maker', or 'other'
        """
        role_lower = role.lower()
        
        # Check gatekeeper roles
        for gk_role in self.gatekeeper_roles:
            if gk_role in role_lower or role_lower in gk_role:
                return 'gatekeeper'
        
        # Check decision maker roles
        for dm_role in self.decision_maker_roles:
            if dm_role in role_lower or role_lower in dm_role:
                return 'decision_maker'
        
        return 'other'
    
    def split_persons(self, contact_str: str) -> List[str]:
        """
        Split a contact string into individual persons.
        
        Handles comma, slash, and & as separators.
        
        Args:
            contact_str: String like "John (owner), Jane (gk)"
            
        Returns:
            List of person strings
        """
        if not contact_str:
            return []
        
        # Split by comma, slash, or &
        # But be careful not to split inside parentheses
        persons = []
        current = ''
        paren_depth = 0
        
        for char in contact_str:
            if char == '(':
                paren_depth += 1
                current += char
            elif char == ')':
                paren_depth -= 1
                current += char
            elif char in ',/&' and paren_depth == 0:
                if current.strip():
                    persons.append(current.strip())
                current = ''
            else:
                current += char
        
        if current.strip():
            persons.append(current.strip())
        
        return persons
    
    def parse(self, contact_name: str) -> ParsedContact:
        """
        Parse a contact name string into structured data.
        
        Args:
            contact_name: Raw contact name string from input
            
        Returns:
            ParsedContact with gatekeeper, decision_maker, others, and role_notes
        """
        if not contact_name or not contact_name.strip():
            return ParsedContact(None, None, [], '')
        
        persons = self.split_persons(contact_name)
        
        gatekeeper = None
        decision_maker = None
        others = []
        role_entries = []
        
        for person_str in persons:
            clean_name, role = self.extract_role(person_str)
            first_name, last_name = self.parse_name(clean_name)
            
            if not first_name and not last_name:
                continue
            
            person_type = self.classify_role(role) if role else 'other'
            
            parsed = ParsedPerson(
                first_name=first_name,
                last_name=last_name,
                role=role,
                person_type=person_type
            )
            
            # Build role entry for notes
            full_name = f"{first_name} {last_name}".strip()
            if role:
                role_entries.append(f"{full_name} ({role})")
            else:
                role_entries.append(full_name)
            
            # Assign to appropriate field (first match wins for GK/DM)
            if person_type == 'gatekeeper' and gatekeeper is None:
                gatekeeper = parsed
            elif person_type == 'decision_maker' and decision_maker is None:
                decision_maker = parsed
            else:
                others.append(parsed)
        
        role_notes = '; '.join(role_entries) if role_entries else ''
        
        return ParsedContact(
            gatekeeper=gatekeeper,
            decision_maker=decision_maker,
            others=others,
            role_notes=role_notes
        )


# Convenience function for simple usage
def parse_contact(contact_name: str, 
                  gatekeeper_roles: Optional[set] = None,
                  decision_maker_roles: Optional[set] = None) -> ParsedContact:
    """
    Parse a contact name string using default or custom role mappings.
    
    Args:
        contact_name: Raw contact name string
        gatekeeper_roles: Optional custom gatekeeper role mappings
        decision_maker_roles: Optional custom decision maker role mappings
        
    Returns:
        ParsedContact with structured data
    """
    parser = ContactParser(gatekeeper_roles, decision_maker_roles)
    return parser.parse(contact_name)


if __name__ == "__main__":
    # Test cases
    test_cases = [
        "Andre (owner), Jordan (artist on duty)",
        "Yana (Receptionist/Gatekeeper)",
        "Shannon (Manager) / John Elias (Owner)",
        "dave (gatekeeper), nate (decision maker)",
        "Sandra (DM), Louis (GK)",
        "Dr. Sarah Johnson (owner)",
        "Annie",
        "Dianne Stoehr",
        "Laureen (DM), Talia, Laurie",
        "Jennifer (owner), Jessica (beautician)",
        "Alicia (owner), Emily (gatekeeper)"
    ]
    
    parser = ContactParser()
    
    print("Contact Parser Test Results")
    print("=" * 80)
    
    for test in test_cases:
        result = parser.parse(test)
        print(f"\nInput: {test}")
        print(f"  Gatekeeper: {result.gatekeeper.to_dict() if result.gatekeeper else None}")
        print(f"  Decision Maker: {result.decision_maker.to_dict() if result.decision_maker else None}")
        print(f"  Others: {[o.to_dict() for o in result.others]}")
        print(f"  Role Notes: {result.role_notes}")
