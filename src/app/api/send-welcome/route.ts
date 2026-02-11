import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    const data = await resend.emails.send({
      from: 'Onboarding <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to The Gold Metrics',
      react: WelcomeEmail({ name }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
