import { NextRequest, NextResponse } from 'next/server';
import { BookingRepository } from '@/lib/data/BookingRepository';

const repository = new BookingRepository();

export async function GET() {
  try {
    const backups = await repository.listBackups();
    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, type, backupFileName } = await request.json();

    switch (action) {
      case 'create':
        if (!['daily', 'weekly', 'monthly'].includes(type)) {
          return NextResponse.json({ error: 'Invalid backup type' }, { status: 400 });
        }
        
        const backupPath = await repository.createScheduledBackup(type as 'daily' | 'weekly' | 'monthly');
        return NextResponse.json({ 
          success: true, 
          message: `Backup ${type} created successfully`,
          path: backupPath 
        });

      case 'restore':
        if (!backupFileName) {
          return NextResponse.json({ error: 'Backup filename required' }, { status: 400 });
        }
        
        const restored = await repository.restoreFromBackup(backupFileName);
        if (restored) {
          return NextResponse.json({ 
            success: true, 
            message: `Data restored from ${backupFileName}` 
          });
        } else {
          return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing backup request:', error);
    return NextResponse.json({ error: 'Failed to process backup request' }, { status: 500 });
  }
}