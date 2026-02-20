#!/bin/bash
# Model Router - Route tasks to optimal LLM models
# Usage: ./model-router.sh "task description" [task_type]

CONFIG_FILE="${MODEL_ROUTER_CONFIG:-$(dirname "$0")/config.json}"

# Default model mappings
# Format: task_type|model|cost_tier
declare -A MODEL_MAP=(
    ["coding"]="kimi-coding/k2p5|tier2"
    ["research"]="kimi-k2.5|tier1"
    ["quick-check"]="kimi-k2.5|tier1"
    ["deep-reasoning"]="kimi-k2.5|tier2"
    ["creative"]="claude-3.5-sonnet|tier3"
    ["vision"]="gemini-pro-vision|tier2"
    ["default"]="kimi-k2.5|tier1"
)

# Task type detection keywords
declare -A TASK_KEYWORDS=(
    ["coding"]="code debug fix bug python javascript sql error function class import"
    ["research"]="research analyze study investigate compare review report data"
    ["creative"]="write draft email copy content blog post story creative"
    ["vision"]="image photo picture screenshot analyze visual look see"
    ["quick-check"]="check verify status ping health simple quick confirm"
)

detect_task_type() {
    local task="$1"
    local task_lower=$(echo "$task" | tr '[:upper:]' '[:lower:]')
    
    # Check each task type's keywords
    for task_type in "${!TASK_KEYWORDS[@]}"; do
        local keywords="${TASK_KEYWORDS[$task_type]}"
        for keyword in $keywords; do
            if echo "$task_lower" | grep -qw "$keyword"; then
                echo "$task_type"
                return 0
            fi
        done
    done
    
    echo "default"
}

get_model_for_task() {
    local task_type="$1"
    
    if [[ -n "${MODEL_MAP[$task_type]}" ]]; then
        echo "${MODEL_MAP[$task_type]}"
    else
        echo "${MODEL_MAP[default]}"
    fi
}

spawn_with_model() {
    local task="$1"
    local model="$2"
    local timeout="${3:-300}"
    
    echo "🎯 Routing task to model: $model"
    echo "📋 Task: ${task:0:80}..."
    echo ""
    
    # Spawn sub-agent with specific model
    # This uses OpenClaw's sessions_spawn capability
    openclaw sessions spawn \
        --task "$task" \
        --model "$model" \
        --timeout "$timeout" \
        --cleanup delete 2>&1
}

main() {
    local task="$1"
    local explicit_type="$2"
    
    if [[ -z "$task" ]]; then
        echo "Usage: model-router.sh 'task description' [task_type]"
        echo ""
        echo "Task types: coding, research, quick-check, deep-reasoning, creative, vision"
        echo ""
        echo "Examples:"
        echo "  model-router.sh 'Fix this Python error' coding"
        echo "  model-router.sh 'Research Comcast competitors'"
        exit 1
    fi
    
    # Detect or use explicit task type
    if [[ -n "$explicit_type" ]]; then
        task_type="$explicit_type"
        echo "📌 Using explicit task type: $task_type"
    else
        task_type=$(detect_task_type "$task")
        echo "🔍 Auto-detected task type: $task_type"
    fi
    
    # Get model for task
    model_info=$(get_model_for_task "$task_type")
    model=$(echo "$model_info" | cut -d'|' -f1)
    cost_tier=$(echo "$model_info" | cut -d'|' -f2)
    
    echo "💰 Cost tier: $cost_tier"
    echo ""
    
    # Spawn task with selected model
    spawn_with_model "$task" "$model"
}

# Run main
main "$@"
