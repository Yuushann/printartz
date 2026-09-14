/**
 * Faint, fixed photographic backdrop for content pages (/create, /gallery).
 * Heavy background overlay keeps it to a subtle texture so forms/text stay
 * fully readable. Uses free-licensed Pexels images in /public/bg.
 */
export function PageBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/90" />
    </div>
  );
}
