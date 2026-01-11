import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';

// 1. Initialize the Model (Gemini via LangChain)
// We use "flash" for speed/cost, but you could swap to "pro" for deeper reasoning.
export const chatModel = new ChatGoogleGenerativeAI({
  model: 'gemini-3-flash-preview',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 1024,
});

// 2. Define the Persona (System Prompt)
// We inject {price} and {market_status} as dynamic variables.
const SYSTEM_TEMPLATE = `
You are "The Gold Consultant," a senior Gold Market Strategist at "The Gold Metrics."
Your goal is to give sharp, specific advice.

CURRENT MARKET DATA:
- Price: {price} (USD/oz)
- Status: {market_status}

PREVIOUS CONVERSATION:
{chat_history}

RULES:
1. **Be Conversational**: Don't lecture. Speak like a human expert.
2. **Context Matters**: If the user mentioned "Naira" or "20k" before, REMEMBER IT.
3. **Refusals**: If asked about non-finance topics, pivot playfully back to gold: "I can't help with lunch, but I can help you buy lunch money with Gold."
4. **Length**: Keep it under 150 words. Be punchy.
5. **Disclaimer**: Add a tiny "Not financial advice" tag at the very end.

USER QUESTION:
{question}

YOUR ADVICE:
`;

// 3. Create the Template
export const prompt = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE);

// 4. Build the Chain (LCEL: LangChain Expression Language)
// Prompt -> Model -> AIMessageChunk (for toUIMessageStream compatibility)
export const chain = prompt.pipe(chatModel);
