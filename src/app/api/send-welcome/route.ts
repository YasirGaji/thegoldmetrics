import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { email, name } = await request.json();

    const emailHtml = await render(WelcomeEmail({ name }));

    const data = await resend.emails.send({
      from: 'The Gold Metrics <onboarding@thegoldmetrics.com>',
      to: [email],
      subject: 'Welcome to The Gold Metrics Vault',
      html: emailHtml,
    });

    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('RESEND API ERROR:', error);

    return NextResponse.json(
      {
        message: 'Failed to send email',
        error: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
}
