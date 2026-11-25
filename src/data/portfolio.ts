import {
  CapabilityModule,
  type Skill,
  type SkillLevel,
} from "@/domain/capability-module";
import { CapabilityRegistry } from "@/domain/capability-registry";
import {
  Project,
  type MediaType,
  type ProjectMedia,
  type ProjectStatus,
} from "@/domain/project";
import { ProjectRepository } from "@/domain/project-repository";

// Keep the existing data import path working for type-only consumers.
export type {
  CapabilityModule,
  MediaType,
  Project,
  ProjectMedia,
  ProjectStatus,
  Skill,
  SkillLevel,
};
export type SkillGroup = CapabilityModule;

export const siteConfig = {
  name: "LIN.",
  title: "LIN / JAZON — Creative Developer & Problem Solver",
  description:
    "Portfolio of Lin — Creative Developer & Problem Solver building useful, creative, and meaningful digital experiences.",
  url: "https://linjazon.dev",
  author: "Lin",
};

export const navLinks = [
  { label: "Home", href: "/#portfolio-hub" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Contact", href: "/#contact" },
] as const;

/* ── Projects ─────────────────────────────────────────────── */

export const projectRepository = new ProjectRepository(
  [
    new Project({
      id: "tcgc-student-master",
      title: "TCGC Student Master",
      description:
        "A student productivity and academic management application built for tracking coursework, schedules, and institutional workflows.",
      category: "Mobile Application",
      tags: ["Flutter", "Dart"],
      status: "In Development",
      media: [
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/01-dashboard.png",
          alt: "Home workspace showing upcoming classes, calendar, notes and alerts",
          label: "Dashboard",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/02-calendar.png",
          alt: "Monthly class and special-date calendar with selected day schedule",
          label: "Calendar",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/03-class-schedule.png",
          alt: "Weekly class schedule listing subjects, rooms, days and times",
          label: "Class schedule",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/04-notes.png",
          alt: "Notes list with categories, search and attachment controls",
          label: "Notes",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/05-study-tools.png",
          alt: "Calculator, fraction calculator, and number system converter tools",
          label: "Study tools",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/06-special-dates.png",
          alt: "Saved dates, event cards and add-date action",
          label: "Special dates",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/07-appearance-settings.png",
          alt: "Theme modes and selectable color accents",
          label: "Appearance",
          width: 572,
          height: 1144,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/tcgc-student-master/gallery-clean/08-splash-screen.png",
          alt: "TCGC Student Master app splash screen",
          label: "Splash screen",
          width: 572,
          height: 1144,
        },
      ],
    }),
    new Project({
      id: "jazon-collective-market",
      title: "Jazon Collective Market",
      description:
        "A digital marketplace platform designed for creative collectives to showcase and sell their work.",
      category: "Web Application",
      tags: ["Next.js", "TypeScript", "Tailwind CSS"],
      status: "In Development",
      media: [],
    }),
    new Project({
      id: "blazingheart",
      title: "BlazingHeart",
      description:
        "A 2D platformer game built with Unity and C#.",
      category: "Game Development",
      tags: ["Unity", "C#"],
      status: "In Development",
      media: [
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/01-main-menu-concept.png",
          alt: "Illustrated BlazingHeart main-menu concept, not a verified running-game screenshot",
          label: "Main menu concept",
          width: 1280,
          height: 720,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/02-dragon-boss-scene-concept.png",
          alt: "Illustrated BlazingHeart dragon boss-scene concept, not verified gameplay",
          label: "Dragon boss concept",
          width: 1280,
          height: 720,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/03-fireball-scene-view.png",
          alt: "Unity Scene view showing BlazingHeart projectile development with editor gizmos visible",
          label: "Fireball — Scene view",
          width: 746,
          height: 308,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/04-game-over-game-view.png",
          alt: "Unity Game view showing the BlazingHeart game-over screen",
          label: "Game over — Game view",
          width: 785,
          height: 334,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/05-castle-development.png",
          alt: "BlazingHeart development capture showing a castle scene and character sprites",
          label: "Castle development",
          width: 1103,
          height: 469,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/06-grassland-level-layout.png",
          alt: "Unity Scene view showing a BlazingHeart grassland level layout during development",
          label: "Grassland — Scene view",
          width: 747,
          height: 313,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/07-floating-platforms.png",
          alt: "Unity Scene view showing BlazingHeart floating-platform placement during development",
          label: "Floating platforms — Scene view",
          width: 747,
          height: 313,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/08-platform-bridge.png",
          alt: "Unity Scene view showing a BlazingHeart platform-bridge layout during development",
          label: "Platform bridge — Scene view",
          width: 747,
          height: 313,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/09-extended-bridge.png",
          alt: "Unity Scene view showing a BlazingHeart extended-bridge layout during development",
          label: "Extended bridge — Scene view",
          width: 747,
          height: 313,
        },
        {
          type: "image",
          src: "/images/projects/approved-assets-20261124/blazingheart/gallery-clean/10-lava-hazard-layout.png",
          alt: "Unity Scene view showing a BlazingHeart lava-hazard layout during development",
          label: "Lava hazards — Scene view",
          width: 747,
          height: 313,
        },
      ],
    }),
    new Project({
      id: "jay-the-barber",
      title: "Jay the Barber",
      description:
        "A modern booking and portfolio website for a barbershop, featuring appointment scheduling and service showcases.",
      category: "Web Application",
      tags: ["React", "CSS", "JavaScript"],
      status: "Completed",
      media: [],
    }),
    new Project({
      id: "academic-projects",
      title: "Academic Projects",
      description:
        "A collection of coursework and academic projects demonstrating foundational development skills.",
      category: "Academic",
      tags: ["HTML", "CSS", "JavaScript", "Python"],
      status: "Case Study",
      media: [],
    }),
  ],
  {
    featuredIds: [
      "tcgc-student-master",
      "jazon-collective-market",
      "blazingheart",
    ],
  }
);

export const projects = projectRepository.all();
export const featuredProjects = projectRepository.featured();

/**
 * Serializable navigation links derived from `featuredProjects` only — the
 * single source of truth for the Projects disclosure. No duplicated project
 * literals live here.
 */
export const featuredProjectLinks = featuredProjects.map((project) => ({
  id: project.id,
  title: project.title,
  href: `/#${project.id}`,
}));

/* ── Skills ───────────────────────────────────────────────── */

export const capabilityRegistry = new CapabilityRegistry([
  new CapabilityModule({
    id: "frontend-development",
    moduleIndex: "MOD-01",
    category: "Frontend Development",
    skills: [
      { name: "HTML", level: "Comfortable" },
      { name: "CSS", level: "Comfortable" },
      { name: "JavaScript", level: "Comfortable" },
      { name: "TypeScript", level: "Familiar" },
      { name: "React", level: "Familiar" },
      { name: "Next.js", level: "Familiar" },
      { name: "Tailwind CSS", level: "Familiar" },
    ],
  }),
  new CapabilityModule({
    id: "programming-languages",
    moduleIndex: "MOD-02",
    category: "Programming Languages",
    skills: [
      { name: "C", level: "Familiar" },
      { name: "C++", level: "Familiar" },
      { name: "C#", level: "Familiar" },
    ],
  }),
  new CapabilityModule({
    id: "backend-database-tools",
    moduleIndex: "MOD-03",
    category: "Backend & Databases",
    skills: [
      { name: "Supabase", level: "Familiar" },
      { name: "SQLite", level: "Familiar" },
      { name: "MySQL", level: "Familiar" },
      { name: "XAMPP (local environment)", level: "Familiar" },
    ],
  }),
  new CapabilityModule({
    id: "mobile-development",
    moduleIndex: "MOD-04",
    category: "Mobile Development",
    skills: [
      { name: "Flutter", level: "Familiar" },
      { name: "Dart", level: "Familiar" },
    ],
  }),
  new CapabilityModule({
    id: "game-development",
    moduleIndex: "MOD-05",
    category: "Game Development",
    skills: [
      { name: "Unity", level: "Familiar" },
      { name: "Roblox Studio", level: "Familiar" },
      { name: "C#", level: "Familiar" },
    ],
  }),
  new CapabilityModule({
    id: "creative-development-tools",
    moduleIndex: "MOD-06",
    category: "Development & Creative Tools",
    skills: [
      { name: "Git", level: "Comfortable" },
      { name: "GitHub", level: "Comfortable" },
      { name: "VS Code", level: "Comfortable" },
      { name: "OpenCode", level: "Familiar" },
      { name: "Claude Code", level: "Familiar" },
    ],
  }),
]);

export const skillGroups = capabilityRegistry.all();

/* ── About ────────────────────────────────────────────────── */

export const aboutIdentity = [
  { label: "REAL NAME", value: "John Lin C. Redido" },
  { label: "AGE", value: "20" },
  { label: "GENDER", value: "Male" },
  { label: "LOCATION", value: "Purok 8, Lapasan, Clarin, Misamis Occidental" },
] as const;

export const about = {
  headline: "About Me",
  intro:
    "I'm Lin, a student developer and digital creator who enjoys building useful and creative digital experiences. I care about clean design, thoughtful code, and continuous learning.",
  journey:
    "My journey started with curiosity about how websites and apps are made. Over time, that curiosity grew into hands-on projects across web, mobile, and game development. Every project teaches me something new about problem-solving and design.",
  education: "Add school and course",
  interests: [
    "Web Development",
    "UI/UX Design",
    "Game Development",
    "Creative Technology",
    "Open Source",
    "AI Engineering",
    "AI Influencer",
    "Video Editing",
  ],
  strengths: [
    "Problem Solving",
    "Creative Thinking",
    "Attention to Detail",
    "Self-Directed Learning",
    "Collaboration",
  ],
  learning: [
    "Advanced TypeScript Patterns",
    "System Design",
    "3D Modeling with Blender",
    "Cloud Architecture",
  ],
  values: [
    "Craftsmanship in code and design",
    "Honesty about skills and progress",
    "Continuous improvement",
    "Building things that matter",
  ],
  careerGoals:
    "I aim to grow into a versatile developer who bridges design and engineering, creating digital products that are functional, beautiful, and accessible.",
};

/* ── Social / Contact ─────────────────────────────────────── */

export const socialLinks = [
  { label: "GitHub", url: "https://github.com/jazon123xbx" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/john-lin-redido-198328428/?isSelfProfile=true" },
  { label: "Email", url: "mailto:linredido@gmail.com" },
] as const;

export const contactMethods = [
  { label: "Email", value: "linredido@gmail.com", href: "mailto:linredido@gmail.com" },
  { label: "Facebook", value: "facebook.com/linzy12x", href: "https://www.facebook.com/linzy12x" },
  { label: "GitHub", value: "github.com/jazon123xbx", href: "https://github.com/jazon123xbx" },
  { label: "LinkedIn", value: "John Lin Redido", href: "https://www.linkedin.com/in/john-lin-redido-198328428/?isSelfProfile=true" },
  { label: "WhatsApp", value: "0997 823 3534", href: "https://wa.me/639978233534" },
  { label: "Backup Number", value: "0970 045 5407", href: "tel:+639700455407" },
] as const;
