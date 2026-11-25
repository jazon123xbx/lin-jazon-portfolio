/**
 * Home page composition. Data is loaded once here and passed down as props,
 * keeping each section presentational and easy to reorder.
 */
import {
  about,
  aboutIdentity,
  contactMethods,
  featuredProjects,
  siteConfig,
  skillGroups,
} from "@/data/portfolio";
import HomeEntryShell from "@/components/HomeEntryShell";
import SystemThread from "@/components/SystemThread";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import CapabilitiesSection from "@/components/sections/CapabilitiesSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <HomeEntryShell>

      <AboutSection
        about={about}
        identity={aboutIdentity}
        author={siteConfig.author}
      />

      <SystemThread />

      <ProjectsSection projects={featuredProjects} />

      <SystemThread />

      <CapabilitiesSection modules={skillGroups} />

      <SystemThread />

      <ContactSection methods={contactMethods} />
    </HomeEntryShell>
  );
}
