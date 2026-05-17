// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { User } from '$lib/schemas';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			session: Session | null;
			getSession: () => Promise<Session | null>;
			getUser: () => Promise<User | null>;
		}
		interface PageData {
			user?: User | null;
			session?: Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
