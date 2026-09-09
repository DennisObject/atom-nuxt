export default defineNuxtConfig({
  appConfig: {
    artwork: {
      community: "/assets/images/dusk/community_icon.png",
      leaderboard: "/assets/images/dusk/leaderboard_icon.png",
      photos: "/assets/images/dusk/camera_icon.png",
      photoAuthor: "/assets/images/dusk/author_camera_icon.png",
      news: "/assets/images/dusk/news_icon.png",
      rules: "/assets/images/dusk/exclamation-mark_icon.png",
      medals: [
        "/assets/images/dusk/leaderboard_gold_icon.png",
        "/assets/images/dusk/leaderboard_silver_icon.png",
        "/assets/images/dusk/leaderboard_bronze_icon.png",
      ],
    },
    editor: {
      fontFamily: "Nunito, sans-serif",
      dark: { background: "#2b303c", text: "#f3f4f6", link: "#ac93da" },
      light: { background: "#2b303c", text: "#f3f4f6", link: "#ac93da" },
    },
  },
});
