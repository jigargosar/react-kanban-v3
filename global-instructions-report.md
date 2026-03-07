# Global Instructions Research Report

Research into how to write effective CLAUDE.md and rules files, based on official docs, internal docs, and community findings.

## Context

We added a "code is written for humans" principle to:
1. `~/.claude/rules/code-standards.md` — full principle as opening statement
2. `~/.claude/CLAUDE.md` — one-line reinforcement as `## Code Philosophy`

This report captures all research findings to inform whether our current approach is effective and what adjustments are needed.

---

## How CLAUDE.md Files Actually Work

1. `[Off]` CLAUDE.md is loaded as a **user message following the system prompt**, not part of the system prompt itself (which is proprietary and unpublished)
2. `[Off]` Rules files (without `paths` frontmatter) load the same way — into context at session start. Path-scoped rules load lazily when matching files are accessed.
3. `[Off]` Priority order (highest to lowest): Managed policy > CLI args > Local (.local.md) > Project (./CLAUDE.md) > User (~/.claude/CLAUDE.md)
4. `[Off]` CLAUDE.md is advisory context, not enforcement — how you write instructions affects how reliably they're followed. For true enforcement, use hooks (deterministic, 100% reliable).

---

## What Makes Instructions Effective

### 1. Lost-in-the-Middle Effect (Attention Architecture)
> "The model has an architectural bias toward recency and primacy at the expense of middle content."
> "LLMs bias towards instructions that are on the peripheries of the prompt: at the very beginning and at the very end."

**Implication:** Position matters. Beginning and end of files get more attention than the middle.

**Strategy:** Place critical rules at the top. Consider repeating the most important ones at the end.

Source: HumanLayer, Allard de Winter

### 2. Rationale Increases Weight
> "The 'why' turns a single rule into a class of behaviors, and this is the most undervalued formatting choice."
> "'Never force push — rewrites shared history, unrecoverable for collaborators' is weighted more than a bare statement."

**Implication:** Rules with reasons generalize better to novel situations. The model can extrapolate the principle behind the rule.

Source: HumanLayer, community research

### 3. Specificity and Verifiability
> "Write instructions that are concrete enough to verify."
> - Good: "Use 2-space indentation"
> - Bad: "Format code properly"

> "An instruction without a measurable criterion is an instruction that gets ignored."

**Implication:** Vague instructions like "write clean code" get ignored. Specific, verifiable instructions get followed.

Source: Official docs (memory.md), community

### 4. Imperative Voice
> "Write imperatives like 'Use functional components' rather than declarative statements, as Claude Code interprets imperatives as binding instructions."

**Implication:** "Write code for humans" (imperative) may be more binding than "Code is written for humans" (declarative).

Source: Builder.io

### 5. Structure Creates Attention Anchors
> "Structural elements — headers, code fences, lists — create anchor points that agents latch onto."
> "One header per topic, one code block per command, one sentence of rationale per prohibition."
> Recommended: h1 for file title, h2 for sections, h3 for subsections. "If you need an h4, you probably need a separate file."

Source: Cleverhoods (dev.to)

### 6. Emphasis Works But Only When Rare
> "IMPORTANT/CRITICAL/MUST only work when rare. If everything is important, nothing is."

Source: Official docs, community

### 7. Instruction Ceiling
> "Frontier thinking LLMs can follow ~150-200 instructions with reasonable consistency."
> "Claude Code's system prompt already contains ~50 individual instructions — nearly a third of the instructions your agent can reliably follow."
> "As you give the LLM more instructions, it doesn't simply ignore the newer instructions — it begins to ignore all of them uniformly."

**Implication:** Every instruction added has a cost. Pruning matters as much as adding.

Source: HumanLayer

---

## Contradiction: Prohibitions vs Positive Framing

### Finding A: Prohibitions are highest value
> "The 'Prohibitions' section — indicating what Claude Code should never do — is often the most useful section."

Source: Official Claude Code docs (best-practices)

### Finding B: Positive framing beats negative
> "Positive framing instead of prohibitive language leads to more reliable outcomes."
> One user's "NEVER create duplicate files" was consistently ignored. Changing to "Make all possible updates in current files whenever possible" fixed it.
> "LLMs produce worse output the more 'DO NOTs' are included in the prompt."

Source: Builder.io, Pink Elephant research, Reddit reports

### Finding C: The resolution (community pattern)
> "The combination of positive routing ('ALWAYS invoke') + negative constraint ('Do not X directly') is what makes instructions uniquely effective: 'ALWAYS invoke' alone might still bypass for simple tasks, while 'Do not X' alone means Claude doesn't know what to do instead — together creating unambiguous instruction with blocked escape path."
> "Avoid negative-only constraints like 'Never use the --foo-bar flag.' Always provide an alternative."

**My thinking on this contradiction:**

These findings aren't actually contradictory — they're about different things:

1. **Prohibitions section is valuable** — means having a dedicated section for boundaries/constraints is high-ROI. The *existence* of such a section matters.
2. **Positive framing beats negative** — means *within* those constraints, the phrasing matters. "Do X instead of Y" works better than "Never do Y."
3. **The combined pattern** — the most effective format is: tell what TO do (positive route) + state what NOT to do (constraint) + explain WHY. This gives the model a clear action path and a blocked escape path.

Example applying all three:
- Weak: "Never write unreadable code"
- Medium: "Write readable code"
- Strong: "Write code for humans — minimize cognitive effort. Don't optimize for performance or cleverness at the expense of readability — a reader should understand any file without knowing the whole system."

The strong version: positive route + negative constraint + rationale.

---

## The "Self-Evident" Problem

### Official guidance
> Exclude "self-evident practices like 'write clean code'"
> "Your file says 'Write good code' and 'Use meaningful variable names.' Fix: Delete these. Claude already knows."

### How our principle differs
"Code is written for humans" could be seen as self-evident. But it differs from "write clean code" in two ways:

1. **It has a verifiable criterion:** "A reader unfamiliar with the codebase should be able to follow any single file without holding the whole system in their head." This is testable — you can ask "does this file require knowledge of other files to understand?"

2. **It serves a structural purpose:** "All standards below serve this principle" frames 17 specific rules as consequences. Even if the principle itself is "obvious," its organizational role adds value — it tells the model how to handle edge cases where no specific rule applies.

3. **It's a governing frame, not a standalone rule.** "Write clean code" is a leaf instruction competing with other instructions. "Code is written for humans" is a root principle that other instructions derive from.

**Open question:** Is this distinction real from Claude's processing perspective, or is it only meaningful to human readers of the file?

---

## Other Findings Worth Noting

1. `[Com]` Code style via instructions is low-ROI — use linters instead. (Our code-standards.md has design principles, not formatting rules, so this doesn't apply directly.)
2. `[Com]` A "Common Pitfalls" section is the highest ROI per line — documenting bugs you've already fixed prevents Claude from reintroducing them.
3. `[Com]` CLAUDE.md is one layer in a five-layer system: settings, hooks (enforcement), memory (advisory), skills (on-demand), rules (modular). "CLAUDE.md for context, skills for routines, hooks for guarantees."
4. `[Com]` Compaction can drop error messages and file paths mid-debugging — consider adding preservation instructions.
5. `[Com]` Progressive disclosure via skills can recover ~15,000 tokens per session (82% improvement over loading everything in CLAUDE.md).

---

## Current State of Our Files

### ~/.claude/CLAUDE.md (line 5-7)
```
## Code Philosophy

Code is written for humans — every decision must minimize cognitive effort for the reader (see code-standards.md).
```

### ~/.claude/rules/code-standards.md (line 1-3)
```
Code is written for humans. Every design decision — naming, structure, abstraction, flow — must minimize the cognitive effort required to understand the code. A reader unfamiliar with the codebase should be able to follow any single file without holding the whole system in their head.

All standards below serve this principle and must be followed when designing and writing code.
```

### Analysis Against Findings

| Criterion | code-standards.md | CLAUDE.md |
|-----------|-------------------|-----------|
| Positioned at top (primacy) | Yes | Yes (2nd section) |
| Includes rationale | Yes ("minimize cognitive effort", "reader unfamiliar...") | Partial (rationale but abbreviated) |
| Specific/verifiable | Partially ("follow any single file without holding whole system") | Less so |
| Imperative voice | No — declarative ("Code is written") | No — declarative |
| Positive framing | Yes | Yes |
| Token cost | ~50 tokens | ~15 tokens |
| Structural role | Frames 17 rules as consequences | Cross-reference to source |

---

## Decisions Needed

1. Should we change "Code is written for humans" to imperative "Write code for humans"?
2. Is the CLAUDE.md one-liner specific enough or does it risk being treated as self-evident?
3. Should we add a negative constraint to strengthen? (e.g., "Don't optimize for performance or cleverness at the expense of comprehension")
4. Are there other adjustments to our existing CLAUDE.md / rules files suggested by this research?
5. Does the "positive route + negative constraint + rationale" pattern hold up given the A vs B contradiction?

---

## Active Investigation Threads

Unresolved items that need further research before we can act on them.

### 1. Prohibitions vs Positive Framing (A vs B contradiction)

Finding A says prohibitions are the highest-value section. Finding B says positive framing beats negative. Community pattern C (positive route + negative constraint + rationale) appears to resolve the conflict but is unverified. We don't have enough evidence to trust any single approach as universal.

**Status:** Needs further research. No conclusions yet.

### 2. Rationale: Signal or Noise?

Does including "why" with a rule help or hurt?

1. `[Off][Com]` Smaller instruction set = more effective (established)
2. AI doesn't care about rationale (anecdotal, source forgotten, unverified)
3. `[Com]` Rationale increases weight — "the 'why' turns a single rule into a class of behaviors" (contradicts #2)

**Open question:** Does rationale bloat the instruction count (noise) or act as a force multiplier that makes the attached instruction stick better (signal)?

**Status:** Unresolved. Need to test both approaches.

### 3. The Stubborn Instructions Problem

Some instructions get violated despite following all known best practices. Concrete examples from `communication.md`:

1. "Use numbered lists (1. 2. 3.) with alphabets for sub-items" — repeatedly violated with bullet points
2. "Always include a recommendation when presenting options" — frequently omitted
3. "Never leave options blank/bare" — still happens

These instructions are: positively framed, specific, verifiable, in a dedicated rules file, loaded every session. Yet they still get ignored.

**Possible angles to investigate:**
1. Position in file — lost in the middle?
2. Instruction ceiling reached — too many total instructions?
3. Conflicts with Claude's training defaults — bullet points and open-ended prompts are deeply ingrained?
4. Needs emphasis (IMPORTANT/MUST) or hooks instead of better phrasing?

**Status:** Unsolved. This is the strongest evidence that current best practices are insufficient for certain instruction types.

### 4. Root Cause Investigation: Why Do Training Defaults Override Instructions?

Hypothesis: some instructions fail not because of phrasing, position, or emphasis, but because they fight deeply ingrained training defaults (e.g., Claude's default output pattern is bullet-point markdown). If true, the fix isn't better phrasing — it's a fundamentally different mechanism.

**To investigate:**
1. Count total instructions across all files — are we near the 150-200 ceiling?
2. Check positional placement of the violated rules — lost in middle?
3. Search for community reports of Claude defaulting to bullets despite explicit instructions
4. Empirical testing: fresh session, minimal instructions, progressively add the rule in different positions/phrasings/emphasis levels

**Status:** Not started. Agreed to investigate, but parked for now.
