import { PluggyClient } from 'pluggy-sdk';
import { PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { pluggyItems } from '$lib/server/db/schema/pluggyItems';
import { eq } from 'drizzle-orm';
import type { Account, Transaction } from 'pluggy-sdk';

const client = new PluggyClient({
  clientId: PLUGGY_CLIENT_ID,
  clientSecret: PLUGGY_CLIENT_SECRET,
});

export type AccountWithTransactions = Account & { transactions: Transaction[] };

export async function createConnectToken() {
  return await client.createConnectToken();
}

export async function savePluggyItem(userId: string, itemId: string) {
  return await db.insert(pluggyItems).values({
    userId,
    pluggyItemId: itemId,
  });
}

export async function fetchUserAccounts(userId: string): Promise<AccountWithTransactions[]> {
  try {
    const items = await db.select().from(pluggyItems).where(eq(pluggyItems.userId, userId));
    
    if (items.length === 0) return [];

    // Busca contas para cada item conectado
    const itemAccounts = await Promise.all(
      items.map(async (item) => {
        return await client.fetchAccounts(item.pluggyItemId);
      })
    );

    const accounts = itemAccounts.flatMap((item) => item.results);

    // Busca transações para cada conta (Pode ser lento se houver muitas contas)
    const accountsWithTransactions = await Promise.all(
      accounts.map(async (account) => {
        try {
          const { results: transactions } = await client.fetchTransactions(account.id);
          return {
            ...account,
            transactions
          };
        } catch (err) {
          console.error(`Erro ao buscar transações para conta ${account.id}:`, err);
          return {
            ...account,
            transactions: []
          };
        }
      })
    );

    return accountsWithTransactions;
  } catch (err) {
    console.error('Erro na integração com Pluggy:', err);
    throw err;
  }
}
