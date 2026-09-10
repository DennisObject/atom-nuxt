export async function renderLogo(
  letters: string[],
  font: string,
): Promise<HTMLCanvasElement> {
  const images = await Promise.all(
    letters.map(
      (letter) =>
        new Promise<HTMLImageElement | null>((resolve, reject) => {
          if (letter === " ") {
            resolve(null);

            return;
          }

          const image = new Image();

          image.onload = () => resolve(image);

          image.onerror = () =>
            reject(new Error("A logo letter could not be loaded."));

          image.src = `/assets/images/logo-generator/${font}/${letter}.png`;
        }),
    ),
  );

  const canvas = document.createElement("canvas");

  canvas.width = Math.max(
    1,
    images.reduce((sum, image) => sum + (image?.width || 15), 0) +
      Math.max(0, images.length - 1) * 2,
  );

  canvas.height = Math.max(1, ...images.map((image) => image?.height || 0));

  const context = canvas.getContext("2d");

  let left = 0;

  for (const image of images) {
    if (image) {
      context?.drawImage(image, left, canvas.height - image.height);
    }

    left += (image?.width || 15) + 2;
  }

  return canvas;
}
