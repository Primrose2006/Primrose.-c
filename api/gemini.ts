
// This is a serverless function that acts as a secure backend.
// It is designed to be deployed on platforms like Vercel or Netlify.

import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, SimplifiedDocument, FileData } from '../types';

// This function will run on a server, where process.env.API_KEY is securely stored.
if (!process.env.API_KEY) {
  // This error will be logged on the server, not the client.
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise, empathetic, and easy-to-understand summary of the legal document. Explain the main purpose and implications in plain English, as if explaining to a friend who is feeling overwhelmed. Start with a reassuring sentence.",
    },
    keyTerms: {
      type: Type.ARRAY,
      description: "A list of important legal terms found in the document.",
      items: {
        type: Type.OBJECT,
        properties: {
          term: {
            type: Type.STRING,
            description: "The specific legal term or phrase from the document.",
          },
          definition: {
            type: Type.STRING,
            description: "A simple, clear definition of the term in plain English. Use an analogy if it helps clarify the concept.",
          },
        },
        required: ["term", "definition"],
      },
    },
    potentialRisks: {
      type: Type.ARRAY,
      description: "A bulleted list of potential risks, obligations, or points of caution for the person signing or agreeing to this document. Phrase these as 'Heads-up' points. These should be actionable and clear.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["summary", "keyTerms", "potentialRisks"],
};

const getDocumentAnalysis = async (text?: string, file?: FileData): Promise<SimplifiedDocument> => {
    if (!text && !file) {
      throw new Error("Either text or a file must be provided.");
    }

    const basePrompt = `
      Act as a helpful, supportive, and extremely clear legal assistant. Your audience is someone who is not a lawyer and is likely feeling anxious or confused by this legal document. Your primary goal is to demystify the text and empower the user by making it understandable.
      Analyze the following legal document and break it down into a simple summary, definitions of key terms, and a list of potential risks or important considerations.
      Use plain, accessible language throughout. Avoid jargon. The tone should be reassuring and professional, but you absolutely must not provide legal advice.
    `;
    
    const userParts: any[] = [];
    if (file) {
      userParts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType,
        }
      });
      userParts.push({ text: basePrompt });
    } else {
      userParts.push({ text: `${basePrompt}\n\nDocument Text:\n---\n${text}\n---` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: userParts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!parsedData.summary || !Array.isArray(parsedData.keyTerms) || !Array.isArray(parsedData.potentialRisks)) {
      throw new Error("Invalid data structure received from API.");
    }
    
    return parsedData as SimplifiedDocument;
};


// Main handler for the serverless function
export default async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { action, payload } = await req.json();

        switch (action) {
            case 'analyze': {
                const { text, file } = payload;
                const result = await getDocumentAnalysis(text, file);
                return new Response(JSON.stringify(result), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            case 'chat': {
                const { history, context, chatType } = payload;
    
                let systemInstruction = '';
                if (chatType === 'analyzer') {
                    systemInstruction = `You are an AI assistant designed to help users understand a specific legal document. You are a patient and clear explainer, not a lawyer, and you CANNOT provide legal advice. Your purpose is to explain clauses, define terms, and summarize sections of the provided document context in simple, easy-to-understand language.

                    **IMPORTANT RULES:**
                    1. At the beginning of EVERY response, you MUST include the following disclaimer: "As an AI assistant, I can't provide legal advice. This information is for educational purposes only. It's always best to consult a qualified legal professional for advice on your specific situation."
                    2. Base all your answers strictly on the content of the document context provided below. Do not invent information or provide opinions on its fairness.
                    3. If a user asks "should I sign this?" or "is this a good deal?", gently refuse and redirect them to consult a legal professional.

                    Here is the user's document context:
                    ---
                    ${context}
                    ---`;
                } else if (chatType === 'advisor') {
                    systemInstruction = `You are a helpful and proactive AI "Document Advisor". Your goal is to help users identify necessary legal or government documents based on their life goals.
                    **Your Process:**
                    1. Start the conversation by warmly greeting the user and asking what goal or life event they're planning for.
                    2. Listen to their response and ask clarifying questions to better understand their needs. Be curious and inquisitive.
                    3. Once you have enough information, suggest specific documents. For each document, explain its name, purpose, and how it helps the user in a conversational, easy-to-understand way.
                    4. You are an advisor, not a lawyer. You MUST NOT give legal advice. Your suggestions are for informational purposes. Frame your suggestions like "A document you might want to look into is..." or "Many people in your situation find a [Document Name] helpful because...".`;
                } else if (chatType === 'hub') {
                    systemInstruction = `You are an AI assistant for a government document portal. Your role is to help users find the correct government forms and documents for their life events (e.g., starting a business, traveling, receiving benefits). You should be friendly, clear, and helpful.

                    **Your Process:**
                    1. Listen to the user's request.
                    2. Ask clarifying questions to understand their specific situation. For example, if they mention a business, ask about the business type (sole proprietor, LLC, etc.) or its location.
                    3. Based on their needs, provide the names or official codes of relevant government forms (e.g., 'Form SS-4 for an Employer Identification Number (EIN)', 'Form DS-11 for a U.S. Passport Application').
                    4. For each form you suggest, briefly explain its purpose in simple terms.
                    5. You are an informational assistant, not a legal advisor. Do not provide legal advice. Frame suggestions carefully, e.g., "A common form for this purpose is..." or "You might need to look into...".`;
                }


                const contents = history.map((msg: ChatMessage) => ({
                    role: msg.role,
                    parts: [{ text: msg.content }],
                }));

                const streamResult = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: contents,
                    config: {
                        systemInstruction,
                        thinkingConfig: { thinkingBudget: 0 },
                    }
                });

                const stream = new ReadableStream({
                    async start(controller) {
                        const encoder = new TextEncoder();
                        for await (const chunk of streamResult) {
                            const text = chunk.text;
                            if (text) {
                                controller.enqueue(encoder.encode(text));
                            }
                        }
                        controller.close();
                    },
                });

                return new Response(stream, {
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                });
            }
            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
        }
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
