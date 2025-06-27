/**
 * n8n Code Node: Final Aggregation
 *
 * This script runs AFTER the Merge node. It assumes that the upstream
 * "Clean JSON Output" nodes have already done the hard work of:
 *  1. Parsing the raw JSON feedback.
 *  2. Re-attaching the original concept details.
 *  3. Adding a 'persona_name' to identify the panelist.
 *
 * This node's only job is to group these well-structured items
 * by the concept title.
 */

// --- Main Execution Block ---
const allItems = $input.all();
const groupedByConcept = new Map();

for (const item of allItems) {
  const data = item.json;

  // Skip any items that might have had errors upstream
  if (!data || data.error || !data.critiqued_concept || !data.critiqued_concept.title) {
    continue;
  }

  const conceptTitle = data.critiqued_concept.title;

  // If we haven't seen this concept title yet, create its entry.
  if (!groupedByConcept.has(conceptTitle)) {
    groupedByConcept.set(conceptTitle, {
      // Store the full concept details just once.
      concept_details: data.critiqued_concept,
      // Initialize an array to hold all feedback for this concept.
      all_feedback: []
    });
  }

  // Get the entry for the current concept.
  const existingConcept = groupedByConcept.get(conceptTitle);

  // Add the current feedback to the array, tagged with its persona.
  if (data.persona_name && data.persona_feedback) {
    existingConcept.all_feedback.push({
      persona: data.persona_name,
      feedback: data.persona_feedback
    });
  }
}

// Convert the map of grouped data into an array for the final output.
const finalOutput = Array.from(groupedByConcept.values());
return finalOutput.map(concept => ({ json: concept }));