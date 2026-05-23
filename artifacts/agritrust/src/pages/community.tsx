import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, MessageCircle, MapPin } from "lucide-react";
import { useListPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Community() {
  const { data: posts, isLoading } = useListPosts({ limit: 10 });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>Community Hub</GradientHeading>
            <p className="text-muted-foreground mt-1">Connect, share, and learn with farmers across the region.</p>
          </div>
          <Button>Create Post</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : posts?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No posts found.
                </CardContent>
              </Card>
            ) : (
              posts?.map(post => (
                <Card key={post.id} className="hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{post.category}</Badge>
                          {post.isPinned && <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">Pinned</Badge>}
                        </div>
                        <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <span className="font-medium text-foreground">{post.authorName}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-6">{post.content}</p>
                    <div className="flex items-center gap-6 border-t pt-4 text-sm text-muted-foreground">
                      <button className={`flex items-center gap-2 hover:text-primary transition-colors ${post.isLikedByMe ? 'text-primary' : ''}`}>
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likeCount} Likes</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.commentCount} Comments</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Regenerative Farming", "Pest Control", "Market Prices", "Irrigation", "Equipment Share", "Weather"].map(topic => (
                    <Badge key={topic} variant="secondary" className="hover:bg-secondary/80 cursor-pointer text-sm py-1">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-foreground">
                  <MapPin className="h-5 w-5" /> Local Meetups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary-foreground/80 mb-4 text-sm leading-relaxed">
                  Join upcoming farmer meetups in your region to network and share resources in person.
                </p>
                <Button variant="secondary" className="w-full">Find Meetups</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}