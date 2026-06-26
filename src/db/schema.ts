import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name'),
  email: text('email').notNull(),
  grade: text('grade'),
  interests: text('interests'), // Stored as comma-separated or JSON string for simplicity
  goals: text('goals'),
  country: text('country').default('United States'),
  avatarUrl: text('avatar_url'),
  headline: text('headline'),
  bio: text('bio'),
  portfolioUrl: text('portfolio_url'),
  skills: text('skills'),
  verificationBadges: text('verification_badges').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const academicProfiles = pgTable('academic_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  gpa: real('gpa'),
  weightedGpa: real('weighted_gpa'),
  classRank: text('class_rank'),
  satScore: integer('sat_score'),
  actScore: integer('act_score'),
  apCourses: integer('ap_courses'),
  honorsCourses: integer('honors_courses'),
  dualEnrollment: integer('dual_enrollment'),
  languages: text('languages'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  type: text('type'), // e.g., 'Volunteer', 'Leadership', 'Project'
  role: text('role'),
  hours: integer('hours'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  collegeName: text('college_name').notNull(),
  status: text('status').default('Not Started'), // 'Not Started', 'In Progress', 'Submitted', 'Accepted'
  deadline: text('deadline'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const roadmaps = pgTable('roadmaps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  goal: text('goal'),
  planData: jsonb('plan_data'), // JSON storing timeline items
  createdAt: timestamp('created_at').defaultNow(),
});

export const opportunities = pgTable('opportunities', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  deadline: text('deadline'),
  location: text('location'),
  eligibility: text('eligibility'),
  applicationUrl: text('application_url').notNull(),
  organization: text('organization').notNull(),
  isRemote: boolean('is_remote').default(false),
  country: text('country').default('Global'), // 'United States', 'Canada', 'India', 'Global', etc.
  region: text('region'),
  city: text('city'),
  gradeLevel: text('grade_level'), // e.g. "9th Grade, 10th Grade" or "All"
  ageRequirement: text('age_requirement'),
  isPaid: boolean('is_paid').default(false),
  programLength: text('program_length'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  opportunityId: integer('opportunity_id').references(() => opportunities.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  bookmarks: many(bookmarks),
  academicProfile: one(academicProfiles),
  activities: many(activities),
  applications: many(applications),
  roadmap: one(roadmaps),
}));

export const opportunitiesRelations = relations(opportunities, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  opportunity: one(opportunities, {
    fields: [bookmarks.opportunityId],
    references: [opportunities.id],
  }),
}));

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  achievementBadge: text('achievement_badge'), // e.g. "Scholarship Winner", "Competition Winner", "Research Participant", "Volunteer Milestone", "Leadership", "Founder Milestone"
  link: text('link'),
  tags: text('tags'), // comma-separated
  category: text('category').notNull().default('General'), // 'General', 'Award', 'Scholarship', 'Internship', 'Competition', 'Research', 'Volunteer', 'Leadership', 'Project', 'Startup Update', 'College Acceptance'
  isFounderUpdate: boolean('is_founder_update').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postReactions = pgTable('post_reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'like', 'celebrate', 'inspire', 'support'
  createdAt: timestamp('created_at').defaultNow(),
});

export const postComments = pgTable('post_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  parentId: integer('parent_id'), // Self-referencing reply support (optional)
  createdAt: timestamp('created_at').defaultNow(),
});

export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'connection', 'follow'
  status: text('status').notNull(), // 'pending', 'accepted'
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(), // Recipient
  actorId: integer('actor_id').references(() => users.id).notNull(), // User who did the action
  type: text('type').notNull(), // 'like', 'celebrate', 'inspire', 'support', 'comment', 'follow', 'connection_request', 'connection_accept'
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => postComments.id, { onDelete: 'cascade' }),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  badgeType: text('badge_type').notNull(), // 'Verified Student', 'Scholarship Winner', 'Research Participant', 'Competition Winner', 'Founder', 'Mentor'
  proof: text('proof').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp('created_at').defaultNow(),
});
