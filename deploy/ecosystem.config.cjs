const appDir = process.env.APP_DIR || "/opt/ai-model-registry";

module.exports = {
  apps: [
    {
      name: "ai-model-registry-server",
      cwd: `${appDir}/server`,
      script: "index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
