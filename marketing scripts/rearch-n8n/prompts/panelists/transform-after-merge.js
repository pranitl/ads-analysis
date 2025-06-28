// This Code node intelligently groups multiple creative versions by their angle title.

// Get all items coming from the Merge node.
const allItems = $input.all();

// Use a Map to group the creative versions by their angle title.
// The key will be the angle title, and the value will be the aggregated object.
const groupedByAngle = new Map();

// Iterate over each item from the input.
for (const item of allItems) {
  const concept = item.json;
  // The concept title is expected to be in the format "Angle Title - Version Title"
  const titleParts = concept.concept_title.split(' - ');
  const angleTitle = titleParts[0].trim();

  // If we haven't seen this angle title before, create a new entry in our map.
  if (!groupedByAngle.has(angleTitle)) {
    groupedByAngle.set(angleTitle, {
      title: angleTitle,
      target_pain_point: concept.target_pain_point,
      key_emotion: concept.key_emotion,
      versions: [], // Initialize the versions array.
    });
  }

  // Get the existing entry for this angle title.
  const existingEntry = groupedByAngle.get(angleTitle);

  // Add the current version (the full concept object) to the versions array.
  existingEntry.versions.push(concept);
}

// The n8n Code node expects an array of items to be returned.
// We'll convert our map of aggregated objects into an array.
const finalOutput = Array.from(groupedByAngle.values());

// Wrap each aggregated object in the n8n item structure.
return finalOutput.map(data => ({ json: data }));