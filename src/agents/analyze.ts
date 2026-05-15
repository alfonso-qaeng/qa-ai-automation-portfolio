import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyzeTestResults(): Promise<void> {
  const resultsDir = path.join(process.cwd(), 'allure-results');

  if (!fs.existsSync(resultsDir)) {
    console.error('No allure-results directory found. Run tests first.');
    process.exit(1);
  }

  const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('-result.json'));
  const results = files.map(f => JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf-8')));

  const failed = results.filter((r: { status: string }) => r.status === 'failed');
  const summary = {
    total: results.length,
    passed: results.filter((r: { status: string }) => r.status === 'passed').length,
    failed: failed.length,
    failedTests: failed.map((r: { name: string; statusDetails?: { message?: string } }) => ({
      name: r.name,
      message: r.statusDetails?.message ?? 'No message',
    })),
  };

  console.log('\n=== Test Summary ===');
  console.log(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed}\n`);

  if (summary.failed === 0) {
    console.log('All tests passed. No AI analysis needed.');
    return;
  }

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a QA engineer. Analyze these Playwright test failures and suggest fixes:\n\n${JSON.stringify(summary.failedTests, null, 2)}`,
      },
    ],
  });

  const analysisText = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log('=== AI Analysis ===\n', analysisText);
}

analyzeTestResults().catch(console.error);
