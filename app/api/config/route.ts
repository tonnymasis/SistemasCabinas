import { NextResponse } from 'next/server';
import { BookingRepository } from '@/lib/data/BookingRepository';

const repository = new BookingRepository();

export async function GET() {
  try {
    const config = await repository.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}