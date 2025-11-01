const axios = require("axios");

const BASE_URL = "https://emkc.org/api/v2/piston";

/**
 * Get all available runtimes from Piston
 */
async function getRuntimes() {
  try {
    const res = await axios.get(`${BASE_URL}/runtimes`);
    return res.data;
  } catch (error) {
    console.error("Error fetching runtimes:", error.message);
    throw new Error("Failed to fetch Piston runtimes");
  }
}

/**
 * Execute code using the Piston API
 * @param {string} language - Programming language
 * @param {string} code - Source code
 * @param {string} stdin - Optional standard input
 */
async function executeCode(language, code, stdin = "") {
  try {
    const response = await axios.post(`${BASE_URL}/execute`, {
      language,
      version: "*",
      files: [{ name: "main", content: code }],
      stdin,
    });

    const run = response.data.run;
    return {
      success: true,
      output: run.output,
      stderr: run.stderr,
      time: run.time,
      memory: run.memory,
    };
  } catch (err) {
    console.error("Piston execution error:", err.message);
    return {
      success: false,
      output: err.response?.data?.message || "Execution failed",
    };
  }
}

module.exports = { getRuntimes, executeCode };
