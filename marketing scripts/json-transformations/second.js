// Initialize an empty array to hold the flattened output items.
const flattenedItems = [];

// Get all items from the previous node (output of initial.js).
// Each 'item' represents one ad concept.
const items = $input.all();

// Loop through each ad concept item to process its slides.
for (const item of items) {
  try {
    // item.json is a single ad concept object.
    const concept = item.json;

    const { title, key_emotion, design_notes, strategic_rationale, final_slides } = concept;

    // Check if final_slides exists and is an array.
    if (final_slides && Array.isArray(final_slides)) {
      // Create a separate output item for each slide.
      for (const slide of final_slides) {
        flattenedItems.push({
          json: {
            // Add parent concept info to each slide.
            concept_title: title,
            concept_key_emotion: key_emotion,
            concept_design_notes: design_notes,
            concept_strategic_rationale: strategic_rationale,
            // Spread the slide data.
            ...slide
          }
        });
      }
    }
  } catch (error) {
    // If any item causes an error, log it without stopping the workflow.
    flattenedItems.push({
      json: {
        error: "Failed to process and flatten an ad concept.",
        errorMessage: error.message,
        originalData: item.json
      }
    });
  }
}

// Return the final array of flattened slide items.
return flattenedItems;