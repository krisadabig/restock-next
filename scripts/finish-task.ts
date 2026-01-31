import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { log, success, error, warn, GREEN, RESET, run, YELLOW, CYAN } from './utils';

// Helper for interactive prompts
const ask = (question: string): Promise<string> => {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
};

function parseArgs() {
	const args = process.argv.slice(2);
	const verifyOnly = args.includes('--verify-only');
	const autoCommitIndex = args.indexOf('--auto-commit');
	const autoCommitMsg = autoCommitIndex !== -1 ? args[autoCommitIndex + 1] : null;

	return { verifyOnly, autoCommitMsg };
}

async function finishTask() {
	const { verifyOnly, autoCommitMsg } = parseArgs();
	console.log(`\n🏁 FINISHING TASK... 🏁\n`);

	// 1. Run Verification Gate
	try {
		run('bun scripts/verify-task.ts', 'Governance Verification');
	} catch {
		error('Verification failed. You cannot finish the task yet. Fix the errors above.');
		process.exit(1);
	}

	// 2. Check Documentation Status
	log('Checking Documentation Status...');
	try {
		const statusOutput = execSync('git status --porcelain').toString().trim();
		const docsUpdated = statusOutput.includes('.agent/manifest.md') || statusOutput.includes('.agent/task.md');
		const retroUpdated = statusOutput.includes('.agent/retrospective.md');

		if (!docsUpdated) {
			error('Governance Check Failed: `.agent/manifest.md` or `.agent/task.md` NOT modified.');
			console.log('You must update the Session Handoff before finishing.');
			console.log(`\n👉 Run the ${GREEN}/handoff${RESET} workflow to fix this.\n`);
			process.exit(1);
		}

		// Check Retrospective content
		if (!retroUpdated) {
			error('Governance Check Failed: `.agent/retrospective.md` NOT modified.');
			console.log('You must log a retrospective before finishing.');
			process.exit(1);
		}

		// Read retrospective for Preventive Measures
		const retroContent = readFileSync('.agent/retrospective.md', 'utf-8');
		if (!retroContent.includes('## Preventive Measures') && !retroContent.includes('## Prevention')) {
			error('Governance Check Failed: `.agent/retrospective.md` missing "Preventive Measures" section.');
			process.exit(1);
		}

		// 3. Spec Check (SDD)
		const specUpdated = statusOutput.includes('.agent/spec.md');
		const logicChanged = statusOutput
			.split('\n')
			.some((line) => line.includes('src/') && (line.endsWith('.ts') || line.endsWith('.tsx')));

		if (logicChanged && !specUpdated) {
			warn('Governance Warning: Logic changes detected but `.agent/spec.md` NOT updated.');
			console.log('SDD requires keeping the spec in sync with implementation.');
		}

		success('Documentation & Verification checks passed.');

		// 4. Smart Verification Reminders
		console.log(`\n🧠 ${CYAN}SMART VERIFICATION REMINDERS${RESET} 🧠`);
		const changedFiles = statusOutput.split('\n').map((l) => l.substring(3)); // remove status code
		let warnings = 0;

		if (changedFiles.some((f) => f.startsWith('src/components'))) {
			console.log(
				`${YELLOW}⚠  UI Changes Detected:${RESET} Did you check mobile responsiveness and Theme Toggle?`,
			);
			warnings++;
		}
		if (changedFiles.some((f) => f.startsWith('src/db') || f.includes('schema.ts'))) {
			console.log(
				`${YELLOW}⚠  DB Changes Detected:${RESET} Did you run migrations (db:push) and verify data integrity?`,
			);
			warnings++;
		}
		if (changedFiles.some((f) => f.startsWith('src/app/api'))) {
			console.log(
				`${YELLOW}⚠  API Changes Detected:${RESET} Did you check error handling and auth interceptors?`,
			);
			warnings++;
		}
		if (changedFiles.some((f) => f.includes('package.json'))) {
			console.log(`${YELLOW}⚠  Deps Changes Detected:${RESET} Did you run 'bun install' and verify build?`);
			warnings++;
		}

		if (warnings === 0) {
			console.log(`${GREEN}No specific context warnings. Good to go!${RESET}`);
		} else {
			console.log(`\n${YELLOW}Please verify the items above before proceeding.${RESET}`);
		}

		// 4.5 check for untracked files
		if (statusOutput.includes('??')) {
			console.log(`\n${YELLOW}⚠  WARNING: Untracked files detected (??).${RESET}`);
			console.log('These will be added to the commit if you proceed.');
		}

		// Exit early if verify only
		if (verifyOnly) {
			console.log(`\n${GREEN}✨ VERIFICATION SUCCESSFUL (Verify-Only Mode) ✨${RESET}`);
			// Print modified files for Agent context
			console.log('\nModified Files (Ready to Stage):');
			console.log(statusOutput);
			process.exit(0);
		}

		// 5. Git Automation
		console.log(`\n🚀 ${CYAN}GIT AUTOMATION${RESET} 🚀`);

		if (!statusOutput) {
			console.log('No changes to commit.');
			process.exit(0);
		}

		console.log('Modified Files:');
		console.log(statusOutput);

		let commitMsg = autoCommitMsg;

		if (!commitMsg) {
			console.log(
				`\n${YELLOW}⚠  ACTION: The next step will run 'git add .' which stages EVERYTHING above.${RESET}`,
			);
			console.log('Please review the file list above carefully.');

			const proceed = await ask(
				`\nAre you absolutely sure these files are ready to commit? (y/n) [AGENT: DO NOT AUTO-CONFIRM. HALT AND NOTIFY USER] `,
			);
			if (proceed.toLowerCase() !== 'y') {
				console.log('Aborted.');
				process.exit(0);
			}

			commitMsg = await ask(`Enter commit message (Conventional Commits): `);
			if (!commitMsg) {
				error('Commit message required.');
				process.exit(1);
			}
		} else {
			console.log(`${GREEN}Auto-commit enabled with message:${RESET} "${commitMsg}"`);
			// Auto-stage implies we skip the "Are you sure?" prompt, assuming Agent/CI has validated
		}

		run('git add .', 'Staging changes');

		// Validate conventional commit (basic check)
		if (!/^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/.test(commitMsg)) {
			warn('Message does not look like Conventional Commits (type(scope): output). Proceeding anyway...');
		}

		try {
			execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
			success('Changes committed.');
		} catch {
			error('Commit failed.');
			process.exit(1);
		}

		const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
		if (branchName === 'main' || branchName === 'develop') {
			warn(`You are on ${branchName}. Skipping auto-push. Use 'release.ts' for releases.`);
		} else {
			const shouldPush = autoCommitMsg ? 'y' : await ask(`Push to origin/${branchName}? (y/n) `);
			if (shouldPush.toLowerCase() === 'y') {
				try {
					execSync(`git push origin ${branchName}`, { stdio: 'inherit' });
					success(`Pushed to ${branchName}`);
					console.log(
						`\n🔗 Create PR: https://github.com/bigbigbig/restock-next/compare/${branchName}?expand=1`,
					);
				} catch {
					error('Push failed.');
				}
			}
		}

		console.log(`\n${GREEN}✨ TASK FINISHED SUCCESSFULLY ✨${RESET}\n`);
	} catch {
		error('Unexpected error during finish-task.');
	}
}

finishTask();
