import { NextRequest } from 'next/server';
import { watchSkillUsage } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
      
      // Watch for changes
      const unsubscribe = watchSkillUsage((change) => {
        if (change.operationType === 'insert') {
          const data = JSON.stringify({
            type: 'new_activity',
            data: change.fullDocument
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      });
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`));
      }, 30000);
      
      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
