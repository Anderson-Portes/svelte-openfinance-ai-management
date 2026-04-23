import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { sessions } from "./db/schema/sessions";
import { users } from "./db/schema/users";
import { dev } from "$app/environment";


const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev // Cookie seguro apenas em produção
    }
  },
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      email: attributes.email
    };
  }
});

// Tipagem para o TypeScript
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      name: string;
      email: string;
    };
  }
}
