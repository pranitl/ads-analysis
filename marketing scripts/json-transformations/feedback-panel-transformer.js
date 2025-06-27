/**
 * n8n Code Node Snippet - AI JSON Repair & Parser
 *
 * This advanced script is designed to handle incomplete or malformed JSON, a common
 * issue with outputs from Large Language Models (LLMs).
 *
 * It first cleans the raw string by removing common markdown code fences (e.g., ```json)
 * before attempting to parse.
 *
 * It includes a helper function, `repairAndParseJson`, that then attempts to automatically
 * fix common JSON errors like unterminated strings and missing closing braces/brackets
 * before parsing. This significantly increases the chances of salvaging usable data.
 *
 * Items that cannot be repaired are logged and filtered out, ensuring that only
 * clean, valid JSON is passed to the next node.
 */

/**
 * Attempts to repair and parse a potentially malformed JSON string.
 * @param {string} jsonString The raw string output from a previous node.
 * @returns {object} A valid JavaScript object.
 * @throws {Error} If the string cannot be parsed even after repair attempts.
 */
function repairAndParseJson(jsonString) {
  // Guard against null or non-string inputs
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error("Input is not a valid string.");
  }

  // --- Step 1: Clean the raw string from markdown fences ---
  // This regex matches ```json ... ``` or ``` ... ``` and extracts the content.
  let cleanedString = jsonString.trim();
  const match = cleanedString.match(/^`{3,}(?:json)?\s*([\s\S]*?)\s*`{3,}$/);
  if (match && match[1]) {
    cleanedString = match[1];
  }

  // --- Attempt 1: Parse the cleaned string as-is (happy path) ---
  try {
    return JSON.parse(cleanedString);
  } catch (e) {
    // The initial parse failed. Let the repair logic proceed.
    // console.log(`Initial parse failed for: "${cleanedString.substring(0, 80)}...". Attempting repair.`);
  }

  let repairedString = cleanedString.trim();

  // --- Repair Step 2: Fix unterminated strings ---
  // An odd number of non-escaped quotes suggests an unclosed string.
  const quoteCount = (repairedString.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repairedString += '"';
  }

  // --- Repair Step 3: Balance braces and brackets using a stack ---
  const stack = [];
  let inString = false;
  for (let i = 0; i < repairedString.length; i++) {
    const char = repairedString[i];
    if (char === '"' && (i === 0 || repairedString[i - 1] !== '\\')) {
      inString = !inString;
    }
    if (inString) continue;

    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '{') {
        stack.pop();
      }
    } else if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === '[') {
        stack.pop();
      }
    }
  }

  // Append missing closing characters in the correct LIFO order.
  while (stack.length > 0) {
    const openChar = stack.pop();
    repairedString += (openChar === '{') ? '}' : ']';
  }

  // --- Attempt 2: Final parse attempt on the repaired string ---
  try {
    return JSON.parse(repairedString);
  } catch (error) {
    // If it still fails, the JSON is likely too malformed. Give up on this item.
    throw new Error(`Failed to parse even after attempting repair. Original error: ${error.message}`);
  }
}


// --- Main Execution Block ---

// Assuming 'items' is the input from n8n
const processedItems = $input.all().map((item, index) => {
  try {
    // The raw output from the LLM, wrapped in markdown fences
    const rawOutput = item.json.output;
    if (!rawOutput) {
      throw new Error("Input item is missing 'output' property.");
    }

    const parsedJson = repairAndParseJson(rawOutput);

    // TODO: The persona should ideally be passed along with the input.
    // This is a placeholder. You might need to get this from another field
    // or based on the input index.
    // parsedJson.persona_name = item.json.persona_name || `Persona ${index + 1}`;

    // Add the original critiqued concept, which the LLM often forgets.
    // This assumes the concept is available in the input to this node.
    if (item.json.critiqued_concept) {
        parsedJson.critiqued_concept = item.json.critiqued_concept;
    }
    
    const finalJson = {
        persona_feedback: parsedJson
    }

    return {
      json: finalJson
    };
  } catch (error) {
    console.error(`Could not process item. ${error.message}`, { originalOutput: item.json.output });
    return {
      json: {
        error: `Failed to parse or repair JSON: ${error.message}`,
        originalItem: item.json
      },
      error: true
    };
  }
});

// Filter out any items that were flagged with an error.
const successfulItems = processedItems.filter(item => !item.error);

return successfulItems; 