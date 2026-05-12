import { createServerClient } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const createSupabaseServerClient = ({ request, cookies }: RequestEvent) => {
	const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
	const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => request.headers.getSetCookie(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, { path: '/', ...options });
				});
			}
		}
	});
};

/**
 * Get the current authenticated user session
 */
export const getSession = async (event: RequestEvent) => {
	const supabase = createSupabaseServerClient(event);
	const {
		data: { session }
	} = await supabase.auth.getSession();
	return session;
};

/**
 * Get the current authenticated user with profile data
 */
export const getAuthenticatedUser = async (event: RequestEvent) => {
	const session = await getSession(event);

	if (!session?.user) {
		return null;
	}

	const supabase = createSupabaseServerClient(event);

	// Fetch user profile from database
	const { data: userProfile, error } = await supabase
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

/**
 * Require authentication - redirect to login if not authenticated
 */
export const requireAuth = async (event: RequestEvent) => {
	const session = await getSession(event);

	if (!session) {
		throw redirect(303, '/auth/login');
	}

	return session;
};

/**
 * Require email verification - redirect to verification page if not verified
 */
export const requireEmailVerification = async (event: RequestEvent) => {
	const user = await getAuthenticatedUser(event);

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	if (!user.emailVerified) {
		throw redirect(303, `/auth/verify?email=${encodeURIComponent(user.email)}`);
	}

	return user;
};

/**
 * Redirect to dashboard if already authenticated
 */
export const redirectIfAuthenticated = async (event: RequestEvent) => {
	const session = await getSession(event);

	if (session) {
		throw redirect(303, '/dashboard');
	}
};

/**
 * Sign up a new user
 */
export const signUp = async (
	event: RequestEvent,
	email: string,
	password: string,
	username: string
) => {
	const supabase = createSupabaseServerClient(event);

	// Create auth user
	const { data: authData, error: authError } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${new URL(event.request.url).origin}/auth/callback`
		}
	});

	if (authError) {
		throw new Error(`Sign up error: ${authError.message}`);
	}

	if (!authData.user) {
		throw new Error('Sign up failed: no user returned');
	}

	// Create user profile
	const { error: profileError } = await supabase.from('users').insert({
		id: authData.user.id,
		email,
		username,
		password_hash: '', // Password is managed by Supabase Auth
		email_verified: false,
		email_verification_token: null,
		reset_password_token: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		settings: {}
	});

	if (profileError) {
		console.error('Error creating user profile:', profileError);
		// Still return success since auth user was created
	}

	return authData;
};

/**
 * Sign in with email and password
 */
export const signIn = async (event: RequestEvent, email: string, password: string) => {
	const supabase = createSupabaseServerClient(event);

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		throw new Error(`Sign in error: ${error.message}`);
	}

	return data;
};

/**
 * Sign out the current user
 */
export const signOut = async (event: RequestEvent) => {
	const supabase = createSupabaseServerClient(event);

	const { error } = await supabase.auth.signOut();

	if (error) {
		throw new Error(`Sign out error: ${error.message}`);
	}
};

/**
 * Verify email with token
 */
export const verifyEmail = async (event: RequestEvent, token: string) => {
	const supabase = createSupabaseServerClient(event);

	const { data, error } = await supabase.auth.verifyOtp({
		token_hash: token,
		type: 'email'
	});

	if (error) {
		throw new Error(`Email verification error: ${error.message}`);
	}

	// Update user profile to mark email as verified
	if (data.user) {
		const { error: updateError } = await supabase
			.from('users')
			.update({
				email_verified: true,
				email_verification_token: null,
				updated_at: new Date().toISOString()
			})
			.eq('id', data.user.id);

		if (updateError) {
			console.error('Error updating email verification status:', updateError);
		}
	}

	return data;
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (event: RequestEvent, email: string) => {
	const supabase = createSupabaseServerClient(event);

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${new URL(event.request.url).origin}/auth/reset-password`
	});

	if (error) {
		throw new Error(`Password reset request error: ${error.message}`);
	}
};

/**
 * Update password with reset token
 */
export const updatePasswordWithToken = async (
	event: RequestEvent,
	accessToken: string,
	newPassword: string
) => {
	const supabase = createSupabaseServerClient(event);

	const { error } = await supabase.auth.updateUser(
		{ password: newPassword },
		{ accessToken }
	);

	if (error) {
		throw new Error(`Password update error: ${error.message}`);
	}
};
