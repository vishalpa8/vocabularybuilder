import axios from "axios";

/**
 * Fetches basic dictionary data for a given word.
 * @param {string} word
 * @returns {Promise<{
 *   meaning: string,
 *   partOfSpeech: string,
 *   sampleSentence: string
 * }>}
 */
export const fetchWordData = async (word) => {
  if (!word || typeof word !== "string" || !word.trim()) {
    throw new Error("Please enter a valid word.");
  }

  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word.trim()
      )}`
    );

    const entry = response.data?.[0];
    const firstMeaning = entry?.meanings?.[0];
    const definitions = firstMeaning?.definitions || [];
    const firstDefinition = definitions[0];

    if (!firstDefinition) {
      throw new Error("No valid definition found for this word.");
    }

    // Find the first sample sentence from any definition
    let sampleSentence = "";
    for (const def of definitions) {
      if (def.example || def.sentence) {
        sampleSentence = def.example || def.sentence;
        break;
      }
    }

    return {
      meaning: firstDefinition.definition || "",
      partOfSpeech: firstMeaning.partOfSpeech
        ? firstMeaning.partOfSpeech.charAt(0).toUpperCase() +
          firstMeaning.partOfSpeech.slice(1)
        : "Unknown",
      sampleSentence,
    };
  } catch (error) {
    if (error.response?.status === 404 && error.response?.data?.message) {
      throw new Error(JSON.stringify({ message: error.response.data.message }));
    }

    throw new Error("Failed to fetch data for the word.");
  }
};
