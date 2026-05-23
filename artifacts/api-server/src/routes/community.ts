import { Router, type IRouter } from "express";
import { db, communityPostsTable, commentsTable, postLikesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/community/posts", optionalAuth, async (req, res): Promise<void> => {
  const { category, page = "1", limit = "20" } = req.query as Record<string, string>;
  const userId = req.userId ?? 0;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const rows = category
    ? await db.select().from(communityPostsTable).leftJoin(usersTable, eq(communityPostsTable.authorId, usersTable.id)).where(eq(communityPostsTable.category, category)).limit(limitNum).offset(offset)
    : await db.select().from(communityPostsTable).leftJoin(usersTable, eq(communityPostsTable.authorId, usersTable.id)).limit(limitNum).offset(offset);

  const result = await Promise.all(rows.map(async ({ community_posts: p, users: u }) => {
    const liked = userId ? await db.select().from(postLikesTable).where(and(eq(postLikesTable.postId, p.id), eq(postLikesTable.userId, userId))) : [];
    return { ...p, authorName: u?.name ?? "Unknown", authorAvatarUrl: u?.avatarUrl ?? null, isLikedByMe: liked.length > 0 };
  }));
  res.json(result);
});

router.post("/community/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, content, category, imageUrl } = req.body;
  if (!title || !content || !category) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [post] = await db.insert(communityPostsTable).values({
    title, content, category, imageUrl: imageUrl || null,
    authorId: userId, likeCount: 0, commentCount: 0, isPinned: false,
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...post, authorName: user?.name ?? "Unknown", authorAvatarUrl: user?.avatarUrl ?? null, isLikedByMe: false });
});

router.get("/community/posts/:id", optionalAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const userId = req.userId ?? 0;
  const [row] = await db.select().from(communityPostsTable).leftJoin(usersTable, eq(communityPostsTable.authorId, usersTable.id)).where(eq(communityPostsTable.id, id));
  if (!row) { res.status(404).json({ error: "Post not found" }); return; }
  const liked = userId ? await db.select().from(postLikesTable).where(and(eq(postLikesTable.postId, id), eq(postLikesTable.userId, userId))) : [];
  res.json({ ...row.community_posts, authorName: row.users?.name ?? "Unknown", authorAvatarUrl: row.users?.avatarUrl ?? null, isLikedByMe: liked.length > 0 });
});

router.post("/community/posts/:id/like", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const userId = req.userId!;
  const [post] = await db.select().from(communityPostsTable).where(eq(communityPostsTable.id, id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  const existing = await db.select().from(postLikesTable).where(and(eq(postLikesTable.postId, id), eq(postLikesTable.userId, userId)));
  if (existing.length > 0) {
    await db.delete(postLikesTable).where(and(eq(postLikesTable.postId, id), eq(postLikesTable.userId, userId)));
    const [updated] = await db.update(communityPostsTable).set({ likeCount: Math.max(0, post.likeCount - 1) }).where(eq(communityPostsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
    res.json({ ...updated, authorName: user?.name ?? "Unknown", authorAvatarUrl: user?.avatarUrl ?? null, isLikedByMe: false });
  } else {
    await db.insert(postLikesTable).values({ postId: id, userId });
    const [updated] = await db.update(communityPostsTable).set({ likeCount: post.likeCount + 1 }).where(eq(communityPostsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
    res.json({ ...updated, authorName: user?.name ?? "Unknown", authorAvatarUrl: user?.avatarUrl ?? null, isLikedByMe: true });
  }
});

router.get("/community/posts/:id/comments", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const rows = await db.select().from(commentsTable).leftJoin(usersTable, eq(commentsTable.authorId, usersTable.id)).where(eq(commentsTable.postId, id));
  res.json(rows.map(({ comments: c, users: u }) => ({ ...c, authorName: u?.name ?? "Unknown", authorAvatarUrl: u?.avatarUrl ?? null })));
});

router.post("/community/posts/:id/comments", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const userId = req.userId!;
  const { content } = req.body;
  if (!content) { res.status(400).json({ error: "Content required" }); return; }
  const [comment] = await db.insert(commentsTable).values({ content, authorId: userId, postId: id }).returning();
  const [post] = await db.select().from(communityPostsTable).where(eq(communityPostsTable.id, id));
  if (post) await db.update(communityPostsTable).set({ commentCount: post.commentCount + 1 }).where(eq(communityPostsTable.id, id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...comment, authorName: user?.name ?? "Unknown", authorAvatarUrl: user?.avatarUrl ?? null });
});

export default router;
