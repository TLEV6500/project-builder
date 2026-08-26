# Research Notes: GitHub CLI Automation

## Findings
- **Repo Creation**: Use `gh repo create <name> --public/--private --source=. --push` to create a remote repo from a local directory and push initial content.
- **Git Operations**: `gh` does not have `gh commit` or `gh push`. Standard `git add`, `git commit`, and `git push` must be used.
- **Workflow**:
  1. `git init`
  2. `git add .`
  3. `git commit -m "initial commit"`
  4. `gh repo create <name> --public --source=. --push`

## Sources
- GitHub CLI Manual (`gh repo create`)
- GitHub CLI Discussions

