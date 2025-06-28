// This Code node intelligently groups multiple creative versions by their title.

// Get all items coming from the Merge node.
const allItems = $input.all();

// Use a Map to group the creative versions by their title.
// The key will be the concept title, and the value will be the aggregated object.
const groupedByTitle = new Map();

// Iterate over each item from the input.
for (const item of allItems) {
  const creative = item.json;
  const title = creative.title;

  // If we haven't seen this title before, create a new entry in our map.
  if (!groupedByTitle.has(title)) {
    groupedByTitle.set(title, {
      title: title,
      target_pain_point: creative.target_pain_point,
      key_emotion: creative.key_emotion,
      versions: [] // Initialize the versions array.
    });
  }

  // Get the existing entry for this title.
  const existingEntry = groupedByTitle.get(title);

  // Add the current version (persona and slides) to the versions array.
  existingEntry.versions.push({
    persona: creative.persona,
    slides: creative.slides,
    repaired: creative.repaired // Keep the 'repaired' flag if it exists
  });
}

// The n8n Code node expects an array of items to be returned.
// We'll convert our map of aggregated objects into an array.
const finalOutput = Array.from(groupedByTitle.values());

// Wrap each aggregated object in the n8n item structure.
return finalOutput.map(data => ({ json: data }));