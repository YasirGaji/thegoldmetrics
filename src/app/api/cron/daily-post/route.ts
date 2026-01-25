import { NextResponse } from 'next/server';
import { executeDailyPost } from '@/lib/cron/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const authHeader = request.headers.get('authorization');

    if (
      key !== process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await executeDailyPost();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Daily Post Route Failed:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
