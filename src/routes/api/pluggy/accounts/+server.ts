import { json } from '@sveltejs/kit';
import { PluggyClient } from 'pluggy-sdk';
import { PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { pluggyItems } from '$lib/server/db/schema/pluggyItems';
import { eq } from 'drizzle-orm';

const client = new PluggyClient({
  clientId: PLUGGY_CLIENT_ID,
  clientSecret: PLUGGY_CLIENT_SECRET,
});

export const GET = async ({ locals }) => {
  try {
    if (!locals.user) {
      return json({ error: 'Não autorizado' }, { status: 401 });
    }
    const items = await db.select().from(pluggyItems).where(eq(pluggyItems.userId, locals.user.id));
    const itemAccounts = await Promise.all(
      items.map(async (item) => {
        return await client.fetchAccounts(item.pluggyItemId);
      })
    );
    const accounts = itemAccounts.flatMap((item) => item.results);
    const accountsWithTransactions = await Promise.all(
      accounts.map(async (account) => {
        const { results: transactions } = await client.fetchTransactions(account.id)
        return {
          ...account,
          transactions
        }
      })
    );

    return json(accountsWithTransactions);
  } catch (err: any) {
    console.error('ERRO NA PLUGGY:', err.response?.data || err.message);

    return json({
      error: 'Falha ao gerar token',
      details: err.response?.data || err.message
    }, { status: 500 });
  }
};
