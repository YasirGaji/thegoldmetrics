import { NextResponse } from 'next/server';
import { ingestLatestNews } from '@/lib/ai/news-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('⚡️ Manual Trigger: Ingesting News...');
    await ingestLatestNews();
    return NextResponse.json({
      success: true,
      message: 'News ingestion complete.',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Ingestion Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
