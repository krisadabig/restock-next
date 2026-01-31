import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { createInterface } from 'readline';
import { success, error, GREEN, RESET, CYAN } from './utils';

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

async function implementRetrospective() {
	console.log(`\n🧠 ${CYAN}IMPLEMENT RETROSPECTIVE${RESET} 🧠\n`);
	console.log('Operationalizing lessons learned into permanent system improvements.\n');

	if (!existsSync('.agent/retrospective.md')) {
		error('No retrospective found at .agent/retrospective.md');
		process.exit(1);
	}

	const content = readFileSync('.agent/retrospective.md', 'utf-8');

	// Parse all sessions
	const sessions = content.split(/^## /m).slice(1); // Split by h2 ##
	if (sessions.length === 0) {
		error('No sessions found in retrospective.');
		process.exit(1);
	}

	console.log(`${CYAN}Available Sessions:${RESET}`);
	const headers = sessions.map((s) => s.split('\n')[0].trim());
	headers.forEach((h, i) => console.log(`${i + 1}. ${h}`));

	const sessionInput = await ask(`\nSelect session (default 1): `);
	const sessionIndex = sessionInput ? parseInt(sessionInput) - 1 : 0;

	if (isNaN(sessionIndex) || sessionIndex < 0 || sessionIndex >= sessions.length) {
		error('Invalid session selection.');
		process.exit(1);
	}

	const selectedSession = sessions[sessionIndex];
	const lines = selectedSession.split('\n');
	const header = lines[0].trim();

	console.log(`\n${GREEN}Processing Session:${RESET} ${header}`);

	// Extract Lessons and Action Items
	const lessons: string[] = [];
	let section = '';

	lines.forEach((line) => {
		if (line.startsWith('### ')) {
			section = line;
		} else if (line.trim().startsWith('- ')) {
			if (section.includes('Lessons Learned')) {
				lessons.push(`[Lesson] ${line.trim().substring(2)}`);
			} else if (section.includes('Preventive Measures') || section.includes('Action Items')) {
				lessons.push(`[Action] ${line.trim().substring(2)}`);
			}
		}
	});

	if (lessons.length === 0) {
		console.log('No specific lessons or actions found to implement.');
		process.exit(0);
	}

	console.log('\nSelect an item to operationalize:');
	lessons.forEach((l, i) => console.log(`${i + 1}. ${l}`));

	const selection = await ask('\nEnter number(s) separated by comma (e.g. 1,3) or press enter to skip: ');
	if (!selection) {
		console.log('Exiting.');
		process.exit(0);
	}

	const indices = selection
		.split(',')
		.map((s) => parseInt(s.trim()) - 1)
		.filter((i) => !isNaN(i) && i >= 0 && i < lessons.length);

	if (indices.length === 0) {
		error('No valid selections made.');
		process.exit(1);
	}

	for (const index of indices) {
		const item = lessons[index];
		console.log(`\n----------------------------------------`);
		console.log(`Processing Item ${index + 1}: ${CYAN}${item}${RESET}`);

		console.log('\nHow should this be implemented?');
		console.log('1. create-rule (New global rule file)');
		console.log('2. update-skill (Add to existing skill)');
		console.log('3. update-checklist (Add to code-review-checklist)');
		console.log('4. Skip this item');

		const type = await ask('Select type (1-4): ');

		if (type === '1') {
			const name = await ask('Rule Name (kebab-case, e.g. no-console-log): ');
			const desc = await ask('Rule Description/Content: ');
			const path = `.agent/rules/${name}.md`;
			writeFileSync(path, `# ${name}\n\n${desc}\n`);
			success(`Created new rule: ${path}`);
		} else if (type === '2') {
			// List skills
			const skills = readdirSync('.agent/skills').filter((f: string) => !f.startsWith('.'));
			console.log('\nAvailable Skills:');
			skills.forEach((s: string, i: number) => console.log(`${i + 1}. ${s}`));
			const skillIdx = await ask('Select skill to update: ');
			const skill = skills[parseInt(skillIdx) - 1];

			if (skill) {
				const text = await ask('Text to append: ');
				const path = `.agent/skills/${skill}/SKILL.md`;
				const current = readFileSync(path, 'utf-8');
				writeFileSync(path, current + `\n\n### New Guideline\n${text}`);
				success(`Updated skill: ${skill}`);
			}
		} else if (type === '3') {
			const text = await ask('Checklist Item: ');
			const path = '.agent/skills/code-review-checklist/SKILL.md';
			if (!existsSync(path)) {
				error('Checklist skill not found.');
			} else {
				const current = readFileSync(path, 'utf-8');
				// Try to find checklist section or just append
				writeFileSync(path, current + `\n- [ ] ${text}`);
				success('Added to Code Review Checklist.');
			}
		} else {
			console.log('Skipped.');
		}
	}

	console.log(`\n${GREEN}✨ DONE. Verification: Check the file created/updated. ✨${RESET}\n`);
}

implementRetrospective();
