import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Search, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  console.log(courses);
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover your next learning adventure from our extensive course
            library
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
            <Card
              key={course.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              {/* Removed the gradient div at the top */}

              <CardHeader className="flex-1">
                <div className="text-xs font-semibold text-primary mb-2">
                  {course.category}
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 mb-4">
                  {course.description}
                </CardDescription>

                {/* Image placed here - under the description */}
                <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
                  {course.image ? (
                    <Image
                      src={course.image as string}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        No image
                      </span>
                    </div>
                  )}
                  {/* Optional gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent"></div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{course._count?.lessons ?? 0} lessons</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">—</span>
                    <span className="text-sm text-muted-foreground">
                      ({course._count?.enrollments ?? 0})
                    </span>
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
  );
}
