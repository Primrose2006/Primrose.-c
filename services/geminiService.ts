
import type { SimplifiedDocument, FileData, ChatMessage } from '../types';

// The API endpoint of our new secure backend
const API_URL = '/api/gemini';

// A helper function to handle API requests to our backend
const fetchFromApi = async (action: string, payload: object) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    console.error('API Error Response:', errorBody);
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
};


export const simplifyDocument = async ({ text, file }: { text?: string; file?: FileData }): Promise<SimplifiedDocument> => {
  try {
    const result = await fetchFromApi('analyze', { text, file });
    return result as SimplifiedDocument;
  } catch (error) {
    console.error("Error calling backend for document analysis:", error);
    throw new Error("Failed to get a valid response from the server.");
  }
};


export const streamChatResponse = async (
    history: ChatMessage[],
    context: string,
    chatType: 'analyzer' | 'advisor' | 'hub',
    onChunk: (chunk: string) => void
): Promise<void> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'chat', payload: { history, context, chatType } }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            onChunk(decoder.decode(value, { stream: true }));
        }

    } catch (error) {
        console.error("Error streaming chat response:", error);
        throw new Error("Failed to get a valid response from the server.");
    }
};
