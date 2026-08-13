import { Router } from "express";
import { instances, challenges } from "../config/config.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import crypto from "crypto";
import { getDocker } from "../config/config.js";

const router = Router();

/**
 * GET /i/:instanceId/*
 * Proxies requests to the target instance based on the instanceId.
 * If the instanceId is not found, returns a 404 error.
 *
 * @param {string} instanceId - The ID of the instance to proxy to.
 */
router.use("/i/:instanceId", (req, res, next) => {
  const { instanceId } = req.params;

  if (!instanceId) {
    return res.status(404).send("Instance not found");
  }

  const target = instances[instanceId];
  if (!target) {
    return res.status(404).send("Instance not found");
  }

  console.log(`Proxying ${instanceId} -> ${target}`);

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/i/${instanceId}`]: "",
    },
  })(req, res, next);
});

/**
 * POST /c/:challengeId
 * Creates a new instance/container for the given challengeId.
 * If the challengeId is not found, returns a 404 error.
 *
 * @param {string} challengeId - The ID of the challenge to create an instance for.
 */
router.post("/c/:challengeId", async (req, res) => {
  const { challengeId } = req.params;

  if (!challengeId) {
    return res.status(404).send("Challenge not found");
  }

  if (!challenges.includes(challengeId)) {
    return res.status(404).send("Challenge not found");
  }

  const instanceId = crypto.randomUUID().toString();
  const containerName = `challenge-${instanceId}`;

  try {
    const docker = await getDocker();
    const container = await docker.createContainer({
      Image: `${challengeId}:latest`,
      name: containerName,
      HostConfig: {
        NetworkMode: "ctf_network",
      },
    });
    await container.start();

    instances[instanceId] = `http://${containerName}:5000`;
    res.status(201).json({
      instanceId,
      containerName,
      url: `http://localhost:3000/i/${instanceId}`,
    });
  } catch (error) {
    console.error("Error creating instance:", error);
    res.status(500).send("Error creating instance");
  }
});

/**
 * DELETE /c/:instanceId
 * Deletes the instance/container with the given instanceId.
 * If the instanceId is not found, returns a 404 error.
 *
 * @param {string} instanceId - The ID of the instance to delete.
 */
router.delete("/c/:instanceId", async (req, res) => {
  const { instanceId } = req.params;
  if (!instanceId) return res.status(404).send("Instance ID is required!");

  const instance = instances[instanceId];
  if (!instance) return res.status(404).send("Instance is not found!");

  try {
    const docker = await getDocker();
    const containerName = `challenge-${instanceId}`;
    const container = docker.getContainer(containerName);

    // stop the container
    await container.stop();

    // remove the container
    await container.remove();

    delete instances[instanceId];

    res.status(200).send(`Successfully removed the ${containerName}`);
  } catch (error) {
    console.log("Error deleting instance", error);
    res.status(500).send("Error deleting instance");
  }
});

export default router;
