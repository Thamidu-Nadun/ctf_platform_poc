import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import crypto from "crypto";

const instances = {
  abc123: "http://challenge-abc123:5000",
};

const app = express();

app.use("/i/:instanceId", (req, res, next) => {
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

app.listen(3000, () => {
  console.log("Gateway is running on port 3000");
});
