#!/usr/bin/env ts-node
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

interface GherkinScenario {
  title: string;
  given: string[];
  when: string[];
  then: string[];
}

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Risk {
  description: string;
  severity: Severity;
  area: string;
}

interface StoryAnalysis {
  gherkin: {
    happy_path: GherkinScenario[];
    edge_cases: GherkinScenario[];
    error_states: GherkinScenario[];
  };
  risks: Risk[];
  missing_acceptance_criteria: string[];
  ambiguities: string[];
}

interface AnalysisReport extends StoryAnalysis {
  metadata: {
    model: string;
    story_excerpt: string;
    timestamp: string;
    duration_ms: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = 'claude-sonnet-4-20250514';

const DEMO_STORY = `
As a registered user,
I want to reset my password via email,
So that I can regain access to my account if I forget my credentials.

Acceptance Criteria:
- User enters their email address
- System sends a password reset link
- Link expires after some time
- User can set a new password
`.trim();

const SYSTEM_PROMPT = `
You are a Senior QA Engineer with 15+ years of experience specializing in Shift-Left testing, BDD, and test strategy design.

Your mission is to analyze user stories BEFORE development begins. You prevent bugs by exposing ambiguities, hidden requirements, and risks at the requirements stage — where fixes are 100x cheaper than in production.

Shift-Left principles you always apply:
- Every scenario must be independently testable with a clear pass/fail outcome
- Identify security, data-integrity, UX, accessibility, and performance risks proactively
- Flag missing acceptance criteria that developers will silently assume (and assume wrong)
- Ask the questions that the team did not think to ask

Given a user story, respond with ONLY a raw JSON object — no markdown fences, no explanation, no text before or after:

{
  "gherkin": {
    "happy_path": [
      {
        "title": "string — descriptive, unique scenario title",
        "given": ["array of Given steps, each a complete sentence"],
        "when":  ["array of When steps, each a complete sentence"],
        "then":  ["array of Then steps with specific, observable outcomes"]
      }
    ],
    "edge_cases": [
      { "title": "...", "given": ["..."], "when": ["..."], "then": ["..."] }
    ],
    "error_states": [
      { "title": "...", "given": ["..."], "when": ["..."], "then": ["..."] }
    ]
  },
  "risks": [
    {
      "description": "Clear, actionable risk statement",
      "severity": "low | medium | high | critical",
      "area": "Security | UX | Data | Performance | Integration | Accessibility | Compliance"
    }
  ],
  "missing_acceptance_criteria": [
    "Each item is a specific AC that must be added before development starts"
  ],
  "ambiguities": [
    "Each item is a concrete question to raise with the Product Owner or Business Analyst"
  ]
}

Be exhaustive. More scenarios and risks are always better than fewer. Think like an attacker for security. Think like a confused first-time user for UX.
`.trim();

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const C = {
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  reset:   '\x1b[0m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  orange:  '\x1b[91m',
  red:     '\x1b[31m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
} as const;

function severityColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    low:      C.green,
    medium:   C.yellow,
    high:     C.orange,
    critical: C.red,
  };
  return map[severity];
}

function section(emoji: string, title: string): void {
  console.log(`\n${C.bold}${C.cyan}${emoji}  ${title}${C.reset}`);
  console.log(C.dim + '─'.repeat(62) + C.reset);
}

function printScenario(scenario: GherkinScenario, index: number): void {
  console.log(`\n  ${C.bold}Scenario ${index + 1}: ${scenario.title}${C.reset}`);
  for (const step of scenario.given) console.log(`    ${C.dim}Given${C.reset}  ${step}`);
  for (const step of scenario.when)  console.log(`    ${C.dim}When${C.reset}   ${step}`);
  for (const step of scenario.then)  console.log(`    ${C.dim}Then${C.reset}   ${step}`);
}

function printResults(story: string, analysis: StoryAnalysis, durationMs: number): void {
  const line = '═'.repeat(65);
  console.log(`\n${C.bold}${line}${C.reset}`);
  console.log(`${C.bold}${C.magenta}  🤖  QA AI Story Analyzer — Shift-Left Analysis${C.reset}`);
  console.log(`${C.bold}${line}${C.reset}`);
  console.log(`${C.dim}Story:  ${story.slice(0, 90)}${story.length > 90 ? '…' : ''}${C.reset}`);
  console.log(`${C.dim}Model:  ${MODEL}   ·   Duration: ${durationMs}ms${C.reset}`);

  section('✅', `Happy Path  (${analysis.gherkin.happy_path.length} scenarios)`);
  analysis.gherkin.happy_path.forEach((s, i) => printScenario(s, i));

  section('⚠️ ', `Edge Cases  (${analysis.gherkin.edge_cases.length} scenarios)`);
  analysis.gherkin.edge_cases.forEach((s, i) => printScenario(s, i));

  section('❌', `Error States  (${analysis.gherkin.error_states.length} scenarios)`);
  analysis.gherkin.error_states.forEach((s, i) => printScenario(s, i));

  section('🔥', `Identified Risks  (${analysis.risks.length} total)`);
  for (const risk of analysis.risks) {
    const color = severityColor(risk.severity);
    console.log(`\n  ${color}${C.bold}[${risk.severity.toUpperCase()}]${C.reset}  ${C.bold}${risk.area}${C.reset}`);
    console.log(`    ${risk.description}`);
  }

  section('📋', `Missing Acceptance Criteria  (${analysis.missing_acceptance_criteria.length} items)`);
  analysis.missing_acceptance_criteria.forEach((ac, i) => {
    console.log(`\n  ${C.yellow}${i + 1}.${C.reset} ${ac}`);
  });

  section('❓', `Ambiguities to Clarify with PO/BA  (${analysis.ambiguities.length} questions)`);
  analysis.ambiguities.forEach((q, i) => {
    console.log(`\n  ${C.blue}${i + 1}.${C.reset} ${q}`);
  });

  console.log(`\n${C.bold}${line}${C.reset}\n`);
}

// ─── CLI arg parser ────────────────────────────────────────────────────────────

function readStory(): string {
  const args = process.argv.slice(2);

  const storyIdx = args.indexOf('--story');
  if (storyIdx !== -1) {
    const value = args[storyIdx + 1];
    if (!value || value.startsWith('--')) {
      console.error('❌  --story requires a text value.');
      process.exit(1);
    }
    return value;
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    if (!filePath || filePath.startsWith('--')) {
      console.error('❌  --file requires a path.');
      process.exit(1);
    }
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`❌  File not found: ${resolved}`);
      process.exit(1);
    }
    return fs.readFileSync(resolved, 'utf-8').trim();
  }

  console.log(`${C.dim}ℹ️  No --story or --file provided — running with built-in demo story.${C.reset}\n`);
  return DEMO_STORY;
}

// ─── Save report ──────────────────────────────────────────────────────────────

function saveReport(story: string, analysis: StoryAnalysis, durationMs: number): string {
  const reportsDir = path.join(process.cwd(), 'reports', 'ai-analysis');
  fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(reportsDir, `story-analysis-${timestamp}.json`);

  const report: AnalysisReport = {
    ...analysis,
    metadata: {
      model: MODEL,
      story_excerpt: story.slice(0, 200),
      timestamp: new Date().toISOString(),
      duration_ms: durationMs,
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  return path.relative(process.cwd(), outputPath);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const story = readStory();

  // ── Manual mode: no API key configured ──────────────────────────────────────
  if (!apiKey) {
    const line = '─'.repeat(62);
    console.log(`\n${C.bold}${C.magenta}🤖  AI Agent Mode: Claude Code${C.reset}`);
    console.log(C.dim + line + C.reset);
    console.log(`${C.yellow}No ANTHROPIC_API_KEY detected.${C.reset} To analyze this story, open`);
    console.log(`${C.bold}Claude Code${C.reset} and run the following prompt:\n`);
    console.log(`${C.dim}${line}${C.reset}`);
    console.log(`${C.cyan}Analyze this user story and generate Playwright test cases`);
    console.log(`following the existing POM structure in /pages and /tests:\n`);
    console.log(story + C.reset);
    console.log(`${C.dim}${line}${C.reset}`);
    console.log(`\n${C.dim}Alternatively, add ANTHROPIC_API_KEY to your .env to run`);
    console.log(`the agent automatically with npm run agent:story${C.reset}\n`);
    return; // exit cleanly with code 0
  }
  const client = new Anthropic({ apiKey });

  console.log(`${C.bold}🔍  Analyzing story with ${MODEL}…${C.reset}`);
  const startMs = Date.now();

  let rawText: string;
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this user story:\n\n${story}` }],
    });

    const block = message.content[0];
    if (block.type !== 'text') throw new Error('Unexpected non-text response block from API.');
    rawText = block.text;
  } catch (err) {
    console.error('❌  Claude API request failed:', (err as Error).message);
    process.exit(1);
  }

  const durationMs = Date.now() - startMs;

  let analysis: StoryAnalysis;
  try {
    // Strip accidental markdown fences Claude may include despite instructions
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```$/m, '')
      .trim();
    analysis = JSON.parse(cleaned) as StoryAnalysis;
  } catch {
    console.error('❌  Failed to parse Claude response as JSON. Raw output:');
    console.error(rawText);
    process.exit(1);
  }

  printResults(story, analysis, durationMs);

  const savedPath = saveReport(story, analysis, durationMs);
  console.log(`💾  Report saved → ${C.cyan}${savedPath}${C.reset}\n`);
}

main().catch(err => {
  console.error('❌  Unexpected error:', (err as Error).message);
  process.exit(1);
});
