import { useParams, Link } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetPost, useListComments, useCreateComment, useLikePost } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, MessageCircle, UserCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetPostQueryKey, getListCommentsQueryKey } from "@workspace/api-client-react";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "0", 10);
  const [commentText, setCommentText] = useState("");
  
  const { data: post, isLoading: postLoading } = useGetPost(postId, { query: { queryKey: getGetPostQueryKey(postId), enabled: !!postId } });
  const { data: comments, isLoading: commentsLoading } = useListComments(postId, { query: { queryKey: getListCommentsQueryKey(postId), enabled: !!postId } });
  
  const createComment = useCreateComment();
  const likePost = useLikePost();
  const queryClient = useQueryClient();

  const handleLike = () => {
    likePost.mutate({ id: postId }, {
       onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
       }
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate({ id: postId, data: { content: commentText } }, {
       onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
       }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/community" className="text-sm text-muted-foreground hover:text-primary mb-4 block">
          &larr; Back to Community
        </Link>
        
        {postLoading ? (
           <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-32 w-full" /></CardContent></Card>
        ) : !post ? (
           <div className="text-center py-12">Post not found.</div>
        ) : (
           <>
              <Card className="overflow-hidden border-none shadow-md">
                 <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                       <Badge variant="outline">{post.category}</Badge>
                       {post.isPinned && <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">Pinned</Badge>}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-serif">{post.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-4 text-sm">
                       <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {post.authorAvatarUrl ? <img src={post.authorAvatarUrl} alt={post.authorName} /> : <UserCircle className="h-6 w-6 text-muted-foreground" />}
                       </div>
                       <div>
                          <p className="font-medium text-foreground">{post.authorName}</p>
                          <p className="text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent>
                    {post.imageUrl && (
                       <div className="mb-6 rounded-lg overflow-hidden bg-muted">
                          <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[400px] object-contain" />
                       </div>
                    )}
                    <div className="prose max-w-none text-foreground/90 whitespace-pre-wrap">
                       {post.content}
                    </div>
                 </CardContent>
                 <CardFooter className="bg-muted/30 border-t flex gap-6 py-4">
                    <button onClick={handleLike} className={`flex items-center gap-2 transition-colors font-medium ${post.isLikedByMe ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                       <ThumbsUp className={`h-5 w-5 ${post.isLikedByMe ? 'fill-current' : ''}`} />
                       <span>{post.likeCount} Likes</span>
                    </button>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                       <MessageCircle className="h-5 w-5" />
                       <span>{post.commentCount} Comments</span>
                    </div>
                 </CardFooter>
              </Card>

              <div className="space-y-6 pt-4">
                 <h3 className="text-xl font-bold">Comments</h3>
                 
                 <Card>
                    <CardContent className="p-4">
                       <form onSubmit={handleComment} className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hidden sm:flex">
                             <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <Input 
                             placeholder="Add a comment..." 
                             value={commentText}
                             onChange={(e) => setCommentText(e.target.value)}
                             className="flex-1"
                          />
                          <Button type="submit" size="icon" disabled={!commentText.trim() || createComment.isPending}>
                             <Send className="h-4 w-4" />
                          </Button>
                       </form>
                    </CardContent>
                 </Card>

                 <div className="space-y-4">
                    {commentsLoading ? (
                       <div className="space-y-4"><Skeleton className="h-24 w-full" /></div>
                    ) : comments?.length === 0 ? (
                       <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card border-dashed">No comments yet. Be the first to share your thoughts!</div>
                    ) : (
                       comments?.map(comment => (
                          <Card key={comment.id} className="bg-transparent shadow-none border-b rounded-none last:border-0">
                             <CardContent className="p-4 flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                   {comment.authorAvatarUrl ? <img src={comment.authorAvatarUrl} alt={comment.authorName} /> : <UserCircle className="h-6 w-6 text-muted-foreground" />}
                                </div>
                                <div className="flex-1">
                                   <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">{comment.authorName}</span>
                                      <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-sm text-foreground/90">{comment.content}</p>
                                </div>
                             </CardContent>
                          </Card>
                       ))
                    )}
                 </div>
              </div>
           </>
        )}
      </div>
    </DashboardLayout>
  );
}