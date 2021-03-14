import vitePluginString from "vite-plugin-string";

export default {
  plugins: [
    vitePluginString({
      include: ["**/*.glsl"],
      exclude: "node_modules/**",
      compress: true,
    }),
  ],
};
