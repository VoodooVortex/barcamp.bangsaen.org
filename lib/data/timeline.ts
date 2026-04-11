import timelineData from "@/data/timeline.json";

export type TimelineEvent = (typeof timelineData)[number];

export const timelineEvents: TimelineEvent[] = timelineData;
