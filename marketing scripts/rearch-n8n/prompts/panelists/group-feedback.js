/**
 * n8n Code Node: Aggregate Focus Group Feedback by Concept
 *
 * This script transforms individual panelist feedback into a final,
 * aggregated report for each ad concept. It groups all feedback by the
 * concept title and organizes it for easy review.
 */

// Get all merged items from the previous node.
const allItems = $input.all();
const groupedByConcept = new Map();

for (const item of allItems) {
  const data = item.json;

  // Ensure the necessary data exists to prevent errors.
  if (!data || !data.parsed_output || !data.critiqued_concept) {
    continue;
  }

  // CORRECTED: The concept title is the string directly.
  const conceptTitle = data.critiqued_concept;
  const panelistFeedback = data.parsed_output.feedback;
  const panelistName = data.parsed_output.panelist;

  // If this is the first time seeing this concept, initialize its structure.
  if (!groupedByConcept.has(conceptTitle)) {
    groupedByConcept.set(conceptTitle, {
      concept_title: conceptTitle,
      aggregated_feedback: {
        relevance_to_persona: [],
        addresses_needs_and_pain_points: [],
        appealing_elements: [],
        turn_offs: [],
        unanswered_questions: [],
        suggested_improvements: [],
      },
      individual_feedback: [],
    });
  }

  const existingConcept = groupedByConcept.get(conceptTitle);

  // 1. Add the full individual feedback block for detailed review.
  existingConcept.individual_feedback.push({
    persona: panelistName,
    feedback: panelistFeedback,
  });

  // 2. Aggregate each specific feedback key into the corresponding summary list.
  for (const key in existingConcept.aggregated_feedback) {
    if (panelistFeedback[key]) {
      existingConcept.aggregated_feedback[key].push({
        persona: panelistName,
        comment: panelistFeedback[key],
      });
    }
  }
}

// Convert the map into an array for the final n8n output.
const finalOutput = Array.from(groupedByConcept.values());

// Return each aggregated concept report as a separate item.
return finalOutput.map((concept) => ({ json: concept }));