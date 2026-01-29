import { execSync } from 'child_process';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { log, success, error, warn, GREEN, RESET } from './utils';

const taskName = process.argv[2];

if (!taskName) {
	error('Please provide a task name. Usage: bun scripts/start-task.ts "Task Name"');
}

async function startTask() {
	console.log(`\n🚀 STARTING TASK: "${taskName}" 🚀\n`);

	// 1. Branch Creation
	const slug = taskName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	const branchName = `feature/${slug}`;

	try {
		log(`Checking branch ${branchName}...`);
		// Check if branch exists
		try {
			execSync(`git rev-parse --verify ${branchName}`, { stdio: 'ignore' });
			log(`Branch ${branchName} exists. Checking out...`);
			execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
		} catch {
			log(`Creating new branch ${branchName}...`);
			execSync(`git checkout -b ${branchName} main`, { stdio: 'inherit' });
		}
		success(`On branch ${branchName}`);
	} catch (e) {
		error(`Failed to checkout branch: ${e}`);
	}

	// 1.5 Skill Discovery (MANDATORY)
	console.log(`\n🔎 SKILL DISCOVERY 🔎`);
	const skillsDir = '.agent/skills';
	if (existsSync(skillsDir)) {
		const skills = readdirSync(skillsDir).filter((f) => !f.startsWith('.'));
		console.log('Available Skills:');
		skills.forEach((skill) => console.log(` - ${skill}`));

		console.log(`\n${warn('ACTION REQUIRED')}: Review the list above.`);
		console.log(`Identify relevant skills and run: ${GREEN}view_file .agent/skills/<skill>/SKILL.md${RESET}`);
		console.log(`(e.g., if doing UI, check 'frontend-design' and 'tailwind-design-system')\n`);
	} else {
		warn('No skills directory found at .agent/skills');
	}

	// 2. Implementation Plan Artifact
	const planDir = '.agent/plans';
	const planFile = join(planDir, `${slug}.md`);

	if (!existsSync(planDir)) {
		execSync(`mkdir -p ${planDir}`);
	}

	if (!existsSync(planFile)) {
		log(`Creating Implementation Plan template at ${planFile}...`);
		const template = `# Implementation Plan: ${taskName}

## Goal
Description of ${taskName}.

## Proposed Changes
- [ ] Change X
- [ ] Change Y

## Verification
- [ ] Test Z
`;
		writeFileSync(planFile, template);
		success(`Created Plan: ${planFile}`);
	} else {
		warn(`Plan already exists at ${planFile}`);
	}

	console.log(`\n${GREEN}✨ TASK STARTED! Go forth and code. ✨${RESET}\n`);
	console.log(`Next Steps:`);
	console.log(`1. Fill out ${planFile}`);
	console.log(`2. Update .agent/task.md`);
}

startTask();
