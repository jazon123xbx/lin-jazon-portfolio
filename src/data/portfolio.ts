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

export type ProjectStatus =
  | "Planning"
  | "In Development"
  | "Completed"
  | "Case Study";

export type MediaType = "image" | "video";

export interface ProjectMedia {
  type: MediaType;
  src: string;
  alt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: ProjectStatus;
  media: ProjectMedia[];
  detailsUrl?: string;
  sourceUrl?: string;
}

export const projects: Project[] = [
  {
    id: "tcgc-student-master",
    title: "TCGC Student Master",
    description:
      "A student productivity and academic management application built for tracking coursework, schedules, and institutional workflows.",
    category: "Mobile Application",
    tags: ["Flutter", "Dart"],
    status: "In Development",
    media: [],
  },
  {
    id: "jazon-collective-market",
    title: "Jazon Collective Market",
    description:
      "A digital marketplace platform designed for creative collectives to showcase and sell their work.",
    category: "Web Application",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "In Development",
    media: [],
  },
  {
    id: "blazingheart",
    title: "BlazingHeart",
    description:
      "A 2D platformer game built with Unity and C#.",
    category: "Game Development",
    tags: ["Unity", "C#"],
    status: "In Development",
    media: [],
  },
  {
    id: "jay-the-barber",
    title: "Jay the Barber",
    description:
      "A modern booking and portfolio website for a barbershop, featuring appointment scheduling and service showcases.",
    category: "Web Application",
    tags: ["React", "CSS", "JavaScript"],
    status: "Completed",
    media: [],
  },
  {
    id: "academic-projects",
    title: "Academic Projects",
    description:
      "A collection of coursework and academic projects demonstrating foundational development skills.",
    category: "Academic",
    tags: ["HTML", "CSS", "JavaScript", "Python"],
    status: "Case Study",
    media: [],
  },
];

export const featuredProjects = projects.filter(
  (p) =>
    p.id === "tcgc-student-master" ||
    p.id === "jazon-collective-market" ||
    p.id === "blazingheart"
);

/* ── Skills ───────────────────────────────────────────────── */

export type SkillLevel =
  | "Currently Learning"
  | "Familiar"
  | "Project Experience"
  | "Comfortable";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface SkillGroup {
  category: string;
  moduleIndex: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Frontend Development",
    moduleIndex: "MOD-01",
    skills: [
      { name: "HTML", level: "Comfortable" },
      { name: "CSS", level: "Comfortable" },
      { name: "JavaScript", level: "Comfortable" },
    ],
  },
  {
    category: "Programming Languages",
    moduleIndex: "MOD-02",
    skills: [
      { name: "C", level: "Familiar" },
      { name: "C++", level: "Familiar" },
      { name: "C#", level: "Familiar" },
    ],
  },
  {
    category: "Backend & Database Tools",
    moduleIndex: "MOD-03",
    skills: [
      { name: "SQLite", level: "Familiar" },
      { name: "MySQL", level: "Familiar" },
      { name: "XAMPP", level: "Familiar" },
    ],
  },
  {
    category: "Mobile Development",
    moduleIndex: "MOD-04",
    skills: [
      { name: "Flutter", level: "Familiar" },
      { name: "Dart", level: "Familiar" },
    ],
  },
  {
    category: "Game Development",
    moduleIndex: "MOD-05",
    skills: [
      { name: "Unity", level: "Familiar" },
      { name: "Roblox", level: "Familiar" },
      { name: "C#", level: "Familiar" },
    ],
  },
  {
    category: "Creative & Development Tools",
    moduleIndex: "MOD-06",
    skills: [
      { name: "Git", level: "Comfortable" },
      { name: "GitHub", level: "Comfortable" },
      { name: "VS Code", level: "Comfortable" },
      { name: "OpenCode", level: "Familiar" },
      { name: "Claude Code", level: "Familiar" },
    ],
  },
];

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
