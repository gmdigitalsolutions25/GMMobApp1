const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// Block server-side Node.js packages from being bundled into the mobile app.
// These packages use Node.js built-ins (net, tls, crypto) not available in Hermes/Android.
config.resolver = config.resolver || {};
config.resolver.blockList = [
  /node_modules\/postgres\/.*/,
  /node_modules\/drizzle-orm\/.*/,
  /node_modules\/bcryptjs\/.*/,
  /node_modules\/hono\/.*/,
  /node_modules\/@trpc\/server\/.*/,
  // Block the entire backend directory from the client bundle
  /.*\/backend\/.*/,
  /.*\/db\/index\.ts/,
  /.*\/db\/schema\.ts/,
  /.*\/db\/seed\.ts/,
];

module.exports = config;
