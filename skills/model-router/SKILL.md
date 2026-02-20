---
name: model-router
description: Route tasks to optimal LLM models based on task type. Spawn sub-agents with appropriate models for heartbeat tasks, coding, research, and creative work.
metadata:
  {
    "openclaw":
      {
        "emoji": "🎯",
        "requires": { "bins": ["openclaw"] },
      },
  }
---

# Model Router Skill

Intelligently route tasks to the best-suited LLM model. Use for heartbeat automation, multi-model workflows, and cost optimization.

## Quick Start

```bash
# Route a task to the optimal model
openclaw run --agent model-router --task "analyze this code" --type coding

# Spawn heartbeat check with specific model
openclaw spawn --agent heartbeat --model kimi-coding/k2p5 --task "check git status"
```

## Model Mappings

| Task Type | Default Model | Rationale |
|-----------|--------------|-----------|
| `coding` | kimi-coding/k2p5 | Superior code generation and debugging |
| `research` | kimi-k2.5 | Broad knowledge, good reasoning |
| `quick-check` | kimi-k2.5 | Fast, cost-effective |
| `creative` | claude-3.5-sonnet | Nuanced writing and analysis |
| `vision` | gemini-pro-vision | Image understanding |
| `deep-reasoning` | o1 or kimi-k2.5 | Complex problem solving |

## Heartbeat Integration

Update `HEARTBEAT.md` to use model routing:

```yaml
heartbeat_tasks:
  - task: "Check email priority"
    type: quick-check
    model: kimi-k2.5
    
  - task: "Analyze sales data"
    type: research
    model: kimi-k2.5
    
  - task: "Review code changes"
    type: coding
    model: kimi-coding/k2p5
```

## Cost Tracking

Models are ranked by cost tier:
- **Tier 1 (Lowest)**: kimi-k2.5, haiku
- **Tier 2 (Medium)**: gpt-4o, kimi-coding/k2p5
- **Tier 3 (High)**: claude-3.5-sonnet, o1

Use Tier 1 for routine checks, Tier 3 for critical analysis.

## Usage

### From CLI
```bash
# Route based on content analysis
./model-router.sh "Fix this Python bug" 
# → Spawns with kimi-coding/k2p5

./model-router.sh "Research competitors"
# → Spawns with kimi-k2.5
```

### From OpenClaw
```python
# In a skill or script
from model_router import route_task

result = route_task(
    task="Review this PR",
    task_type="coding",
    context={"files_changed": 5}
)
```

## Configuration

Edit `config.json` to customize mappings:

```json
{
  "models": {
    "coding": "kimi-coding/k2p5",
    "research": "kimi-k2.5",
    "default": "kimi-k2.5"
  },
  "cost_optimization": true,
  "fallback_model": "kimi-k2.5"
}
```
