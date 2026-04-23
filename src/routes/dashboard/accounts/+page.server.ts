import { fetchUserAccounts } from '$lib/server/pluggy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    streamed: {
      accounts: fetchUserAccounts(locals.user!.id)
    }
  };
};
