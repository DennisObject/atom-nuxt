<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string | null;
  icon?: string;
}>();
const backgroundIcon = computed(() => props.icon?.endsWith("-icon"));
</script>
<template>
  <section class="card">
    <header class="card-heading">
      <div v-if="icon" class="card-icon" :class="backgroundIcon ? icon : ''">
        <img
          v-if="!backgroundIcon"
          :src="`/assets/images/dusk/${icon}.png`"
          alt=""
        />
      </div>
      <div>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </header>
    <div class="card-body"><slot /></div>
  </section>
</template>
