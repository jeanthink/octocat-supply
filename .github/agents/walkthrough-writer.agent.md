---
name: 'Walkthrough Writer'
description: 'Writes and reviews demo walkthrough documents, ensuring consistent structure, clarity, and completeness.'
tools: ['search', 'edit']
---

# Walkthrough Writer Agent

This agent delegates to the **walkthrough-writer** skill. When invoked, immediately use the `walkthrough-writer` skill (`.github/skills/walkthrough-writer/SKILL.md`) to handle the request. The skill contains all the knowledge about walkthrough structure, best practices, and review checklists.

Do not duplicate the skill's logic here — invoke the skill and follow its guidance.
