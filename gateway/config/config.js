import Docker from "dockerode";

export const instances = {
  abc123: "http://challenge-abc123:5000",
};

export const getDocker = async () => {
  const docker = new Docker({
    socketPath: "/var/run/docker.sock",
  });
  return docker;
};

export const challenges = ["the-endpoint", "ping_me"];
