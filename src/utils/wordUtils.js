// Normalize word for map key (case/whitespace insensitive)
export const normalizeWordKey = (w) => (w.word ?? "").trim().toLowerCase();

// Scalar equality: treat undefined, null, and "" as equal
function eqScalar(a, b) {
  // Handles boolean, null, undefined, "" all as equivalent for 'false'
  if (typeof a === "boolean" || typeof b === "boolean") {
    return !!a === !!b;
  }
  return (a ?? "") === (b ?? "");
}

// Remove all keys with undefined, null, or empty string values
export function cleanUpdateObject(obj) {
  const cleaned = {};
  for (const key in obj) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      !(typeof obj[key] === "string" && obj[key].trim() === "")
    ) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export const parsePastedJson = (str) => {
  try {
    const json = JSON.parse(str);
    return { success: true, data: json };
  } catch {
    return {
      success: false,
      error: "Invalid JSON format. Please check your pasted data.",
    };
  }
};

// Convert value to array of trimmed strings (handles array or comma-separated string, or undefined/null)
function toArr(val) {
  if (Array.isArray(val))
    return val.map((x) => (x ?? "").trim()).filter(Boolean);
  if (typeof val === "string")
    return val
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  return [];
}

// Main equality function, future-proof for new array fields too
export const areWordContentsEqual = (word1, word2) => {
  const fieldsToCompare = [
    "word",
    "meaning",
    "partOfSpeech",
    "sampleSentence",
    "tags", // You can add more array-type fields here in the future
    "mnemonic",
    "isLearned",
    "isFavorite",
    "isDifficult",
  ];

  for (const field of fieldsToCompare) {
    if (field === "tags") {
      const tags1 = toArr(word1.tags).sort();
      const tags2 = toArr(word2.tags).sort();
      if (
        tags1.length !== tags2.length ||
        !tags1.every((tag, idx) => tag === tags2[idx])
      ) {
        // Uncomment for debug:
        // console.log(`Tags differ: [${tags1}] vs [${tags2}]`);
        return false;
      }
    } else if (field === "word") {
      if (normalizeWordKey(word1) !== normalizeWordKey(word2)) {
        // Uncomment for debug:
        // console.log(`Word field differs: "${normalizeWordKey(word1)}" vs "${normalizeWordKey(word2)}"`);
        return false;
      }
    } else {
      if (!eqScalar(word1[field], word2[field])) {
        // Uncomment for debug:
        // console.log(`Field "${field}" differs: "${word1[field]}" vs "${word2[field]}"`);
        return false;
      }
    }
  }
  return true;
};
