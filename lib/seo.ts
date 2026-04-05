import { existsSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_OG_IMAGE = "/og-barcamp-bangsaen-4-2026.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 628;
export const DEFAULT_OG_IMAGE_ALT = "Barcamp Bangsaen #4 2026";

interface OgImageOptions {
  alt?: string;
  slug?: string;
}

export function getOgImage({ alt, slug }: OgImageOptions = {}) {
  if (slug) {
    const slugImage = `/og-${slug}.png`;
    const slugImagePath = join(process.cwd(), "public", `og-${slug}.png`);

    if (existsSync(slugImagePath)) {
      return {
        alt: alt ?? DEFAULT_OG_IMAGE_ALT,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        url: slugImage,
        width: DEFAULT_OG_IMAGE_WIDTH,
      };
    }
  }

  return {
    alt: alt ?? DEFAULT_OG_IMAGE_ALT,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    url: DEFAULT_OG_IMAGE,
    width: DEFAULT_OG_IMAGE_WIDTH,
  };
}
