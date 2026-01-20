import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookOpen, Users, Award, Clock, Star, ArrowRight, Play } from "lucide-react"
import Image from 'next/image';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // Fetch real courses from the database
  const dbCourses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        }
      }
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New courses available every week
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.1]">
                Master New Skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Confidence</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Unlock your potential with expert-led courses. Join thousands of learners worldwide and accelerate your career path today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" asChild>
                  <Link href={session ? "/student-dashboard" : "/signup"}>
                    {session ? "Go to Dashboard" : "Start Learning Free"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all duration-300" asChild>
                  <Link href="/courses">Explore Catalog</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-lg">10k+</span>
                  <p className="text-muted-foreground">Active Learners</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-sm">
                  <span className="font-bold text-lg">4.9/5</span>
                  <p className="text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>

            <div className="relative animate-in zoom-in-95 duration-1000 hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl opacity-30 rounded-full animate-pulse"></div>
              <div className="relative rounded-3xl border border-primary/10 shadow-2xl overflow-hidden bg-muted/20 backdrop-blur-xl aspect-[4/3]">
                <Image
                  src="/images/courses/platform.jpg"
                  alt="Learning Platform Interface"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-background/80 backdrop-blur-md border border-white/10 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground fill-current" />
                    </div>
                    <div>
                      <p className="font-bold">Next.js 14 Masterclass</p>
                      <p className="text-sm text-muted-foreground">Instructor: John Doe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Excellence in Education</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why Choose Our Platform?</h3>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              We provide a comprehensive learning ecosystem designed for impact and career growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Diverse Courses", icon: BookOpen, desc: "Access a wide range of courses across multiple disciplines and skill levels" },
              { title: "Expert Instructors", icon: Users, desc: "Learn from industry professionals with years of real-world experience" },
              { title: "Learn at Your Pace", icon: Clock, desc: "Study whenever and wherever you want with lifetime access to courses" },
              { title: "Earn Certificates", icon: Award, desc: "Receive verified certificates upon completion to showcase your achievements" }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/10 hover:bg-background hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Popular Courses</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Start your journey with our most-enrolled and highly-rated curriculum.
              </p>
            </div>
            <Button variant="outline" size="lg" asChild className="rounded-xl border-primary/20 hover:bg-primary/5">
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dbCourses.map((course) => (
              <Card key={course.id} className="group overflow-hidden border-primary/5 rounded-3xl hover:shadow-2xl transition-all duration-500 bg-background/50 backdrop-blur-sm">
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={course.image || "/images/courses/web_dev.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md text-xs font-bold text-primary border border-primary/10">
                    {course.category}
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {course._count.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-primary" />
                      {course.duration}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-base leading-relaxed mt-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= 4 ? "fill-yellow-500 text-yellow-500" : "text-muted"}`} />
                        ))}
                      </div>
                      <span className="font-bold ml-1">4.8</span>
                      <span className="text-sm text-muted-foreground">({course._count.enrollments})</span>
                    </div>
                    <Button variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" asChild>
                      <Link href={session ? `/courses/${course.id}` : "/signup"}>
                        {session ? "View Course" : "Enroll Now"}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Trusted by Students Everywhere</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of satisfied learners who have transformed their careers with us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Abebe Demerw",
                role: "Software Engineer",
                content: "The courses are incredibly well-structured. I went from zero to land my first dev job in just 6 months!",
                image: "/images/testimonials/avatar1.jpg"
              },
              {
                name: "Natnael Tadesse",
                role: "Data Analyst",
                content: "The flexibility is unmatched. I could balance my full-time job and my learning without any stress.",
                image: "/images/testimonials/avatar2.jpg"
              },
              {
                name: "Samuel Naol",
                role: "Marketing Manager",
                content: "Practical, real-world examples that I could apply immediately at my workplace. Highly recommended!",
                image: "/images/testimonials/avatar3.jpg"
              }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-muted/30 border border-primary/5 relative">
                <div className="mb-6 flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-lg italic text-foreground mb-8">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-foreground rounded-[3rem] p-12 md:p-20 text-center text-background overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-3xl -ml-32 -mb-32"></div>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">Ready to Start Your <span className="text-primary italic">Learning Journey?</span></h2>
            <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto leading-relaxed">
              Join the future of education. Get unlimited access to premium courses today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" variant="secondary" className="h-16 px-10 text-xl rounded-2xl" asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-2xl border-white/20 hover:bg-white/5" asChild>
                <Link href="/contact">Talk to an Advisor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}