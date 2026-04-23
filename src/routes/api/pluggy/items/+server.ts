import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { pluggyItems } from '$lib/server/db/schema/pluggyItems';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return json({ error: 'Item ID é obrigatório' }, { status: 400 });
    }

    await db.insert(pluggyItems).values({
      userId: locals.user.id,
      pluggyItemId: itemId,
    });

    return json({ success: true, message: 'Item salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar item do Pluggy:', error);
    return json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
};
