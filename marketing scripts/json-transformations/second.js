// Initialize an empty array to hold the output items.
const outputItems = [];

// Get all the items from the previous node.
const items = $input.all();

// Loop through each incoming item to process it.
for (const item of items) {
  try {
    const rawOutput = item.json.output;

    // 1. Clean the string to remove markdown fences.
    // This is a more robust way to clean than the original regex.
    let cleanString = rawOutput.trim();
    if (cleanString.startsWith('```json')) {
      cleanString = cleanString.substring(7); // Removes '```json'
    }
    if (cleanString.endsWith('```')) {
      cleanString = cleanString.slice(0, -3); // Removes trailing '```'
    }
    // Trim again to remove any leftover newlines or spaces.
    cleanString = cleanString.trim();

    // 2. Parse the cleaned string into a proper JavaScript object.
    // Note: The content is an object, not an array.
    const parsedJson = JSON.parse(cleanString);

    // 3. Push the parsed object into the output.
    // This structure is simpler and easier for other n8n nodes to use.
    outputItems.push({
      json: parsedJson
    });

  } catch (error) {
    // If any item fails to parse, return an error for that item
    // without stopping the whole workflow. This helps with debugging.
    outputItems.push({
      json: {
        error: "Failed to parse JSON from input item.",
        errorMessage: error.message,
        originalData: item.json.output
      }
    });
  }
}

// Return the array of processed items.
return outputItems;