import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://barcamp.bangsaen.org";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
