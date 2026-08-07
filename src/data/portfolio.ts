export const siteConfig = {
  name: "LIN / JAZON",
  title: "LIN / JAZON — Student Developer and Digital Creator",
  description:
    "Portfolio of Lin — Student Developer and Digital Creator building useful, creative, and meaningful digital experiences.",
  url: "https://linjazon.dev",
  author: "Lin",
};

export const navLinks = [
  { label: "Home", href: "/#hero" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/#contact" },
] as const;

export type ProjectStatus =
  | "Planning"
  | "In Development"
  | "Completed"
  | "Case Study";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: ProjectStatus;
  detailsUrl?: string;
  sourceUrl?: string;
}

export const projects: Project[] = [
  {
    id: "jazon-collective-market",
    title: "Jazon Collective Market",
    description:
      "A digital marketplace platform designed for creative collectives to showcase and sell their work.",
    category: "Web Application",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "In Development",
  },
  {
    id: "jay-the-barber",
    title: "Jay the Barber",
    description:
      "A modern booking and portfolio website for a barbershop, featuring appointment scheduling and service showcases.",
    category: "Web Application",
    tags: ["React", "CSS", "JavaScript"],
    status: "Completed",
  },
  {
    id: "tcgc-student-master",
    title: "TCGC Student Master",
    description:
      "A student management and tracking application built for educational institution workflows.",
    category: "Web Application",
    tags: ["Flutter", "Dart", "Firebase"],
    status: "Planning",
  },
  {
    id: "godot-game-project",
    title: "Godot Game Project",
    description:
      "An indie game project exploring 2D gameplay mechanics and interactive storytelling using the Godot engine.",
    category: "Game Development",
    tags: ["Godot", "GDScript"],
    status: "In Development",
  },
  {
    id: "academic-projects",
    title: "Academic Projects",
    description:
      "A collection of coursework and academic projects demonstrating foundational development skills.",
    category: "Academic",
    tags: ["HTML", "CSS", "JavaScript", "Python"],
    status: "Case Study",
  },
];

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
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Frontend Development",
    skills: [
      { name: "HTML", level: "Comfortable" },
      { name: "CSS", level: "Comfortable" },
      { name: "JavaScript", level: "Comfortable" },
      { name: "TypeScript", level: "Project Experience" },
      { name: "React", level: "Project Experience" },
      { name: "Next.js", level: "Project Experience" },
      { name: "Tailwind CSS", level: "Comfortable" },
    ],
  },
  {
    category: "Backend and Database",
    skills: [
      { name: "Supabase", level: "Familiar" },
      { name: "PostgreSQL", level: "Familiar" },
      { name: "Firebase", level: "Familiar" },
    ],
  },
  {
    category: "Mobile Development",
    skills: [
      { name: "Flutter", level: "Familiar" },
      { name: "Dart", level: "Familiar" },
    ],
  },
  {
    category: "Game Development",
    skills: [
      { name: "Godot", level: "Familiar" },
      { name: "GDScript", level: "Familiar" },
    ],
  },
  {
    category: "Creative and Development Tools",
    skills: [
      { name: "Blender", level: "Currently Learning" },
      { name: "Git", level: "Comfortable" },
      { name: "GitHub", level: "Comfortable" },
      { name: "OpenCode", level: "Familiar" },
      { name: "Figma", level: "Familiar" },
    ],
  },
];

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

export const socialLinks = [
  { label: "GitHub", url: "Add GitHub URL" },
  { label: "LinkedIn", url: "Add LinkedIn URL" },
  { label: "Email", url: "mailto:Add professional email" },
] as const;
