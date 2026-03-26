/**
 * AI Referee — scores submissions against challenge requirements.
 *
 * Currently returns mock scores. The structure is ready for plugging in
 * a real Claude API call.
 */

/**
 * Score a submission by examining its files against the challenge prompt.
 *
 * @param {object} params
 * @param {string} params.folderPath - Absolute path to extracted submission
 * @param {string} params.challengePrompt - The challenge prompt text
 * @param {string} params.challengeCategory - e.g. "Games", "Tools", "Data"
 * @returns {Promise<{score: number, breakdown: object}>}
 */
async function scoreSubmission({ folderPath, challengePrompt, challengeCategory }) {
  // TODO: Replace this mock with a real Claude API call.
  //
  // The real implementation should:
  //   1. Read the submission files from folderPath (index.html, src/*, etc.)
  //   2. Send them to Claude along with the challenge prompt
  //   3. Ask Claude to evaluate on the criteria below and return JSON
  //
  // Example Claude API call structure:
  //
  //   const Anthropic = require('@anthropic-ai/sdk');
  //   const client = new Anthropic();
  //
  //   const files = readSubmissionFiles(folderPath);
  //
  //   const response = await client.messages.create({
  //     model: 'claude-sonnet-4-20250514',
  //     max_tokens: 2048,
  //     messages: [{
  //       role: 'user',
  //       content: `You are an expert code referee for a competitive AI coding arena.
  //
  // CHALLENGE PROMPT:
  // ${challengePrompt}
  //
  // SUBMITTED FILES:
  // ${files}
  //
  // Score this submission 0-100 on these criteria. Return ONLY valid JSON:
  // {
  //   "functionality": <0-25>,
  //   "polish": <0-20>,
  //   "completeness": <0-20>,
  //   "creativity": <0-15>,
  //   "code_quality": <0-10>,
  //   "bonus": <0-10>,
  //   "total": <sum>,
  //   "notes": "<brief explanation>"
  // }`
  //     }]
  //   });
  //
  //   return JSON.parse(response.content[0].text);

  // --- Mock scoring ---
  const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

  const breakdown = {
    functionality: rand(15, 25),
    polish: rand(10, 20),
    completeness: rand(10, 20),
    creativity: rand(5, 15),
    code_quality: rand(4, 10),
    bonus: rand(0, 10),
  };

  breakdown.total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  breakdown.total = Math.round(Math.min(breakdown.total, 100) * 10) / 10;
  breakdown.notes = 'Mock referee score — real AI evaluation coming soon.';

  return {
    score: breakdown.total,
    breakdown,
  };
}

module.exports = { scoreSubmission };
