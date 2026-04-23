import { fetchUserAccounts } from '$lib/server/pluggy';
import { generateFinancialAdvice } from '$lib/server/ai';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const accounts = await fetchUserAccounts(locals.user!.id);
	
	// Create a minimal context string for the AI
	const context = accounts.map(acc => ({
		name: acc.name,
		balance: acc.balance,
		type: acc.type,
		transactions: acc.transactions.map(tx => ({
			description: tx.description,
			amount: tx.amount,
			date: tx.date,
			category: tx.category
		}))
	}));

	return {
		financialContext: JSON.stringify(context)
	};
};

export const actions: Actions = {
	ask: async ({ request, locals }) => {
		const formData = await request.formData();
		const message = formData.get('message') as string;
		const context = formData.get('context') as string;
		const historyJson = formData.get('history') as string;
		const history = JSON.parse(historyJson || '[]');

		if (!message) return fail(400, { message: 'Mensagem é obrigatória' });

		try {
			const response = await generateFinancialAdvice(context, message, history);
			return { answer: response };
		} catch (error: any) {
			console.error('Erro na ação ask:', error);
			return fail(500, { 
				error: true,
				message: 'Ocorreu um erro ao processar sua pergunta. Verifique sua cota ou chave de API.' 
			});
		}
	}
};
