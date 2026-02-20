# Model Router Heartbeat Integration

Add intelligent model routing to your heartbeat checks:

```yaml
# heartbeat-config.yaml
heartbeat_tasks:
  # Email monitoring - quick check, low cost
  - task: "Check xavier@thetraffic.link for P0/P1 priority emails"
    type: quick-check
    model: kimi-k2.5
    timeout: 60
    
  # Git analysis - requires code understanding
  - task: "Check workspace git status, summarize uncommitted changes"
    type: coding
    model: kimi-coding/k2p5
    timeout: 120
    
  # Research - analyze data
  - task: "Analyze Comcast territory data for untapped zip codes"
    type: research
    model: kimi-k2.5
    timeout: 180
    
  # Creative - draft content if needed
  - task: "Draft follow-up email for Trina Fallardo campaign if overdue"
    type: creative
    model: claude-3.5-sonnet
    timeout: 240
    condition: "trina_last_contact > 7_days"
```

## Usage in HEARTBEAT.md

```markdown
## Heartbeat Tasks with Model Routing

Run these checks every 30 minutes:

### Email Priority Monitor (quick-check)
- **Model:** kimi-k2.5 (Tier 1 - fast, cheap)
- **Task:** Check for urgent emails
- **Action on P0:** Immediate alert

### Code Review (coding)
- **Model:** kimi-coding/k2p5 (Tier 2 - code specialist)
- **Task:** Review recent commits, flag issues
- **Action:** Summarize in kanban

### Research Tasks (research)
- **Model:** kimi-k2.5 (Tier 1 - broad knowledge)
- **Task:** Competitor analysis, market research
- **Action:** Update research notes

## Implementation

Use the model-router skill:

```bash
# In heartbeat script
for task in "${HEARTBEAT_TASKS[@]}"; do
    /path/to/model-router.sh "$task"
done
```

Or Python:

```python
from model_router import ModelRouter

router = ModelRouter()
results = router.route_heartbeat_tasks(heartbeat_tasks)
```
```

## Cost Optimization Tips

1. **Use quick-check for monitoring** - Tier 1 models for status checks
2. **Reserve Tier 3 for critical analysis** - Creative writing, complex reasoning
3. **Batch similar tasks** - Group all "coding" tasks to spawn once with coding model
4. **Set timeouts aggressively** - Fail fast on stuck tasks

## Monitoring

Track costs per tier:

```bash
# Log model usage
model-router.sh "$task" --log-usage

# Generate cost report
model-router.sh --report --since "24h ago"
```
