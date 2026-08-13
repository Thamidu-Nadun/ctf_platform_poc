import express from "express";
import instanceService from "./service/instance.service.js";
import { getDocker } from "./config/config.js";

async () => {
  try {
    await getDocker();
    console.log("Docker initialized successfully");
  } catch (error) {
    console.error("Error initializing Docker:", error);
    process.exit(1);
  }
};

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to the CTF Gateway!");
});

app.use(instanceService);

app.listen(3000, () => {
  console.log("Gateway is running on port 3000");
});
