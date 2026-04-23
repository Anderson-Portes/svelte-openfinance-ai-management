import { json } from '@sveltejs/kit';
import { PluggyClient } from 'pluggy-sdk';
import { PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET } from '$env/static/private';

const client = new PluggyClient({
  clientId: PLUGGY_CLIENT_ID,
  clientSecret: PLUGGY_CLIENT_SECRET,
});

export const GET = async () => {
  try {
    const data = await client.createConnectToken();
    return json(data);
  } catch (err: any) {
    console.error('ERRO NA PLUGGY:', err.response?.data || err.message);

    return json({
      error: 'Falha ao gerar token',
      details: err.response?.data || err.message
    }, { status: 500 });
  }
};
