import SectionHeader from "@/components/SectionHeader";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader
        label="About"
        title="About Me"
        description="Personal introduction, development journey, and what drives me."
      />
      <p className="text-text-secondary">
        This page is under construction. Content will be added soon.
      </p>
    </div>
  );
}
