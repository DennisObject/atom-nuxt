export default defineNuxtConfig({
  appConfig: {
    artwork: {
      community: "/assets/images/icons/feeds.png",
      leaderboard: "/assets/images/leaderboards/trophy-gold.png",
      photos: "/assets/images/atom/icons/camera.png",
      photoAuthor: "/assets/images/atom/icons/camera.png",
      news: "/assets/images/icons/article.gif",
      rules: "/assets/images/icons/lighthouse.png",
      medals: [
        "/assets/images/leaderboards/trophy-gold.png",
        "/assets/images/leaderboards/trophy-silver.png",
        "/assets/images/leaderboards/trophy-bronze.png",
      ],
    },
    editor: {
      fontFamily: "Poppins, sans-serif",
      dark: { background: "#1f2937", text: "#e5e7eb", link: "#53b2f8" },
      light: { background: "#ffffff", text: "#374151", link: "#25658d" },
    },
  },
});
