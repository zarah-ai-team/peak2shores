/**
 * next/image loader for the static build (`npm run build:static`).
 *
 * A static host has no server to resize photographs on request, so
 * scripts/build-static.mjs writes every size ahead of time to
 * `/_img<original path>.<width>.webp` and this maps each request onto that
 * file. The widths asked for are exactly the `deviceSizes` and `imageSizes`
 * the static config sets in next.config.mjs, so every address exists.
 *
 * Vector files and anything not served from this site pass through untouched.
 */
export default function staticImageLoader({ src, width }: { src: string; width: number }): string {
  if (!src.startsWith('/') || !/\.(jpe?g|png|webp|avif)$/i.test(src)) return src;
  return `/_img${src}.${width}.webp`;
}
