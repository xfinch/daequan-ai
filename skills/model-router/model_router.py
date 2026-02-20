#!/usr/bin/env python3
"""
Model Router - Python implementation for advanced use cases
Integrates with OpenClaw sessions_spawn for intelligent task routing
"""

import json
import os
import sys
import subprocess
import re
from typing import Optional, Dict, List

class ModelRouter:
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        
        with open(config_path) as f:
            self.config = json.load(f)
    
    def detect_task_type(self, task: str) -> str:
        """Auto-detect task type from content"""
        task_lower = task.lower()
        keywords = self.config.get('task_keywords', {})
        
        scores = {}
        for task_type, words in keywords.items():
            score = sum(1 for word in words if word in task_lower)
            if score > 0:
                scores[task_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        return 'default'
    
    def get_model(self, task_type: str) -> Dict:
        """Get model configuration for task type"""
        models = self.config.get('models', {})
        return models.get(task_type, models.get('default'))
    
    def spawn_task(self, task: str, task_type: Optional[str] = None, 
                   timeout: int = 300, context: Optional[Dict] = None) -> Dict:
        """Spawn a sub-agent with the optimal model"""
        
        # Detect or use explicit task type
        if task_type is None:
            task_type = self.detect_task_type(task)
            print(f"🔍 Auto-detected: {task_type}")
        else:
            print(f"📌 Explicit type: {task_type}")
        
        # Get model config
        model_config = self.get_model(task_type)
        model = model_config['model']
        tier = model_config['cost_tier']
        
        print(f"🎯 Model: {model}")
        print(f"💰 Tier: {tier}")
        print(f"📋 Task: {task[:80]}...")
        print()
        
        # Build spawn command
        # This would integrate with OpenClaw's sessions_spawn
        result = {
            'task': task,
            'task_type': task_type,
            'model': model,
            'cost_tier': tier,
            'timeout': timeout,
            'spawn_command': f'sessions_spawn --task "{task}" --model {model} --timeout {timeout}'
        }
        
        return result
    
    def route_heartbeat_tasks(self, tasks: List[Dict]) -> List[Dict]:
        """Route multiple heartbeat tasks to appropriate models"""
        routed = []
        
        for task_def in tasks:
            task = task_def.get('task', '')
            task_type = task_def.get('type')
            timeout = task_def.get('timeout', 300)
            
            routed_task = self.spawn_task(task, task_type, timeout)
            routed.append(routed_task)
        
        return routed


def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Route tasks to optimal LLM models')
    parser.add_argument('task', help='Task description')
    parser.add_argument('--type', '-t', help='Explicit task type (coding, research, etc.)')
    parser.add_argument('--timeout', default=300, type=int, help='Timeout in seconds')
    parser.add_argument('--config', '-c', help='Config file path')
    
    args = parser.parse_args()
    
    router = ModelRouter(args.config)
    result = router.spawn_task(args.task, args.type, args.timeout)
    
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
