import { fetchUserAccounts, createConnectToken, savePluggyItem } from '$lib/server/pluggy';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // O hooks.server.ts já garante que se chegamos aqui, o user existe
  return {
    user: locals.user,
    connectToken: (await createConnectToken()).accessToken,
    // Passamos a promise sem o 'await' para habilitar o streaming no SvelteKit
    streamed: {
      accounts: fetchUserAccounts(locals.user!.id)
    }
  };
};

export const actions: Actions = {
  saveItem: async ({ request, locals }) => {
    const data = await request.formData();
    const itemId = data.get('itemId') as string;

    if (!itemId) {
      return fail(400, { message: 'Item ID is required' });
    }

    try {
      await savePluggyItem(locals.user!.id, itemId);
      return { success: true };
    } catch (error) {
      console.error('Error saving pluggy item:', error);
      return fail(500, { message: 'Failed to save item' });
    }
  }
};
