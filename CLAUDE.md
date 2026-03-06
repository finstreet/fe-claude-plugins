# Project Guidelines

## Skill Evaluations

### Running Form Skill Evals

When running evaluations for skills (e.g. the form skill), tell the agent to write files under `outputs/` using the same directory structure specified in the eval prompt. For example, if the prompt says `src/features/referenceAccount`, the agent should write to:

```
<workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/src/features/referenceAccount/
```

This ensures the skill's directory-handling behavior is tested while keeping outputs contained in the workspace.

### No Baseline Runs

Skills in this project use custom libraries (e.g. `@finstreet/forms`, `@finstreet/ui`) that Claude doesn't know about without the skill. Running without-skill baselines is not meaningful — skip them.

### No Eval Viewer

DO NOT run the eval viewer after you are done with your evaluations. I just want you to show me a table in the console with the results of the evaluation. That's enough for me.