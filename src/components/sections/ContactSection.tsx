/**
 * Contact section: heading plus the contact method cards.
 * The page passes the methods array so this section does not own content data.
 */
import type { ComponentProps } from "react";
import ContactIcons from "@/components/ContactIcons";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

type ContactMethods = ComponentProps<typeof ContactIcons>["methods"];

interface ContactSectionProps {
  methods: ContactMethods;
}

export default function ContactSection({ methods }: ContactSectionProps) {
  return (
    <section id="contact" className="relative border-t border-border-subtle bg-bg-surface">
      <span className="section-bg-word left-[10%] top-[10%]" aria-hidden="true">
        COMM
      </span>

      <span className="section-coord right-6 top-6" aria-hidden="true">
        SEC.04 // COMM.LINK
      </span>

      <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <SectionHeader
          label="Contact"
          title="HAVE AN IDEA?"
          description="Let's build something useful."
        />
        <ContactIcons methods={methods} />
      </Reveal>
    </section>
  );
}
