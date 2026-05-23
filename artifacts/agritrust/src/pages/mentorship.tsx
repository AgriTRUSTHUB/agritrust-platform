import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListMentors, useListMentorSessions } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Star, Calendar } from "lucide-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Mentorship() {
  const { data: mentors, isLoading: mentorsLoading } = useListMentors();
  const { data: sessions, isLoading: sessionsLoading } = useListMentorSessions();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>Mentorship Network</GradientHeading>
            <p className="text-muted-foreground mt-1">Connect with experienced agricultural experts.</p>
          </div>
          <Button>Become a Mentor</Button>
        </div>

        {sessions && sessions.length > 0 && (
           <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Your Upcoming Sessions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {sessions.map(session => (
                    <Card key={session.id} className="border-primary/20 bg-primary/5">
                       <CardContent className="p-4 flex items-center justify-between">
                          <div>
                             <p className="font-semibold">{session.topic}</p>
                             <p className="text-sm text-muted-foreground">with {session.mentorName}</p>
                          </div>
                          <div className="text-right">
                             <div className="flex items-center justify-end gap-1 text-primary font-medium text-sm mb-1">
                                <Calendar className="h-4 w-4" /> {new Date(session.scheduledAt).toLocaleDateString()}
                             </div>
                             <Badge variant="outline">{session.status}</Badge>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>
        )}

        <h2 className="text-xl font-bold mb-4">Available Mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {mentorsLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
             ))
           ) : mentors?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">No mentors available.</div>
           ) : (
             mentors?.map(mentor => (
               <Card key={mentor.id}>
                  <CardContent className="p-6">
                     <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted overflow-hidden shrink-0">
                           {mentor.avatarUrl ? (
                              <img src={mentor.avatarUrl} alt={mentor.name} className="h-full w-full object-cover" />
                           ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                                 {mentor.name.charAt(0)}
                              </div>
                           )}
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold text-lg leading-tight">{mentor.name}</h3>
                           <p className="text-sm text-primary font-medium mb-2">{mentor.specialty}</p>
                           <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <Star className="h-4 w-4 fill-accent text-accent" />
                              <span className="font-medium text-foreground">{mentor.rating}</span>
                              <span>({mentor.sessionsCompleted} sessions)</span>
                           </div>
                           <Button className="w-full" variant={mentor.isAvailable ? "default" : "outline"} disabled={!mentor.isAvailable}>
                              {mentor.isAvailable ? "Book Session" : "Unavailable"}
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>
             ))
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}