const Session = require("../../models/Session");

const createSession = async (req, res) => {
  try {
    const { text, events, analysis } = req.body;

    const session = await Session.create({
      text,
      events,
      analysis,
      userId: req.user.id
    });

    return res.json({
      message: "Session saved",
      sessionId: session._id
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createSession };
