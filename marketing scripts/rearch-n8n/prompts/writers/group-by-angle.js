// This Code node intelligently groups multiple creative versions by their angle title.

// Get all items from the input.
const allItems = $input.all();

// Use a Map to group the creative versions by their angle title.
// The key will be the angle title, and the value will be the aggregated object.
const groupedByAngleTitle = new Map();

// Iterate over each item from the input.
for (const item of allItems) {
  const creative = item.json;
  const angleTitle = creative.angle_title;

  // If we haven't seen this angle title before, create a new entry in our map.
  if (!groupedByAngleTitle.has(angleTitle)) {
    groupedByAngleTitle.set(angleTitle, {
      angle_title: angleTitle,
      target_pain_point: creative.target_pain_point,
      key_emotion: creative.key_emotion,
      versions: [] // Initialize the versions array.
    });
  }

  // Get the existing entry for this angle title.
  const existingEntry = groupedByAngleTitle.get(angleTitle);

  // Add the current version's details to the versions array.
  existingEntry.versions.push({
    concept_number: creative.concept_number,
    concept_title: creative.concept_title,
    hook_line: creative.hook_line,
    caption: creative.caption,
    visual_concept: creative.visual_concept,
    cta_text: creative.cta_text,
    cta_strategy: creative.cta_strategy,
    ad_objective_alignment: creative.ad_objective_alignment,
    creative_approach: creative.creative_approach,
    why_this_works: creative.why_this_works,
    conversion_strategy: creative.conversion_strategy,
    urgency_elements: creative.urgency_elements
  });
}

// Convert the map of aggregated objects into an array.
const finalOutput = Array.from(groupedByAngleTitle.values());

// Wrap each aggregated object in the n8n item structure.
return finalOutput.map(data => ({ json: data }));