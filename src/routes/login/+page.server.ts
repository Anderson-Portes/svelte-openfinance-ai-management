import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { users } from '$lib/server/db/schema/users';
import { lucia } from '$lib/server/auth';

export const actions = {
  default: async ({ request, cookies }: RequestEvent) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: 'E-mail e senha são obrigatórios' });
    }

    // 1. Buscar usuário
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return fail(400, { error: 'E-mail ou senha incorretos' });
    }

    // 2. Validar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return fail(400, { error: 'E-mail ou senha incorretos' });
    }
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    throw redirect(303, '/');
  }
} satisfies Actions;
