# Pattern — Design Shotgun

Generate **multiple distinct design directions**, compare them on a board, and pick or blend. The shotgun is the exploration step of the design skill: it produces options fast so the user chooses direction from evidence, not from a single guess.

## When to use

- The design brief is broad ("redesign the dashboard") and direction is genuinely open.
- The user wants options, not a single take.
- Medium detection says Web/Mobile (visual path). CLI/TUI designs use the command-tree path instead — a shotgun there is premature.

When NOT to use: direction is already settled (brand kit, strong opinion, existing design being extended). Then a single consultation pass is cheaper and more coherent.

## Process

### 1. Define the axes of difference

Before generating variants, decide how they differ. Axes come from the consultation answers:

- **Layout density** — information-dense (pro tools) vs airy (consumer apps).
- **Color temperature** — warm/neutral/cool, restrained vs expressive.
- **Typography voice** — editorial serif vs clean sans vs mono-forward.
- **Interaction feel** — playful vs formal vs technical.

Each variant is a coherent point in this space — one variant does not mix "playful" with "corporate", or it reads as noise, not a direction.

### 2. Generate 3-4 variants

Target 3-4 directions, not 8. Each variant:

- Has a name that captures its angle ("Atlas", "Monochrome", "Editorial", "Compact").
- Is a full wireframe/sketch of the primary screen (the screen with the most design surface).
- Uses distinct token sets (a provisional palette + type pairing) — the token difference IS the direction.

Use the design skill's wireframe phase to draw each variant in ASCII, or the shotgun variant mechanism (generate multiple takes, compare on the board).

### 3. The comparison board

Render all variants side by side (ASCII board in the review, or screenshots via the browser skill). The board is the artifact the user judges. For each variant, the design records:

- The axis position (dense? warm? formal?).
- What it optimizes for.
- The tradeoff it accepts (a dense layout is faster but colder; a playful one is friendlier but less serious).

### 4. Pick, blend, or discard

User chooses from the board. Options:

- **Pick one** — proceed to DESIGN.md with its tokens.
- **Blend** — "take the layout of B and the color of C" — but a blend of >2 variants or of non-compatible axes produces mush. Record the blend explicitly: which variant supplies layout, which supplies color, which supplies typography. Verify the blend holds the intent (a warm palette with a cool editorial typeface can work; mixing three palettes cannot).
- **Re-shoot** — user rejects all; refine the axes from the rejection feedback ("less corporate", "more colorful") and generate a new set.

### 5. Converge on DESIGN.md

The chosen direction becomes the DESIGN.md token spec and component library. The other variants are archived in the design output for reference — the build may revisit them for inspiration on secondary screens, but the source of truth is the chosen direction.

## Rules

1. Axes of difference are defined before variants are generated — variants differ along stated axes, not randomly.
2. 3-4 variants max. A board of 8 is a menu, not a decision.
3. Each variant has a coherent internal logic; no cherry-picking within a variant.
4. The board compares on equal terms — same screen, same content, different design.
5. A blend names its sources per axis. Unnamed blends are rejected.
6. Rejection feedback must be specific ("less purple", "denser") or the next shot repeats the same space.
7. The board verdict is recorded in the design output (which variant, why, what was blended) so the review lens can verify the chosen direction against the original brief.

## Integration with the review lens

The design review (`reference/05-review.md`) checks the chosen direction against:

- The brief (does the picked variant actually serve the user answers from consultation?).
- Internal coherence (does the blend hold, or did it pick colors from one and spacing from another with no logic?).
- The system (do tokens → components → screens stay aligned, or did screens drift back to the rejected variants?).