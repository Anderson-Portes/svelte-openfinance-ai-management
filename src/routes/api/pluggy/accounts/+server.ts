import { json } from '@sveltejs/kit';
import { fetchUserAccounts } from '$lib/server/pluggy';

export const GET = async ({ locals }) => {
  try {
    if (!locals.user) {
      return json({ error: 'Não autorizado' }, { status: 401 });
    }

    const accounts = await fetchUserAccounts(locals.user.id);
    return json(accounts);
  } catch (err: any) {
    console.error('ERRO NA PLUGGY:', err.response?.data || err.message);

    return json({
      error: 'Falha ao buscar contas',
      details: err.response?.data || err.message
    }, { status: 500 });
  }
};
