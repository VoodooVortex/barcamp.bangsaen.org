"use client";

import { motion } from "framer-motion";
import { Mic2, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    Icon: Mic2,
    title: "Propose & Present",
    description:
      "Anyone can be a speaker! Write your topic on the board, vote together and take the stage.",
    accent: "sunset-orange",
  },
  {
    Icon: Users,
    title: "Connect & Network",
    description:
      "Students, alumni, professionals and experts meet by the sea. Tech or non-tech — everyone is welcome.",
    accent: "ocean",
  },
  {
    Icon: Sparkles,
    title: "Learn & Grow",
    description:
      "Diverse sessions from code to business, design and soft skills. Something for everyone all day long.",
    accent: "sunset-coral",
  },
] as const;

const accentMap = {
  "sunset-orange": {
    bg: "bg-sunset-orange/10",
    text: "text-sunset-orange",
  },
  ocean: {
    bg: "bg-ocean/10",
    text: "text-ocean",
  },
  "sunset-coral": {
    bg: "bg-sunset-coral/10",
    text: "text-sunset-coral",
  },
} as const;

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
            What to Expect
          </Badge>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            The Unconference Experience
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            No fixed agenda. No keynote speakers. You shape the event.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const colors = accentMap[feature.accent];
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-shadow duration-200 flex items-start gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
                >
                  <feature.Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-normal text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
