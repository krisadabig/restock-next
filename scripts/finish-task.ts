import { execSync } from 'child_process';
import { readFileSync } from 'fs';
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
			error('Governance Check Failed: `.agent/manifest.md` or `.agent/task.md` NOT modified.');
			console.log('You must update the Session Handoff before finishing.');
			console.log(`\n👉 Run the ${GREEN}/handoff${RESET} workflow to fix this.\n`);
			return; // Stop execution
		} else {
			success('Documentation updates detected.');
		}

		// Check Retrospective content
		const retroUpdated = changes.includes('.agent/retrospective.md');
		if (!retroUpdated) {
			error('Governance Check Failed: `.agent/retrospective.md` NOT modified.');
			console.log('You must log a retrospective before finishing.');
			return;
		}

		// Read retrospective to check for Preventive Measures
		const retroContent = readFileSync('.agent/retrospective.md', 'utf-8');
		if (!retroContent.includes('## Preventive Measures') && !retroContent.includes('## Prevention')) {
			error('Governance Check Failed: `.agent/retrospective.md` missing "Preventive Measures" section.');
			return;
		}
		success('Retrospective and Preventive Measures detected.');

		// 3. Spec Check (SDD)
		const specUpdated = changes.includes('.agent/spec.md');
		const logicChanged = changes
			.split('\n')
			.some((line) => line.includes('src/') && (line.endsWith('.ts') || line.endsWith('.tsx')));

		if (logicChanged && !specUpdated) {
			warn('Governance Warning: Logic changes detected in `src/` but `.agent/spec.md` was NOT updated.');
			console.log(
				'Spec-Driven Development (SDD) requires keeping the specification in sync with implementation.',
			);
			// For now, we warn. We might block later.
		} else if (specUpdated) {
			success('Spec update detected.');
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
			if (branchName !== 'develop') {
				if (branchName === 'main') {
					error('You are on `main`. Requires manual fix. Use `release.ts` to touch `main`.');
				} else {
					console.log(`4. Run:  git push origin ${branchName}`);
					console.log(`5. Create PR into 'develop'`);
				}
			}
		} else {
			console.log('No changes detected in working directory (everything committed?)');
		}
	} catch {
		warn('Could not check git status.');
	}
}

finishTask();
