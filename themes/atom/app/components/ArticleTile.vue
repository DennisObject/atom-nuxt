<script setup lang="ts">
import type { Data } from "~/utils/api";
const { mediaUrl } = useApi();
const { avatar, session } = useSession();
defineProps<{ article: Data<"Article">; forSlider?: boolean }>();
</script>
<template>
  <article
    class="atom-article-tile"
    :class="{ 'atom-article-slide': forSlider }"
  >
    <NuxtLink :to="`/community/article/${article.slug}`">
      <div
        class="atom-article-image"
        :style="{ backgroundImage: `url('${mediaUrl(article.image)}')` }"
      ></div>
      <div class="atom-article-caption">
        <h2>{{ article.title }}</h2>
        <div class="atom-article-author">
          <span class="atom-article-avatar"
            ><img
              :src="
                article.author?.look
                  ? `${avatar(article.author)}&headonly=1`
                  : avatar(article.author)
              "
              alt="" /></span
          ><span>{{
            article.author?.username || session.bootstrap.hotel_name
          }}</span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
