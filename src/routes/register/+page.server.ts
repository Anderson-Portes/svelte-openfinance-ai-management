import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { users } from '$lib/server/db/schema/users';

export const actions = {
  default: async ({ request }: RequestEvent) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!name || !email || !password) {
      return fail(400, { error: 'Todos os campos são obrigatórios' });
    }

    // 1. Verificar se o e-mail já existe
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return fail(400, { error: 'Este e-mail já está em uso' });
    }

    // 2. Hash da senha (segurança)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Salvar no banco
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword
    });

    throw redirect(303, '/login');
  }
} satisfies Actions;
