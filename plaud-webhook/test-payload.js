// Test different payload formats that Plaud might send
const testPayloads = [
  // Format 1: Plaud native
  {
    transcription: "Test transcription",
    summary: "Test summary",
    recording_id: "test_123",
    timestamp: "2026-03-18T00:00:00Z"
  },
  // Format 2: Zapier wrapped
  {
    data: {
      transcription: "Test transcription",
      summary: "Test summary",
      recording_id: "test_123"
    }
  },
  // Format 3: Direct from Plaud AI
  {
    text: "Test transcription",
    ai_summary: "Test summary",
    id: "test_123",
    created_at: "2026-03-18T00:00:00Z"
  }
];

console.log('Possible Plaud payload formats:');
testPayloads.forEach((p, i) => {
  console.log(`\nFormat ${i + 1}:`, JSON.stringify(p, null, 2));
});
