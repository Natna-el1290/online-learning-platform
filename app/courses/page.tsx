import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, Star } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'; 

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      description: "Learn HTML, CSS, and JavaScript from scratch to build modern websites",
      lessons: 24,
      duration: "8 hours",
      students: 1234,
      rating: 4.8,
      category: "Development",
      image: "/image/courses/web_dev.jpg", // Added image path
    },
    {
      id: 2,
      title: "Data Science with Python",
      description: "Master data analysis, visualization, and machine learning with Python",
      lessons: 32,
      duration: "12 hours",
      students: 892,
      rating: 4.9,
      category: "Data Science",
      image: "/image/courses/data.jpg", // Added image path
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      description: "Complete guide to SEO, social media, and content marketing strategies",
      lessons: 18,
      duration: "6 hours",
      students: 756,
      rating: 4.7,
      category: "Marketing",
      image: "/image/courses/marketing.jpg", // Added image path
    },
    {
      id: 4,
      title: "UI/UX Design Principles",
      description: "Create beautiful and user-friendly interfaces with modern design tools",
      lessons: 20,
      duration: "7 hours",
      students: 654,
      rating: 4.8,
      category: "Design",
      image: "/image/courses/ux.jpg", // Added image path
    },
    {
      id: 5,
      title: "Mobile App Development",
      description: "Build native mobile applications for iOS and Android platforms",
      lessons: 28,
      duration: "10 hours",
      students: 543,
      rating: 4.6,
      category: "Development",
      image: "/image/courses/app.jpg", // Added image path
    },
    {
      id: 6,
      title: "Cloud Computing with AWS",
      description: "Learn to deploy and manage applications on Amazon Web Services",
      lessons: 26,
      duration: "9 hours",
      students: 432,
      rating: 4.7,
      category: "Cloud",
      image: "/image/courses/cloud.jpg", // Added image path
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover your next learning adventure from our extensive course library
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input placeholder="Search for courses..." className="pl-10" />
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
              {/* Removed the gradient div at the top */}
              
              <CardHeader className="flex-1">
                <div className="text-xs font-semibold text-primary mb-2">{course.category}</div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 mb-4">{course.description}</CardDescription>
                
                {/* Image placed here - under the description */}
                <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Optional gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
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
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
