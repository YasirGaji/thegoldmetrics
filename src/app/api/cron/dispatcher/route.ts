import { NextResponse } from 'next/server';
import {
  executeDailyPost,
  executeRecordPrice,
  executeIngestNews,
} from '@/lib/cron/services';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for all jobs

export async function GET(request: Request) {
  try {
    // 1. Verify Secret (Security)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Current Time (UTC → Lagos)
    const now = new Date();
    const currentHourUTC = now.getUTCHours();
    const currentHourLagos = (currentHourUTC + 1) % 24;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const results: { job: string; success: boolean; message: string }[] = [];

    // --- JOB EXECUTION ---

    // A. Daily Post (2 PM Lagos, Mon-Fri)
    if (currentHourLagos === 14 && !isWeekend) {
      console.log('Dispatcher: Triggering Daily Post...');
      const result = await executeDailyPost();
      results.push({ job: 'daily-post', ...result });
    }

    // B. Record Price (9 PM Lagos, Mon-Fri)
    if (currentHourLagos === 21 && !isWeekend) {
      console.log('Dispatcher: Triggering Record Price...');
      const result = await executeRecordPrice();
      results.push({ job: 'record-price', ...result });
    }

    // C. Ingest News (Every 4 Hours, Mon-Fri)
    if (currentHourLagos % 4 === 0 && !isWeekend) {
      console.log('Dispatcher: Triggering News Ingestion...');
      const result = await executeIngestNews();
      results.push({ job: 'ingest-news', ...result });
    }

    // 3. Return Summary
    const hasFailures = results.some((r) => !r.success);

    return NextResponse.json(
      {
        success: !hasFailures,
        time_utc: `${currentHourUTC}:00`,
        time_lagos: `${currentHourLagos}:00`,
        is_weekend: isWeekend,
        jobs_executed: results.length,
        results,
      },
      { status: hasFailures ? 207 : 200 } // 207 = Multi-Status (partial success)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dispatcher Failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
