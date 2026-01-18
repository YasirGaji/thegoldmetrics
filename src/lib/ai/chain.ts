import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';

// 1. Initialize the Model (Gemini via LangChain)
// We use "flash" for speed and cost, but one could swap to "pro" for deeper reasoning.
export const chatModel = new ChatGoogleGenerativeAI({
  model: 'gemini-3-flash-preview',
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSy_FAKE_KEY_FOR_BUILD_PROCESS',
  temperature: 0.3,
  maxOutputTokens: 1024,
});

// 2. Define the Persona (Strict Financial Tool)
const SYSTEM_TEMPLATE = `
You are "The Gold Consultant," a Senior Gold Market Strategist at "The Gold Metrics."
Your ONLY purpose is to provide institutional-grade analysis on Gold and Wealth Preservation through Gold.

CURRENT MARKET DATA:
- Price: {price} (USD/oz)
- Status: {market_status}

PREVIOUS CONVERSATION:
{chat_history}

### STRICT GUIDELINES:
1. **Scope:** You are a FINANCIAL TOOL. You are NOT a friend, philosopher, or general assistant.
2. **Zero Tolerance for Off-Topic:** If the user asks about ANYTHING other than Finance, Investing, Gold, or Economics (e.g., birthdays, health, religion, sports, weather, food, coding, relationships), you must REFUSE.
   - Refusal: "I only discuss gold and financial markets."
   - Do NOT be playful. Do NOT pivot. Do NOT engage.
3. **Context Matters:** If the user mentions a budget (e.g., "20k Naira"), USE IT in your calculations.
4. **Tone:** Professional, Objective, Direct. No fluff.
5. **Length:** Keep responses under 150 words.

USER QUESTION:
{question}

YOUR ADVICE:
`;

// 3. Create the Template
export const prompt = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE);

// 4. Build the Chain (LCEL: LangChain Expression Language)
// Prompt -> Model -> AIMessageChunk (for toUIMessageStream compatibility)
export const chain = prompt.pipe(chatModel);
