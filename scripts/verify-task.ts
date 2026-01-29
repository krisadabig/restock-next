import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(msg: string) {
	// Use console.log directly to avoid color issues if any
	console.log(`${CYAN}➜ ${msg}${RESET}`);
}

function success(msg: string) {
	console.log(`${GREEN}✔ ${msg}${RESET}`);
}

function error(msg: string) {
	console.error(`${RED}✘ ${msg}${RESET}`);
	process.exit(1);
}

function run(cmd: string, stepName: string) {
	try {
		log(`Running ${stepName}...`);
		// stdio: inherit allows checking output colors and progress
		execSync(cmd, { stdio: 'inherit' });
		success(`${stepName} Passed`);
	} catch {
		error(`${stepName} Failed`);
	}
}

async function verify() {
	console.log('\n🛡️  STARTING GOVERNANCE VERIFICATION  🛡️\n');

	// 1. Git Branch Check
	const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
	if (branch === 'main' || branch === 'master') {
		console.warn(`${RED}⚠️  WARNING: You are verifying on '${branch}'. Ideally, use a feature branch.${RESET}`);
	} else {
		success(`On feature branch: ${branch}`);
	}

	// 2. Lint & Format
	run('bun run lint', 'Linter');

	// 3. Build (Type Check)
	run('bun run build', 'Production Build (Type Check)');

	// 4. Unit Tests
	if (existsSync('bun.lock')) {
		// Use --run to ensure it doesn't watch
		run('bun run test:unit --run', 'Unit Tests');
	}

	// 5. Smoke Tests (E2E)
	if (existsSync('playwright.config.ts')) {
		run('bun run smoke --reporter=list', 'Smoke Tests (E2E)');
	}

	console.log(`\n${GREEN}✨ VERIFICATION PASSED. You may mark the task as COMPLETED. ✨${RESET}\n`);
}

verify();
