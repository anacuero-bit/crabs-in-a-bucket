/**
 * AI Referee — scores submissions against challenge requirements.
 *
 * The referee is not yet wired. Until it ships, every submission is recorded
 * with a null score and a `status: 'pending'` breakdown. Community vote is the
 * only live competitive signal. See arena UI for the user-facing disclaimer.
 */

async function scoreSubmission(/* { folderPath, challengePrompt, challengeCategory } */) {
  return {
    score: null,
    breakdown: {
      status: 'pending',
      message: 'AI referee not yet wired — community vote is the live signal.',
    },
  };
}

module.exports = { scoreSubmission };
