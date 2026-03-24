// Live viewer page for a specific year
// Displays real-time session schedule with On Air and Up Next sections
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LiveViewer } from "@/components/live/live-viewer";
import {
  buildLiveViewerData,
  getPublishedLiveEventYear,
} from "@/lib/public-live-data";

export const dynamic = "force-dynamic";

interface LivePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LivePageProps): Promise<Metadata> {
  const { slug } = await params;
  const eventYear = await getPublishedLiveEventYear(slug);

  if (!eventYear) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `Live Sessions: ${eventYear.name}`,
    description: `Track real-time sessions and schedules for ${eventYear.name} at Barcamp Bangsaen.`,
    openGraph: {
      title: `Live Sessions: ${eventYear.name} | Barcamp Bangsaen`,
      description: `Track real-time sessions and schedules for ${eventYear.name}. Join the unconference!`,
      type: "website",
      images: [{ url: `/og-${slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Live Sessions: ${eventYear.name} | Barcamp Bangsaen`,
      description: `Track real-time sessions and schedules for ${eventYear.name}.`,
      images: [{ url: `/og-${slug}.png`, width: 1200, height: 630 }],
    },
  };
}

async function LivePageContent({ slug }: { slug: string }) {
  const data = await buildLiveViewerData(slug);

  if (!data) {
    notFound();
  }

  return (
    <LiveViewer
      slug={slug}
      initialData={data.schedule}
      initialStatus={data.status}
    />
  );
}

async function LivePageRouteContent({ params }: LivePageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <LivePageContent slug={slug} />;
}

function LivePageFallback() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-muted-foreground">Loading live Sessions...</p>
    </div>
  );
}

export default function LivePage({ params }: LivePageProps) {
  return (
    <div className="min-h-screen bg-[#FFFDF5] dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full max-w-[2560px]">
        <Suspense fallback={<LivePageFallback />}>
          <LivePageRouteContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
