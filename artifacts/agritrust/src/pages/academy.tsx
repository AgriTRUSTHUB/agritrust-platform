import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListCourses, useListEnrollments } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Users, PlayCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Academy() {
  const { data: courses, isLoading: coursesLoading } = useListCourses();
  const { data: enrollments, isLoading: enrollLoading } = useListEnrollments();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <GradientHeading>AgriAcademy</GradientHeading>
          <p className="text-muted-foreground mt-1">Master new farming techniques and business skills.</p>
        </div>

        {enrollments && enrollments.length > 0 && (
           <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {enrollments.map(enr => (
                    <Card key={enr.id} className="border-primary/20">
                       <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="font-semibold">{enr.courseTitle}</h3>
                             <Badge variant="outline">{enr.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                             <Progress value={enr.progressPercent} className="h-2 flex-1" />
                             <span className="text-sm font-medium">{enr.progressPercent}%</span>
                          </div>
                          <Button variant="link" className="px-0 mt-2 h-auto text-primary">Resume Course &rarr;</Button>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>
        )}

        <h2 className="text-xl font-bold pt-4">Course Catalog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {coursesLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden"><Skeleton className="h-40 w-full rounded-none" /><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader></Card>
             ))
           ) : courses?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">No courses available.</div>
           ) : (
             courses?.map(course => (
               <Card key={course.id} className="overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                  <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                     {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                     ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                     )}
                     {course.isFree && <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-none">Free</Badge>}
                  </div>
                  <CardHeader className="pb-2 flex-1">
                     <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">{course.category}</div>
                     <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                     <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{course.description}</p>
                  </CardHeader>
                  <CardContent className="pb-4">
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.durationHours} hrs</div>
                        <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollmentCount}</div>
                        <div className="font-medium text-foreground">{course.level}</div>
                     </div>
                  </CardContent>
                  <CardFooter>
                     <Button className="w-full gap-2"><PlayCircle className="h-4 w-4" /> Start Learning</Button>
                  </CardFooter>
               </Card>
             ))
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}