/**
 * ProjectArtwork — reusable real-image media for all three featured projects.
 * Uses next/image with fill mode, 4:3 stable aspect, restrained border.
 */

import Image from "next/image";
import { basePath } from "@/lib/base-path";

interface ProjectArtworkImage {
  src: string;
  alt: string;
}

const imageMap: Record<string, ProjectArtworkImage> = {
  "tcgc-student-master": {
    src: "/projects/tcgc-student-master.png",
    alt: "TCGC Student Master mobile application dashboard preview",
  },
  "jazon-collective-market": {
    src: "/projects/jazon-collective-market.png",
    alt: "Jazon Collective Market digital marketplace interface preview",
  },
  blazingheart: {
    src: "/projects/blazing-heart.png",
    alt: "Blazing Heart Unity fantasy game key art",
  },
};

interface ProjectArtworkProps {
  projectId: string;
  className?: string;
}

export default function ProjectArtwork({ projectId, className = "" }: ProjectArtworkProps) {
  const image = imageMap[projectId];
  if (!image) return null;

  return (
    <div
      className={`project-artwork relative overflow-hidden rounded-[14px] border border-border-subtle bg-bg-surface ${className}`}
    >
      <Image
        src={basePath(image.src)}
        alt={image.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 58vw"
        style={{
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
        loading="lazy"
      />
    </div>
  );
}
