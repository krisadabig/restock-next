import { execSync } from 'child_process';
import { log, success, error, warn, GREEN, RESET, run } from './utils';

async function finishTask() {
	console.log(`\n🏁 FINISHING TASK... 🏁\n`);

	// 1. Run Verification Gate
	// This is the hard blocker.
	try {
		// Assuming verify-task.ts is executable via bun
		// We import it? No, it's a script. We exec it.
		run('bun scripts/verify-task.ts', 'Governance Verification');
	} catch {
		error('Verification failed. You cannot finish the task yet. Fix the errors above.');
	}

	// 2. Check Documentation
	log('Checking Documentation Compliance...');
	try {
		const status = execSync('git status --porcelain').toString();
		const docsUpdated = status.includes('.agent/manifest.md') || status.includes('.agent/task.md');
		const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

		if (!docsUpdated) {
			// Check if key docs were modified in recent commits?
			// Too complex. Just warn.
			warn('It looks like `.agent/manifest.md` or `.agent/task.md` have NOT been modified in the working tree.');
			console.log('   Did you remember to update the Status and Handoff?');
		} else {
			success('Documentation updates detected.');
		}

		console.log(`\n${GREEN}✨ PRE-FLIGHT CHECKS PASSED ✨${RESET}\n`);

		console.log('To complete the handoff:');
		console.log(`1. Run:  git add -A`);
		console.log(`2. Run:  git commit -m "feat: [Your Task Description]"`);
		if (branchName !== 'main') {
			console.log(`3. Run:  git push origin ${branchName}`);
			console.log(`4. Create PR`);
		}
	} catch {
		warn('Could not check git status.');
	}
}

finishTask();
