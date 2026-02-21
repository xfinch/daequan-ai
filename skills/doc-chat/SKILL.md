---
name: doc-chat
description: Upload documents (PDF, DOCX, TXT, etc.) and chat with them for answers, summaries, and insights. Optionally generate podcast-style audio summaries using ElevenLabs TTS. Use when the user wants to: (1) Ask questions about document content, (2) Summarize or extract information from files, (3) Create audio narrations of documents, (4) Build a searchable knowledge base from uploaded docs.
---

# Document Chat Skill

Upload documents and chat with them for answers, summaries, and podcast-style audio.

## Overview

This skill provides NotebookLM-like functionality for OpenClaw:
- **Upload** → Add PDFs, DOCX, TXT, or other text files to a session
- **Chat** → Ask questions, get summaries, extract insights (powered by Gemini)
- **Audio** → Generate podcast-style narration using ElevenLabs TTS

## Quick Start

### 1. Upload Documents

Add files to your chat session context:

```bash
# Upload a single file
.upload /path/to/document.pdf

# Upload multiple files
.upload /path/to/file1.pdf /path/to/file2.docx

# Upload with a name for easier reference
.upload /path/to/report.pdf --name "Q4 Financial Report"
```

Supported formats: PDF, DOCX, TXT, MD, HTML, RTF

### 2. Chat With Documents

Once uploaded, ask questions naturally:

- "What are the key findings in the report?"
- "Summarize the executive summary"
- "What does the author say about pricing strategy?"
- "List all action items mentioned"

The model will reference the uploaded documents in its answers.

### 3. Generate Audio Summary

Create a podcast-style narration:

```bash
# Summarize and narrate
.podcast "Give me a 2-minute summary of the main points"

# Custom voice and style (uses sag skill)
.podcast "Explain the conclusions" --voice Josh --style conversational
```

## Commands

| Command | Description |
|---------|-------------|
| `.upload <files...>` | Add documents to session context |
| `.list` | Show uploaded documents |
| `.clear` | Remove all documents from context |
| `.podcast <prompt>` | Generate audio narration |

## How It Works

1. **Document Processing**: Files are extracted to text (PDF via pdfplumber, DOCX via python-docx, etc.)
2. **Context Management**: Full text is added to the conversation context for Gemini to reference
3. **Q&A**: Gemini answers based on the document content with citations
4. **Audio Generation**: ElevenLabs (via `sag` skill) creates natural-sounding narration

## Tips

- **Large files**: Very large PDFs (>100 pages) may hit context limits — ask for specific sections
- **Multiple docs**: Upload related documents together to cross-reference between them
- **Audio voices**: Default is "Josh" (professional). Try "Arnold" (authoritative) or "Adam" (friendly)

## See Also

- `sag` skill for ElevenLabs TTS options and voice selection
