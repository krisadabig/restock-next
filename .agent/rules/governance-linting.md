# governance-linting

All scripts in the `scripts/` directory must be valid TypeScript and pass `eslint`. These scripts are critical governance gates (verify-task, finish-task) and must be as robust as production code. Do not use `any` types or ignore linter rules.
