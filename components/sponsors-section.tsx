"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import sponsorsData from "@/data/sponsors.json";

interface Sponsor {
  name: string;
  logo: string;
  url?: string;
}

const sponsors: Sponsor[] = sponsorsData;

export function SponsorsSection() {
  if (sponsors.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
            Supported By
          </Badge>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            Our Sponsors
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            สนับสนุนโดย
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {sponsors.map((sponsor, i) => {
            const content = (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={120}
                  height={60}
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </motion.div>
            );

            if (sponsor.url) {
              return (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sponsor.name}
                >
                  {content}
                </a>
              );
            }

            return content;
          })}
        </div>
      </div>
    </section>
  );
}
