<!-- ch-3 personal-project report. Copy this file to ch-3/<your-github-username>/report.md -->
<!-- Before you pass: your project repo needs at least 3 GitHub stars (ask teammates
     to open your repo and click ⭐). This proves it is a real, shared project. -->
# ch-3 Personal Project — Report

github_username: mangsuan
personal_repo_url: https://github.com/mangsuan/bwai-stock-research
project_summary: BWAI (Buy With AI) is an AI-powered stock research assistant that helps users quickly understand whether a stock is worth deeper research.
slides_url: slides/pitch.md

## Methodology
I built BWAI using a project-based workflow that started from the proposal and moved through repository setup, documentation, and presentation assets. I used Git for version control and updated the project incrementally as the concept, README, slides, and report were refined.

## Evidence — Claude Code usage
The repository includes the following Claude Code assets that support the project workflow.

### MCP
- path: .mcp.json
- what: Configured the filesystem MCP server to access local stock-related data from the data folder for research context and project organization.

### Skill
- path: .claude/skills/stock-analysis/SKILL.md
- what: Added a stock-analysis skill that guides structured stock summaries, bullish and bearish factor analysis, risk explanation, and balanced conclusions.

### Agent
- path: .claude/agents/stock-research-agent.md
- what: Added a stock research agent that specializes in reading stock information, generating concise summaries, explaining risks, and comparing bullish and bearish views.
