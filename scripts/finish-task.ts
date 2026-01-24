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

	// 2. Check Documentation and Git Status
	log('Checking Documentation & Git Status...');
	try {
		const changes = execSync('git status --porcelain').toString().trim();
		const docsUpdated = changes.includes('.agent/manifest.md') || changes.includes('.agent/task.md');
		const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

		if (!docsUpdated) {
			warn('It looks like `.agent/manifest.md` or `.agent/task.md` have NOT been modified in the working tree.');
			console.log('   Did you remember to update the Status and Handoff?');
		} else {
			success('Documentation updates detected.');
		}

		console.log(`\n${GREEN}✨ PRE-FLIGHT CHECKS PASSED ✨${RESET}\n`);

		if (changes) {
			console.log('Modified Files:');
			console.log(
				changes
					.split('\n')
					.map((line) => `   ${line}`)
					.join('\n'),
			);
			console.log('\nTo complete the handoff:');
			console.log(`1. Review the changes above.`);
			console.log(`2. Run:  git add <file>   (or "git add -A" if you are sure)`);
			console.log(`3. Run:  git commit -m "feat: [Your Task Description]"`);
			if (branchName !== 'main') {
				console.log(`4. Run:  git push origin ${branchName}`);
				console.log(`5. Create PR`);
			}
		} else {
			console.log('No changes detected in working directory (everything committed?)');
		}
	} catch {
		warn('Could not check git status.');
	}
}

finishTask();
