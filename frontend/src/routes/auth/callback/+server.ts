import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const getProfileClient = () => {
	const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
	const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		return null;
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error_description') ?? url.searchParams.get('error');

	if (error) {
		throw redirect(303, `/auth/verify?error=${encodeURIComponent(error)}`);
	}

	if (!code) {
		throw redirect(303, '/auth/login');
	}

	const { data, error: exchangeError } = await locals.supabase.auth.exchangeCodeForSession(code);

	if (exchangeError || !data.user) {
		throw redirect(
			303,
			`/auth/verify?error=${encodeURIComponent(exchangeError?.message ?? 'Could not verify email link')}`
		);
	}

	const profileClient = getProfileClient() ?? locals.supabase;
	const username =
		data.user.user_metadata?.username ?? data.user.email?.split('@')[0] ?? 'new-user';

	await profileClient.from('users').upsert({
		id: data.user.id,
		email: data.user.email,
		username,
		password_hash: '',
		email_verified: true,
		email_verification_token: null,
		reset_password_token: null,
		updated_at: new Date().toISOString(),
		settings: {},
	});

	throw redirect(303, '/dashboard');
};
