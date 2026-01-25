import { NextResponse } from 'next/server';
import { executeIngestNews } from '@/lib/cron/services';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
      key !== process.env.CRON_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await executeIngestNews();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ingest News Route Failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
