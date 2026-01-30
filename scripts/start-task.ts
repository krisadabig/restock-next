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

	// 0. Skill Discovery
	const skillsDir = '.agent/skills';
	if (existsSync(skillsDir)) {
		const skills = readdirSync(skillsDir).filter((f: string) => !f.startsWith('.'));
		console.log(`🔎 SKILL DISCOVERY 🔎`);

		// Smart Recommendations
		const recommendations: string[] = [];
		const lowerName = taskName.toLowerCase();

		const mappings: { keywords: string[]; skill: string }[] = [
			{
				keywords: ['ui', 'design', 'css', 'style', 'layout', 'tailwind', 'component', 'modal', 'card'],
				skill: 'frontend-design',
			},
			{ keywords: ['ui', 'design', 'css', 'style', 'layout', 'tailwind'], skill: 'tailwind-design-system' },
			{ keywords: ['mobile', 'pwa', 'responsive', 'touch'], skill: 'mobile-design' },
			{
				keywords: ['api', 'route', 'server', 'backend', 'fetch', 'next', 'rsc', 'cache'],
				skill: 'next-best-practices',
			},
			{ keywords: ['test', 'verify', 'e2e', 'spec'], skill: 'playwright-skill' },
			{ keywords: ['test', 'verify', 'unit', 'vitest'], skill: 'test-driven-development' },
			{ keywords: ['db', 'database', 'sql', 'drizzle', 'postgres', 'schema'], skill: 'postgres-best-practices' },
			{ keywords: ['review', 'audit', 'debt', 'analysis', 'complex'], skill: 'codebase-analysis' },
			{ keywords: ['pr', 'pull request', 'review'], skill: 'code-review-checklist' },
			{ keywords: ['debug', 'fix', 'error', 'bug'], skill: 'systematic-debugging' },
		];

		mappings.forEach((m) => {
			if (m.keywords.some((k) => lowerName.includes(k))) {
				if (skills.includes(m.skill) && !recommendations.includes(m.skill)) {
					recommendations.push(m.skill);
				}
			}
		});

		if (recommendations.length > 0) {
			console.log(`\n🌟 RECOMMENDED SKILLS for "${taskName}":`);
			recommendations.forEach((skill) => console.log(`   ${GREEN}➜ ${skill}${RESET}`));
			console.log('');
		}

		console.log('All Available Skills:');
		skills.forEach((skill: string) => {
			const isRecommended = recommendations.includes(skill);
			console.log(` - ${skill}${isRecommended ? ` ${GREEN} <-- (Recommended)${RESET}` : ''}`);
		});

		console.log(`\n${warn('ACTION REQUIRED')}: Review the recommendations above.`);
		console.log(`Run: ${GREEN}view_file .agent/skills/<skill>/SKILL.md${RESET} for each relevant skill.`);
	}

	// 0.5 Spec Check (SDD)
	console.log(`📖 SPEC-DRIVEN DEVELOPMENT (SDD) 📖`);
	console.log(`Before coding, YOU MUST review and update: ${GREEN}.agent/spec.md${RESET}`);
	console.log(`Ensure the specification reflects the changes you are about to make.\n`);

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
			execSync(`git checkout -b ${branchName} develop`, { stdio: 'inherit' });
		}
		success(`On branch ${branchName}`);
	} catch (e) {
		error(`Failed to checkout branch: ${e}`);
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
