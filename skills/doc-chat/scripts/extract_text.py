#!/usr/bin/env python3
"""
Extract text from various document formats for doc-chat skill.
Supports: PDF, DOCX, TXT, MD, HTML, RTF
"""

import sys
import os
import argparse

def extract_pdf(path):
    """Extract text from PDF using pdfplumber."""
    try:
        import pdfplumber
    except ImportError:
        print("pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)
    
    text_parts = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"\n--- Page {i} ---\n{page_text}")
    return "\n".join(text_parts)

def extract_docx(path):
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
    except ImportError:
        print("python-docx not installed. Run: pip install python-docx", file=sys.stderr)
        sys.exit(1)
    
    doc = Document(path)
    text_parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            text_parts.append(para.text)
    return "\n\n".join(text_parts)

def extract_txt(path):
    """Extract text from plain text files."""
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def extract_html(path):
    """Extract text from HTML using BeautifulSoup."""
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("beautifulsoup4 not installed. Run: pip install beautifulsoup4", file=sys.stderr)
        sys.exit(1)
    
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        return soup.get_text(separator='\n', strip=True)

def extract_rtf(path):
    """Extract text from RTF using striprtf."""
    try:
        from striprtf.striprtf import rtf_to_text
    except ImportError:
        print("striprtf not installed. Run: pip install striprtf", file=sys.stderr)
        sys.exit(1)
    
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return rtf_to_text(f.read())

def extract_document(path):
    """Route to appropriate extractor based on file extension."""
    ext = os.path.splitext(path)[1].lower()
    
    extractors = {
        '.pdf': extract_pdf,
        '.docx': extract_docx,
        '.txt': extract_txt,
        '.md': extract_txt,
        '.markdown': extract_txt,
        '.html': extract_html,
        '.htm': extract_html,
        '.rtf': extract_rtf,
    }
    
    if ext not in extractors:
        # Try as plain text for unknown extensions
        return extract_txt(path)
    
    return extractors[ext](path)

def main():
    parser = argparse.ArgumentParser(description='Extract text from documents')
    parser.add_argument('files', nargs='+', help='Document files to process')
    parser.add_argument('--output', '-o', help='Output file (default: stdout)')
    parser.add_argument('--separator', '-s', default='\n' + '='*60 + '\n',
                       help='Separator between documents')
    args = parser.parse_args()
    
    results = []
    for filepath in args.files:
        if not os.path.exists(filepath):
            print(f"Error: File not found: {filepath}", file=sys.stderr)
            continue
        
        filename = os.path.basename(filepath)
        try:
            content = extract_document(filepath)
            results.append(f"# {filename}\n\n{content}")
        except Exception as e:
            print(f"Error extracting {filepath}: {e}", file=sys.stderr)
    
    output = args.separator.join(results)
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Extracted text written to {args.output}")
    else:
        print(output)

if __name__ == '__main__':
    main()
