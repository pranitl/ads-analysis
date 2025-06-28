/**
 * n8n Code Node: Flattens and Parses Stringified JSON from LLM
 *
 * This node is designed to handle a common n8n scenario where a Large Language
 * Model (LLM) returns a JSON object or array as a string within an 'output'
 * field. It parses this string and flattens the result, ensuring that each
 * object in a returned array becomes a distinct n8n item for downstream processing.
 *
 * Input (example):
 * [
 *   { "json": { "output": "[{\\"key\\":\\"value1\\"},{\\"key\\":\\"value2\\"}]" } },
 *   { "json": { "output": "{\\"key\\":\\"value3\\"}" } }
 * ]
 *
 * Output (what this node produces):
 * [
 *   { "json": { "key": "value1" } },
 *   { "json": { "key": "value2" } },
 *   { "json": { "key": "value3" } }
 * ]
 */

const allItems = $input.all();
const cleanedItems = [];

for (const item of allItems) {
  // Gracefully handle cases where item.json or item.json.output might not exist.
  const jsonString = item.json ? item.json.output : undefined;

  // Ensure the input is a non-empty string before trying to parse
  if (typeof jsonString !== 'string' || jsonString.trim() === '') {
    console.warn("Skipping item because 'output' field was not a valid string:", item.json);
    continue;
  }

  try {
    // Parse the string into a JavaScript object or array
    const parsedData = JSON.parse(jsonString);

    // If the parsed data is an array, iterate through it and create
    // a new n8n item for each element. This "flattens" the array.
    if (Array.isArray(parsedData)) {
      for (const element of parsedData) {
        cleanedItems.push({ json: element });
      }
    } else {
      // If the parsed data is a single object, wrap it as a single item.
      cleanedItems.push({ json: parsedData });
    }
  } catch (error) {
    console.error("Failed to parse JSON string for item:", item.json, "Error:", error);
    // Push an error object to the output for easier debugging in n8n.
    cleanedItems.push({
      json: {
        error: "Failed to parse JSON string.",
        details: error.message,
        original_string: jsonString
      }
    });
  }
}

return cleanedItems;