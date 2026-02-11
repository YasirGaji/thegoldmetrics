import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { email, name } = await request.json();

    const data = await resend.emails.send({
      from: 'The Gold Metrics <onboarding@thegoldmetrics.com>',
      to: [email],
      subject: 'Welcome to The Gold Metrics Vault',
      react: WelcomeEmail({ name }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
