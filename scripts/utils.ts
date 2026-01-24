import { execSync } from 'child_process';

// Colors
export const GREEN = '\x1b[32m';
export const RED = '\x1b[31m';
export const CYAN = '\x1b[36m';
export const YELLOW = '\x1b[33m';
export const RESET = '\x1b[0m';

export function log(msg: string) {
	console.log(`${CYAN}➜ ${msg}${RESET}`);
}

export function success(msg: string) {
	console.log(`${GREEN}✔ ${msg}${RESET}`);
}

export function error(msg: string) {
	console.error(`${RED}✘ ${msg}${RESET}`);
	process.exit(1);
}

export function warn(msg: string) {
	console.warn(`${YELLOW}⚠️  ${msg}${RESET}`);
}

export function run(cmd: string, stepName: string, ignoreError = false) {
	try {
		log(`Running ${stepName}...`);
		execSync(cmd, { stdio: 'inherit' });
		success(`${stepName} Passed`);
	} catch {
		if (ignoreError) {
			warn(`${stepName} Failed (Ignored)`);
		} else {
			error(`${stepName} Failed`);
		}
	}
}
