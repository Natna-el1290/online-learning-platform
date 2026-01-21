import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Target,
  Users,
  Award,
  Heart,
  Globe,
  BookOpen,
  Zap,
  Shield,
  Code,
  Database,
  PenTool,
  BarChart,
  FileText,
  Cpu,
} from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Mulualem Adisu",
      role: "Fullstack Developer & Project Lead",
      education: "Computer Science Student",
      description:
        "Architect of the SkillHub platform, specializing in modern web technologies and system design. Leads the technical direction and ensures seamless integration across all components.",
      expertise: [
        "React/Next.js",
        "TypeScript",
        "System Architecture",
        "DevOps",
      ],
      icon: <Code className="w-6 h-6" />,
      color: "bg-blue-500/10 text-blue-700",
    },
    {
      name: "Natinael Niguse",
      role: "Frontend Engineer",
      education: "Computer Science Engineer",
      description:
        "Crafts intuitive and responsive user interfaces with a focus on accessibility and user experience. Implements modern design systems and interactive components.",
      expertise: [
        "UI/UX Design",
        "React Components",
        "Responsive Design",
        "Animation",
      ],
      icon: <PenTool className="w-6 h-6" />,
      color: "bg-purple-500/10 text-purple-700",
    },
    {
      name: "Natinael Negash",
      role: "Backend Engineer",
      education: "Computer Science Engineer",
      description:
        "Builds robust server-side architectures and APIs. Specializes in database design, authentication systems, and performance optimization for scalable applications.",
      expertise: [
        "Node.js/Express",
        "PostgreSQL",
        "REST APIs",
        "Authentication",
      ],
      icon: <Database className="w-6 h-6" />,
      color: "bg-green-500/10 text-green-700",
    },
    {
      name: "Naol Endale",
      role: "Documentation & Requirements Engineer",
      education: "Computer Science Student",
      description:
        "Translates complex requirements into clear documentation and user stories. Ensures project specifications are accurately captured and maintained throughout development.",
      expertise: [
        "Technical Writing",
        "Requirements Analysis",
        "User Stories",
        "Project Documentation",
      ],
      icon: <FileText className="w-6 h-6" />,
      color: "bg-amber-500/10 text-amber-700",
    },
    {
      name: "Nahunda Bekele",
      role: "Data Modeling & Analysis Specialist",
      education: "Computer Science Student",
      description:
        "Designs efficient data structures and analytical models. Focuses on data integrity, relationships, and creating insights from complex datasets.",
      expertise: [
        "Data Modeling",
        "SQL Optimization",
        "Analytics",
        "System Analysis",
      ],
      icon: <BarChart className="w-6 h-6" />,
      color: "bg-indigo-500/10 text-indigo-700",
    },
    {
      name: "Tesfish",
      role: "Quality Assurance & Testing Engineer",
      education: "Computer Science Student",
      description:
        "Ensures platform reliability through comprehensive testing strategies. Specializes in automated testing, bug tracking, and quality control processes.",
      expertise: [
        "Test Automation",
        "Quality Assurance",
        "Bug Tracking",
        "Performance Testing",
      ],
      icon: <Shield className="w-6 h-6" />,
      color: "bg-red-500/10 text-red-700",
    },
    {
      name: "Hellen",
      role: "Systems Analyst & Process Engineer",
      education: "Computer Science Student",
      description:
        "Analyzes system workflows and optimizes processes. Bridges the gap between technical requirements and business objectives for efficient solutions.",
      expertise: [
        "Process Analysis",
        "Workflow Optimization",
        "System Design",
        "Technical Analysis",
      ],
      icon: <Cpu className="w-6 h-6" />,
      color: "bg-pink-500/10 text-pink-700",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            About SkillHub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
            We're on a mission to make quality education accessible to everyone,
            anywhere, anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Founded by Students
            </span>
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
              For Students
            </span>
            <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
              Global Impact
            </span>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="mb-16 border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed text-lg">
              At SkillHub, we believe that education is the key to unlocking
              human potential. Our platform connects learners with expert
              instructors from around the world, providing high-quality courses
              that empower individuals to achieve their personal and
              professional goals.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Global Accessibility
                </h3>
                <p className="text-muted-foreground text-sm">
                  Breaking geographical barriers to provide world-class
                  education to learners everywhere, regardless of location.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Lifelong Learning
                </h3>
                <p className="text-muted-foreground text-sm">
                  Creating opportunities for continuous growth and skill
                  development at every stage of life and career.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We strive for the highest quality in every course and learning
                  experience, ensuring measurable outcomes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Building a supportive global community where learners and
                  educators collaborate and grow together.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Celebrating every milestone and success on your learning
                  journey with recognition and rewards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Passion</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Driven by our love for education and unwavering commitment to
                  every learner's success.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A dedicated team of Computer Science students and engineers
              passionate about transforming education through technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${member.color}`}
                    >
                      {member.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {member.role}
                      </CardDescription>
                      <span className="text-xs text-primary font-medium">
                        {member.education}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="text-xs px-2 py-1 bg-muted rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Development Philosophy */}
        <Card className="mb-16 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-0">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Our Development Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">User-Centric Design</h3>
                <p className="text-muted-foreground">
                  Every feature is built with the learner in mind, ensuring
                  intuitive navigation and accessible interfaces.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Scalable Architecture</h3>
                <p className="text-muted-foreground">
                  Built on modern, scalable technologies to support growth and
                  adapt to evolving educational needs.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Continuous Innovation</h3>
                <p className="text-muted-foreground">
                  Regular updates and improvements based on user feedback and
                  emerging educational technologies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl p-8 md:p-12 text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary mb-2">
                10,000+
              </div>
              <p className="text-muted-foreground font-medium">
                Active Students
              </p>
              <p className="text-xs text-muted-foreground">
                From 50+ countries
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground font-medium">
                Expert Instructors
              </p>
              <p className="text-xs text-muted-foreground">
                Industry professionals
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <p className="text-muted-foreground font-medium">
                Courses Available
              </p>
              <p className="text-xs text-muted-foreground">
                Across 15+ categories
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground font-medium">
                Satisfaction Rate
              </p>
              <p className="text-xs text-muted-foreground">
                Based on learner feedback
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="text-center border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">
              Join Our Learning Community
            </CardTitle>
            <CardDescription>
              Start your learning journey today or share your expertise with
              others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/courses"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Browse Courses
              </a>
              <a
                href="/instructor"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                Become an Instructor
              </a>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
