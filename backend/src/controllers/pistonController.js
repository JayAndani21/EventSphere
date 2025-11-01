const { getRuntimes } = require("../services/pistonService");

exports.getAvailableRuntimes = async (req, res) => {
  try {
    const runtimes = await getRuntimes();
    res.status(200).json(runtimes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch runtimes", error: error.message });
  }
};
