import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

// Telnyx webhook handler for SMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook for debugging
    console.log('Telnyx webhook received:', JSON.stringify(body, null, 2));
    
    // Handle different event types
    const eventType = body.data?.event_type;
    
    switch (eventType) {
      case 'message.received':
        return handleIncomingMessage(body);
      case 'message.finalized':
        return handleDeliveryReceipt(body);
      default:
        console.log('Unhandled Telnyx event type:', eventType);
        return NextResponse.json({ received: true });
    }
  } catch (err) {
    console.error('Error processing Telnyx webhook:', err);
    // Always return 200 so Telnyx doesn't retry
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

// Handle incoming SMS
async function handleIncomingMessage(body: any) {
  const message = body.data?.payload;
  
  if (!message) {
    return NextResponse.json({ received: true });
  }
  
  const from = message.from?.phone_number;
  const to = message.to?.[0]?.phone_number;
  const text = message.text;
  
  console.log(`Incoming SMS from ${from} to ${to}: ${text}`);
  
  // Check for opt-out keywords
  const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
  const isOptOut = optOutKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  if (isOptOut) {
    console.log(`Opt-out received from ${from}`);
    
    // TODO: Add to suppression list in database
    // await addToSuppressionList(from);
    
    // Send opt-out confirmation
    await sendOptOutConfirmation(to, from);
    
    return NextResponse.json({ 
      received: true, 
      action: 'opt_out_handled',
      message: 'Unsubscribe processed'
    });
  }
  
  // Check for opt-in/START
  const optInKeywords = ['start', 'subscribe', 'yes'];
  const isOptIn = optInKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );
  
  if (isOptIn) {
    console.log(`Opt-in received from ${from}`);
    
    // TODO: Remove from suppression list
    
    return NextResponse.json({
      received: true,
      action: 'opt_in_handled',
      message: 'Subscription restored'
    });
  }
  
  // Regular incoming message - forward to Xavier
  // TODO: Send WhatsApp notification
  // await notifyViaWhatsApp(from, text);
  
  return NextResponse.json({ 
    received: true, 
    action: 'message_logged',
    message: 'Incoming SMS logged'
  });
}

// Handle delivery receipts
async function handleDeliveryReceipt(body: any) {
  const payload = body.data?.payload;
  
  if (!payload) {
    return NextResponse.json({ received: true });
  }
  
  const messageId = payload.id;
  const status = payload.status;
  const to = payload.to?.[0]?.phone_number;
  
  console.log(`Delivery receipt for ${messageId} to ${to}: ${status}`);
  
  // Log delivery status
  // TODO: Update message status in database
  // await updateMessageStatus(messageId, status);
  
  return NextResponse.json({ 
    received: true, 
    action: 'receipt_logged',
    status: status
  });
}

// Send opt-out confirmation
async function sendOptOutConfirmation(fromNumber: string, toNumber: string) {
  try {
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromNumber,
        to: toNumber,
        text: 'You have been unsubscribed. You will not receive any more messages. Reply START to resubscribe.',
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send opt-out confirmation');
    }
  } catch (err) {
    console.error('Error sending opt-out confirmation:', err);
  }
}

// GET handler for webhook verification (if needed)
export async function GET(request: NextRequest) {
  // Some services verify webhooks with GET requests
  return NextResponse.json({ 
    status: 'ok', 
    service: 'Telnyx SMS Webhook',
    timestamp: new Date().toISOString()
  });
}
