import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY || '');

const model = genAI.getGenerativeModel({
	model: 'gemini-2.5-flash',
	systemInstruction: `
    Você é o Consultor Financeiro IA do Vallo AI. 
    Seu objetivo é ajudar usuários a entenderem suas finanças com base em dados reais do Open Finance (Pluggy).
    
    DIRETRIZES:
    1. Seja profissional, mas amigável e acessível.
    2. Sempre baseie suas respostas nos dados fornecidos no contexto.
    3. Se o usuário perguntar algo que não está nos dados, informe honestamente.
    4. Dê conselhos práticos e acionáveis (ex: "Você gastou muito em iFood, tente reduzir X").
    5. Use Markdown para formatar tabelas, listas e negritos para facilitar a leitura.
    6. Nunca peça senhas ou dados sensíveis.
    7. Responda sempre em Português do Brasil.
    `
});

export async function generateFinancialAdvice(context: string, userMessage: string, history: any[] = []) {
	try {
		// O Gemini exige que o primeiro item do histórico seja do 'user'.
		// Filtramos qualquer mensagem inicial do sistema/assistente.
		const firstUserIndex = history.findIndex(msg => msg.role === 'user');
		const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

		const chat = model.startChat({
			history: validHistory.map((msg) => ({
				role: msg.role === 'user' ? 'user' : 'model',
				parts: [{ text: msg.content }]
			}))
		});

		const prompt = `
        CONTEXTO FINANCEIRO DO USUÁRIO:
        ${context}
        
        MENSAGEM DO USUÁRIO:
        ${userMessage}
        `;

		const result = await chat.sendMessage(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error('Erro no Gemini AI:', error);
		throw error;
	}
}
