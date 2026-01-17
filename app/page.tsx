import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookOpen, Users, Award, Clock, Star, ArrowRight } from "lucide-react"
import Image from 'next/image';

export default function LandingPage() {
  // Define courses array outside the JSX
  const courses = [
    {
      title: "Web Development Fundamentals",
      description: "Learn HTML, CSS, and JavaScript from scratch",
      lessons: 24,
      duration: "8 hours",
      students: 1234,
      rating: 4.8,
      image: "/images/courses/web_dev.jpg", // Fixed path to use /images
    },
    {
      title: "Data Science with Python",
      description: "Master data analysis and machine learning",
      lessons: 32,
      duration: "12 hours",
      students: 892,
      rating: 4.9,
      image: "/image/courses/data.jpg", // Fixed path to use /images
    },
    {
      title: "Digital Marketing Mastery",
      description: "Complete guide to online marketing strategies",
      lessons: 18,
      duration: "6 hours",
      students: 756,
      rating: 4.7,
      image: "/image/courses/marketing.jpg", // Fixed path to use /images
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Learn Anytime, Learn Anywhere
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Access thousands of courses. Build your skills, advance your career, and
                achieve your learning goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button> 
               
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl"></div>
                
                {/* Using local file from public/images/courses/ */}
                <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                  <Image
                    src="/images/courses/platform.jpg"  // Fixed path
                    alt="Students learning"
                    width={600}
                    height={400}
                    className="rounded-2xl object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillHub?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Diverse Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access a wide range of courses across multiple disciplines and skill levels
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Learn from industry professionals with years of real-world experience</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Learn at Your Pace</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Study whenever and wherever you want with lifetime access to courses</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Earn Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Receive verified certificates upon completion to showcase your achievements
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Courses</h2>
              <p className="text-muted-foreground">Start learning with our most popular courses</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/courses">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Using Next.js Image component */}
                <div className="relative w-full h-48">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{course.lessons} lessons</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{course.rating}</span>
                      <span className="text-sm text-muted-foreground">({course.students})</span>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${index + 1}`}>View Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Join thousands of satisfied learners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Abebe demerw",
                role: "Software Engineer",
                content:
                  "LearnHub helped me transition into tech. The courses are well-structured and the instructors are amazing!",
                rating: 5,
              },
              {
                name: "Natnael",
                role: "Data Analyst",
                content:
                  "The flexibility to learn at my own pace while working full-time was exactly what I needed. Highly recommend!",
                rating: 5,
              },
              {
                name: "samuel Naol",
                role: "Marketing Manager",
                content:
                  "I've completed 5 courses so far and each one has directly impacted my career growth. Worth every penny!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardDescription className="text-base">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-12 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of students and start your learning journey today</p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Get Started for Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}