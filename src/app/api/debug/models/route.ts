import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No API Key found' }, { status: 500 });
  }

  try {
    // We just initialize the client to verify the key works.
    new GoogleGenerativeAI(apiKey);

    // The SDK doesn't always expose listModels directly on the main class in all versions,
    // so we use a direct fetch to the API to be 100% sure.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Filter for just the names to make it readable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const availableModels = data.models.map((m: any) => ({
      name: m.name.replace('models/', ''), // Clean up the "models/" prefix
      supportedMethods: m.supportedGenerationMethods,
      description: m.description,
    }));

    return NextResponse.json({
      success: true,
      count: availableModels.length,
      models: availableModels,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
