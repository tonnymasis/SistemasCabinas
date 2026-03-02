import { NextResponse } from 'next/server';
import { BookingRepository } from '@/lib/data/BookingRepository';

const repository = new BookingRepository();

export async function GET() {
  try {
    const cabins = await repository.getAllCabins();
    return NextResponse.json(cabins);
  } catch (error) {
    console.error('Error fetching cabins:', error);
    return NextResponse.json({ error: 'Failed to fetch cabins' }, { status: 500 });
  }
}