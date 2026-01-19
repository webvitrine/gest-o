
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialInsights = async (transactions: Transaction[]): Promise<AIInsight[]> => {
  const model = 'gemini-3-flash-preview';
  
  const transactionsContext = transactions.map(t => 
    `${t.date}: ${t.description} - R$ ${t.amount} (${t.type === 'INCOME' ? 'Receita' : 'Despesa'}, Categoria: ${t.category})`
  ).join('\n');

  const prompt = `Analise as seguintes transações financeiras e forneça 3 insights ou dicas personalizadas para o usuário economizar ou gerir melhor o dinheiro.
  Transações:
  ${transactionsContext}
  
  Responda estritamente em formato JSON seguindo este esquema:
  Array de objetos com { "title": string, "message": string, "type": "TIP" | "WARNING" | "OPPORTUNITY" }`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["TIP", "WARNING", "OPPORTUNITY"] }
            },
            required: ["title", "message", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Erro ao obter insights da IA:", error);
    return [{
      title: "Dica de Hoje",
      message: "Mantenha o registro de suas transações em dia para análises mais precisas.",
      type: "TIP"
    }];
  }
};
