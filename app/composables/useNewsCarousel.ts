import type { MaybeRefOrGetter } from "vue";

export function useNewsCarousel(
  count: MaybeRefOrGetter<number>,
  autoplay = false,
) {
  const slide = ref(0);
  const hovered = ref(false);
  const focused = ref(false);
  let pointerStart: number | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;

  function move(direction: number) {
    const length = toValue(count);

    if (length < 2) {
      return;
    }

    slide.value = autoplay
      ? (slide.value + direction + length) % length
      : Math.max(0, Math.min(length - 1, slide.value + direction));
  }

  function startSwipe(event: PointerEvent) {
    pointerStart = event.clientX;
  }

  function endSwipe(event: PointerEvent) {
    if (pointerStart === undefined) {
      return;
    }

    const delta = event.clientX - pointerStart;
    pointerStart = undefined;

    if (Math.abs(delta) > 40) {
      move(delta < 0 ? 1 : -1);
    }
  }

  function leaveFocus(event: FocusEvent) {
    focused.value = (event.currentTarget as HTMLElement).contains(
      event.relatedTarget as Node | null,
    );
  }

  watch(
    () => toValue(count),
    (length) => {
      slide.value = Math.max(0, Math.min(slide.value, length - 1));
    },
  );

  onMounted(() => {
    if (autoplay) {
      timer = setInterval(() => {
        if (!hovered.value && !focused.value) {
          move(1);
        }
      }, 5000);
    }
  });

  onBeforeUnmount(() => clearInterval(timer));

  return { slide, hovered, focused, move, startSwipe, endSwipe, leaveFocus };
}
