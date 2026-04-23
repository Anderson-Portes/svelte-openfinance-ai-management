import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // O hooks.server.ts já garante que se chegamos aqui, o user existe
  return {
    user: locals.user
  };
};
