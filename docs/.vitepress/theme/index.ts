import DefaultTheme from "vitepress/theme";
import RepoCloneTabs from "./components/RepoCloneTabs.vue";
import "./custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(context) {
    DefaultTheme.enhanceApp?.(context);
    context.app.component("RepoCloneTabs", RepoCloneTabs);
  },
};
