import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const visit = await Visit.findById(params.id).lean();
    
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      visit: { ...visit, _id: (visit as any)._id.toString() }
    });
  } catch (err) {
    console.error('Error fetching visit:', err);
    return NextResponse.json({ error: 'Failed to fetch visit' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const updateData: any = {};
    if (body.businessName !== undefined) updateData.businessName = body.businessName;
    if (body.contactName !== undefined) updateData.contactName = body.contactName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zip !== undefined) updateData.zip = body.zip;
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lng !== undefined) updateData.lng = body.lng;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.missingFields !== undefined) updateData.missingFields = body.missingFields;
    if (body.needsUpdate !== undefined) updateData.needsUpdate = body.needsUpdate;
    
    const visit = await Visit.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, lean: true }
    );
    
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      visit: { ...visit, _id: (visit as any)._id.toString() }
    });
  } catch (err) {
    console.error('Error updating visit:', err);
    return NextResponse.json({ error: 'Failed to update visit' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const visit = await Visit.findByIdAndDelete(params.id);
    
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting visit:', err);
    return NextResponse.json({ error: 'Failed to delete visit' }, { status: 500 });
  }
}
