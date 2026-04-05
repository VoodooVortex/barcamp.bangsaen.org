// Live viewer page for a specific year
// Displays real-time session schedule with On Air and Up Next sections
import { Suspense } from "react";
import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LiveViewer } from "@/components/live/live-viewer";
import { getOgImage } from "@/lib/seo";
import {
  buildLiveViewerData,
  getPublishedLiveEventYear,
  type PublicLiveStatusData,
} from "@/lib/public-live-data";

export const dynamic = "force-dynamic";

interface LivePageProps {
  params: Promise<{ slug: string }>;
}

type LiveViewerStatus = ComponentProps<typeof LiveViewer>["initialStatus"];

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

  const ogImage = getOgImage({
    alt: `${eventYear.name} share image`,
    slug,
  });

  return {
    title: `Live Sessions: ${eventYear.name}`,
    description: `Track real-time sessions and schedules for ${eventYear.name} at Barcamp Bangsaen.`,
    openGraph: {
      url: `/live/${slug}`,
      title: `Live Sessions: ${eventYear.name} | Barcamp Bangsaen`,
      description: `Track real-time sessions and schedules for ${eventYear.name}. Join the unconference!`,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `Live Sessions: ${eventYear.name} | Barcamp Bangsaen`,
      description: `Track real-time sessions and schedules for ${eventYear.name}.`,
      images: [ogImage.url],
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
      initialStatus={normalizeLiveViewerStatus(data.status)}
    />
  );
}

function normalizeLiveViewerStatus(
  status: PublicLiveStatusData,
): LiveViewerStatus {
  return {
    ...status,
    onAir: status.onAir.map(({ livestreamUrl, ...session }) => ({
      ...session,
      livestreamUrl: livestreamUrl ?? undefined,
      progress: session.progress ?? 0,
    })),
    upNext: status.upNext.map((session) => ({
      ...session,
      startsIn: session.startsIn ?? "",
    })),
  };
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
