import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { log, success, error, run } from './utils';

const type = process.argv[2]; // major | minor | patch

if (!['major', 'minor', 'patch'].includes(type)) {
	error('Please provide a release type: bun scripts/release.ts <major|minor|patch>');
	process.exit(1);
}

async function release() {
	console.log(`\n🚀 STARTING RELEASE [${type.toUpperCase()}] 🚀\n`);

	// 1. Pre-checks
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

	// 2. Bump Version
	log('Bumping version...');
	// Use npm version to bump package.json and create git tag?
	// We want to control tagging logic carefully.
	// Let's just update package.json manually or via npm version --no-git-tag-version
	run(`npm version ${type} --no-git-tag-version`, 'Bump Version');

	const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
	const newVersion = pkg.version;
	success(`Version bumped to ${newVersion}`);

	// Commit bump on develop
	run('git add package.json bun.lock', 'Stage Version Bump');
	run(`git commit -m "chore(release): bump version to ${newVersion}"`, 'Commit Version Bump');

	// 3. Merge to Main
	log('Merging to main...');
	run('git checkout main', 'Checkout Main');
	run('git pull origin main', 'Pull Main');
	run('git merge develop', 'Merge Develop'); // Fast-forward usually

	// 4. Tag
	log('Tagging...');
	run(`git tag -a v${newVersion} -m "Release v${newVersion}"`, 'Git Tag');

	// 5. Push
	log('Pushing...');
	run('git push origin main', 'Push Main');
	run('git push origin v' + newVersion, 'Push Tag');

	// 6. Back to develop
	run('git checkout develop', 'Checkout Develop');
	run('git push origin develop', 'Push Develop');

	success(`\n✨ RELEASE v${newVersion} COMPLETE! ✨`);
	console.log('Vercel deployment should be triggered automatically.');
}

release();
