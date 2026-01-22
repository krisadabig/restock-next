'use client';

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export async function registerPasskey(username: string) {
	// 1. Get options from server
	const resp = await fetch(`/api/auth?type=register&username=${username}`);
	const options = await resp.json();

	if (options.error) throw new Error(options.error);

	// 2. Pass options to browser authenticator
	const attResp = await startRegistration(options);

	// 3. Send response back to server
	const verificationResp = await fetch('/api/auth', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			type: 'register',
			username,
			registrationResponse: attResp,
		}),
	});

	const verificationJSON = await verificationResp.json();
	if (verificationJSON && verificationJSON.verified) {
		return true;
	}

	throw new Error('Registration failed');
}

export async function loginPasskey(username?: string, options: { conditional?: boolean } = {}) {
	// 1. Get options from server
	const url = username ? `/api/auth?type=login&username=${username}` : `/api/auth?type=login`;

	const resp = await fetch(url);

	if (resp.status === 404) {
		throw new Error('User not found');
	}

	const authOptions = await resp.json();

	if (authOptions.error) throw new Error(authOptions.error);

	// 2. Pass options to browser
	if (options.conditional) {
		// Force mediation: conditional for autofill
		(authOptions as any).mediation = 'conditional';
	}
	const asseResp = await startAuthentication(authOptions);

	// 3. Verify with server
	const verificationResp = await fetch('/api/auth', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			type: 'login',
			username: username || '',
			authenticationResponse: asseResp,
		}),
	});

	const verificationJSON = await verificationResp.json();
	if (verificationJSON && verificationJSON.verified) {
		return verificationJSON.user;
	}

	throw new Error('Login failed');
}
