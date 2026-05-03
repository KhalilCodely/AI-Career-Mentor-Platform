export type RoadmapStep = {
  phase: string;
  focus: string;
  skills: string[];
  aiRecommendations: Array<{
    type: "skill" | "course" | "career";
    title: string;
    url: string;
    reason: string;
  }>;
};

export type CareerPathTemplate = {
  title: string;
  description: string;
  roadmap: RoadmapStep[];
};

const defaultProviders = {
  skill: "https://www.coursera.org",
  course: "https://www.udemy.com",
  career: "https://roadmap.sh",
};

const careerTitles = [
  "Frontend Developer","Backend Developer","Full-Stack Developer","DevOps Engineer","Cloud Engineer","Cybersecurity Analyst","Data Analyst","Data Scientist","Machine Learning Engineer","AI Engineer","Product Manager","UX Designer","UI Designer","Mobile App Developer","Game Developer","QA Engineer","Site Reliability Engineer","Solutions Architect","Business Analyst","Digital Marketer","Content Strategist","SEO Specialist","Sales Engineer","Technical Writer","Blockchain Developer","AR/VR Developer","Embedded Systems Engineer","IoT Engineer","Network Engineer","Database Administrator","Systems Analyst","IT Support Specialist","Scrum Master","Project Manager","Robotics Engineer","Bioinformatics Analyst","FinTech Analyst","E-commerce Manager","Customer Success Manager","Software Architect"
] as const;

export const CAREER_PATH_TEMPLATES: CareerPathTemplate[] = careerTitles.map((title) => ({
  title,
  description: `Structured path to become a ${title} with hands-on projects and measurable milestones.`,
  roadmap: [
    {
      phase: "Phase 1: Foundation",
      focus: "Core fundamentals and tools",
      skills: ["Fundamentals", "Communication", "Version Control"],
      aiRecommendations: [
        { type: "skill", title: `${title} fundamentals`, url: `${defaultProviders.skill}/search?query=${encodeURIComponent(title)}`, reason: "Start with role fundamentals." },
        { type: "course", title: "Hands-on beginner course", url: `${defaultProviders.course}/courses/search/?q=${encodeURIComponent(title)}`, reason: "Build practical understanding quickly." },
        { type: "career", title: "Role roadmap", url: `${defaultProviders.career}/${title.toLowerCase().replace(/\s+/g, "-")}`, reason: "Follow a clear skill sequence." },
      ],
    },
    {
      phase: "Phase 2: Intermediate",
      focus: "Apply skills in projects",
      skills: ["Project Building", "Debugging", "Collaboration"],
      aiRecommendations: [
        { type: "skill", title: "Intermediate path", url: `${defaultProviders.skill}/search?query=intermediate+${encodeURIComponent(title)}`, reason: "Close practical knowledge gaps." },
        { type: "course", title: "Portfolio projects", url: `${defaultProviders.course}/courses/search/?q=project+${encodeURIComponent(title)}`, reason: "Create portfolio-ready outcomes." },
        { type: "career", title: "Career planning", url: "https://www.linkedin.com/learning/", reason: "Plan progression and specialization." },
      ],
    },
    {
      phase: "Phase 3: Advanced",
      focus: "Specialize and prepare for jobs",
      skills: ["Advanced Concepts", "System Thinking", "Interview Prep"],
      aiRecommendations: [
        { type: "skill", title: "Advanced specialization", url: `${defaultProviders.skill}/search?query=advanced+${encodeURIComponent(title)}`, reason: "Deepen expertise for senior roles." },
        { type: "course", title: "Capstone training", url: "https://www.edx.org/search", reason: "Validate skills through capstone work." },
        { type: "career", title: "Job prep and interview", url: "https://www.interviewing.io/", reason: "Prepare for real-world interviews." },
      ],
    },
  ],
}));

export function buildCustomRoadmap(goal: string) {
  const trimmed = goal.trim();
  return {
    title: trimmed,
    description: `Custom roadmap generated for ${trimmed}.`,
    roadmap: CAREER_PATH_TEMPLATES[0].roadmap.map((step, index) => ({
      ...step,
      phase: `Phase ${index + 1}: ${step.phase.split(": ")[1]}`,
      aiRecommendations: step.aiRecommendations.map((r) => ({
        ...r,
        title: `${trimmed} - ${r.title}`,
        url: r.url.includes("query=") ? `${r.url}+${encodeURIComponent(trimmed)}` : r.url,
      })),
    })),
  };
}
