const mongoose = require("mongoose");
const { env } = require("./env");

const connectDatabase = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB Connected");
};

module.exports = connectDatabase;
