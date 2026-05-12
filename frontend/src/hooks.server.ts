import { createServerClient } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

/**
 * Server hook to handle authentication and route protection
 * Ensures protected routes require authentication and email verification
 */
export const handle: Handle = async ({ event, resolve }) => {
	const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
	const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';

	// Create Supabase client
	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => event.request.headers.getSetCookie(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { path: '/', ...options });
				});
			}
		}
	});

	/**
	 * Refresh session if needed
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	/**
	 * Get authenticated user profile
	 */
	event.locals.getUser = async () => {
		const session = await event.locals.getSession();

		if (!session?.user) {
			return null;
		}

		const { data: userProfile, error } = await event.locals.supabase
			.from('users')
			.select('id, email, username, email_verified, created_at, updated_at, settings')
			.eq('id', session.user.id)
			.single();

		if (error) {
			console.error('Error fetching user profile:', error);
			return null;
		}

		return {
			...userProfile,
			emailVerified: userProfile.email_verified,
			createdAt: new Date(userProfile.created_at),
			updatedAt: new Date(userProfile.updated_at)
		};
	};

	// Define protected routes
	const protectedRoutes = ['/dashboard', '/scrapboard', '/api/scrapboards', '/api/notes', '/api/images', '/api/lines'];

	// Define email verification required routes
	const emailVerificationRequiredRoutes = ['/dashboard', '/scrapboard', '/api/scrapboards'];

	const url = new URL(event.request.url);
	const pathname = url.pathname;

	// Check if route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	if (isProtectedRoute) {
		const session = await event.locals.getSession();

		if (!session) {
			// Not authenticated - redirect to login
			throw redirect(303, `/auth/login?redirect=${encodeURIComponent(pathname)}`);
		}

		// Check if email verification is required for this route
		const isEmailVerificationRequired = emailVerificationRequiredRoutes.some((route) =>
			pathname.startsWith(route)
		);

		if (isEmailVerificationRequired) {
			const user = await event.locals.getUser();

			if (user && !user.emailVerified) {
				// Email not verified - redirect to verification page
				throw redirect(303, `/auth/verify?email=${encodeURIComponent(user.email)}`);
			}
		}
	}

	// Set public locals for client to use
	event.locals.session = await event.locals.getSession();

	return resolve(event);
};
