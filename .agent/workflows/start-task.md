---
description: Start a new task with automated setup and skill discovery.
---

# Start Task Workflow

Follow these steps to start a new task.

1. **Understand the Goal**: detailedly read the user request.
2. **Determine Task Name**: If the user didn't provide a specific name, Propose a short, descriptive name (e.g., "Refactor Auth", "Fix Login Bug").
3. **Execute Start Script**:
   ```bash
   # // turbo
   bun scripts/start-task.ts "<Task Name>"
   ```
4. **Skill Discovery (MANDATORY)**:
   - Run `ls -F .agent/skills` to see available skills.
   - **Critically Analyze**: Based on the user's request and the task goal, identify which skills are RELEVANT.
   - **Activate Skills**: For EACH relevant skill, you MUST run `view_file .agent/skills/<skill-name>/SKILL.md`.
   - *Example*: If the task involves UI, view `frontend-design` and `tailwind-design-system`. If it's a new API, view `elysiajs-expert`.
   - **Apply Knowledge**: strictly follow the instructions in the opened `SKILL.md` files throughout the testing and coding process.

5. **Proceed to Planning**: Now that the branch is created and skills are loaded, begin your `implementation_plan.md` as instructed by `start-task.ts`.
