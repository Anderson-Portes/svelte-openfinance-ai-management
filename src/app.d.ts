import { Lucia, Session, User } from "lucia";

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}

	// Adicione este bloco aqui:
	interface Window {
		PluggyConnect: any;
	}
}

export { };
