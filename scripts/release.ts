import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import { log, success, error, warn, run } from './utils';

const type = process.argv[2]; // major | minor | patch

if (!['major', 'minor', 'patch'].includes(type)) {
	error('Please provide a release type: bun scripts/release.ts <major|minor|patch>');
	process.exit(1);
}

// Load .env only — intentionally skip .env.local (points to localhost postgres)
dotenv.config({ path: '.env' });

// ── Pre-flight checks ────────────────────────────────────────────────────────

async function checkEnvVar(name: string): Promise<string> {
	const val = process.env[name];
	if (!val) {
		error(`Missing env var: ${name}  (check .env)`);
		process.exit(1);
	}
	return val;
}

async function pingService(name: string, url: string, headers: Record<string, string>) {
	try {
		const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
		if (!res.ok) {
			error(`${name} check failed: HTTP ${res.status} — verify your token in .env`);
			process.exit(1);
		}
		success(`${name} reachable`);
	} catch (e) {
		error(`${name} check failed: ${(e as Error).message}`);
		process.exit(1);
	}
}

async function preflight() {
	log('Running pre-flight checks...');

	const dbUrl      = await checkEnvVar('DATABASE_URL');
	const sentryDsn  = await checkEnvVar('NEXT_PUBLIC_SENTRY_DSN');
	const sentryToken = await checkEnvVar('SENTRY_AUTH_TOKEN');
	const axiomToken  = await checkEnvVar('NEXT_AXIOM_TOKEN');
	const axiomDataset = await checkEnvVar('NEXT_AXIOM_DATASET');

	// Guard against accidentally deploying with local DB
	if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
		error('DATABASE_URL points to localhost — set the Supabase URL in .env before releasing');
		process.exit(1);
	}

	// Guard against placeholder DSN
	if (sentryDsn.includes('xxx')) {
		error('NEXT_PUBLIC_SENTRY_DSN looks like a placeholder — set the real DSN in .env');
		process.exit(1);
	}

	// Ping Sentry API
	await pingService('Sentry', 'https://sentry.io/api/0/', {
		Authorization: `Bearer ${sentryToken}`,
	});

	// Ping Axiom — verify token and dataset exists
	const axiomRes = await fetch('https://api.axiom.co/v1/datasets', {
		headers: { Authorization: `Bearer ${axiomToken}` },
		signal: AbortSignal.timeout(8000),
	});
	if (!axiomRes.ok) {
		error(`Axiom token invalid: HTTP ${axiomRes.status} — check NEXT_AXIOM_TOKEN in .env`);
		process.exit(1);
	}
	const datasets = await axiomRes.json() as Array<{ name: string }>;
	if (!datasets.some(d => d.name === axiomDataset)) {
		error(`Axiom dataset "${axiomDataset}" not found — check NEXT_AXIOM_DATASET in .env`);
		process.exit(1);
	}
	success(`Axiom dataset "${axiomDataset}" verified`);

	success('Pre-flight passed');
}

// ── Release ──────────────────────────────────────────────────────────────────

async function release() {
	console.log(`\n🚀 STARTING RELEASE [${type.toUpperCase()}] 🚀\n`);

	// 1. Pre-flight
	await preflight();

	// 2. Git pre-checks
	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
		if (branch !== 'develop') {
			error(`You must be on 'develop' branch to release. Current: ${branch}`);
			process.exit(1);
		}
		const status = execSync('git status --porcelain').toString().trim();
		if (status) {
			error('Working directory is not clean. Commit or stash changes first.');
			process.exit(1);
		}
	} catch {
		error('Failed git checks.');
		process.exit(1);
	}

	// 3. Bump version
	log('Bumping version...');
	run(`npm version ${type} --no-git-tag-version`, 'Bump Version');
	const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
	const newVersion = pkg.version;
	success(`Version bumped to ${newVersion}`);

	run('git add package.json', 'Stage Version Bump');
	run(`git commit -m "chore(release): bump version to ${newVersion}"`, 'Commit Version Bump');

	// 4. Merge to main
	run('git checkout main', 'Checkout Main');
	run('git pull origin main', 'Pull Main');
	run('git merge develop', 'Merge Develop');

	// 5. Run prod migration BEFORE pushing — old code tolerates new schema (additive migrations)
	//    If your migration drops columns or renames tables, stop here and coordinate manually.
	log('Running prod DB migration...');
	run('bun run db:migrate:prod', 'Prod Migration');

	// 6. Tag + push — Vercel auto-deploys on push to main
	run(`git tag -a v${newVersion} -m "Release v${newVersion}"`, 'Git Tag');
	run('git push origin main', 'Push Main');
	run(`git push origin v${newVersion}`, 'Push Tag');

	// 7. Back to develop
	run('git checkout develop', 'Checkout Develop');
	run('git push origin develop', 'Push Develop');

	success(`\n✨ RELEASE v${newVersion} COMPLETE! ✨`);
	console.log('Vercel deployment is now building from main.');
	warn('If this release drops columns/renames tables, verify the deploy before cutting traffic.');
}

release();
