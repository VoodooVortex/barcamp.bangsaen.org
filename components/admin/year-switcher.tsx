"use client";

import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { eventYears } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

type EventYear = InferSelectModel<typeof eventYears>;

interface YearSwitcherProps {
    years: EventYear[];
    currentSlug: string;
}

export function YearSwitcher({ years, currentSlug }: YearSwitcherProps) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Switch year</span>
            <Select
                value={currentSlug}
                onValueChange={(value) => {
                    router.push(`/admin/${value}/dashboard`);
                }}
            >
                <SelectTrigger className="w-auto min-w-[140px] max-w-[300px]">
                    <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent align="end">
                    {years.map((y) => (
                        <SelectItem key={y.id} value={y.slug}>
                            {y.slug}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
