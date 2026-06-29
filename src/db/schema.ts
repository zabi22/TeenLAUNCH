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
  country: text('country'),
  avatarUrl: text('avatar_url'),
  headline: text('headline'),
  bio: text('bio'),
  portfolioUrl: text('portfolio_url'),
  skills: text('skills'),
  verificationBadges: text('verification_badges').default(''),
  username: text('username'),
  age: integer('age'),
  onboardingComplete: boolean('onboarding_complete').default(false),
  subscriptionTier: text('subscription_tier').default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  totalXp: integer('total_xp').default(0),
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
  type: text('type').default('college'), // 'college', 'scholarship', 'internship', etc.
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
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
  dedupeHash: text('dedupe_hash').unique(), // For duplication engine
  
  // Opportunity Discovery Engine Fields
  competitionLevel: text('competition_level').default('Medium'), // 'Low', 'Medium', 'High'
  acceptanceRate: integer('acceptance_rate'), // e.g., 20
  trustScore: integer('trust_score').default(0), // 0 to 100
  completenessScore: integer('completeness_score').default(0), // 0 to 100
  isVerified: boolean('is_verified').default(false),
  source: text('source'), // e.g., "university_scraper", "manual", "partner_api"
  discoveryDate: timestamp('discovery_date').defaultNow(),
  collegeValueScore: integer('college_value_score').default(50), // 0 to 100
  
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

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agentTasks = pgTable('agent_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  payload: jsonb('payload'),
  result: jsonb('result'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const drafts = pgTable('drafts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  type: text('type').notNull(),
  content: text('content').notNull(),
  aiModelUsed: text('ai_model_used'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const admissionsModels = pgTable('admissions_models', {
  id: serial('id').primaryKey(),
  universityName: text('university_name').notNull(),
  program: text('program').notNull(),
  acceptedGpaAvg: real('accepted_gpa_avg'),
  acceptedSatAvg: integer('accepted_sat_avg'),
  extracurricularWeight: real('extracurricular_weight'),
  historicalVolume: integer('historical_volume'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemNotifications = pgTable('system_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  channel: text('channel').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notificationPreferences = pgTable('notification_preferences', {
  userId: integer('user_id').references(() => users.id).primaryKey(),
  emailEnabled: boolean('email_enabled').default(true),
  pushEnabled: boolean('push_enabled').default(true),
  digestFrequency: text('digest_frequency').default('daily'),
  quietHoursStart: integer('quiet_hours_start'),
  quietHoursEnd: integer('quiet_hours_end'),
});

// Social Graph (Pillar 3)
export const appMessages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id),
  roomId: integer('room_id'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

export const studyRooms = pgTable('study_rooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  topic: text('topic'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  maxMembers: integer('max_members').default(10),
  isPrivate: boolean('is_private').default(false),
});

export const roomMembers = pgTable('room_members', {
  roomId: integer('room_id').references(() => studyRooms.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const mentorshipRequests = pgTable('mentorship_requests', {
  id: serial('id').primaryKey(),
  menteeId: integer('mentee_id').references(() => users.id).notNull(),
  mentorId: integer('mentor_id').references(() => users.id).notNull(),
  status: text('status').default('pending'),
  topic: text('topic'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Document Intelligence (Pillar 4)
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileUrl: text('file_url').notNull(),
  type: text('type').notNull(),
  parsedData: jsonb('parsed_data'),
  verificationStatus: text('verification_status').default('pending'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  proofDocumentId: integer('proof_document_id').references(() => documents.id),
  verified: boolean('verified').default(false),
  xpAwarded: integer('xp_awarded').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Monetization (Pillar 6)
export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull(),
  adminId: integer('admin_id').references(() => users.id).notNull(),
  brandingColors: jsonb('branding_colors'),
  subscriptionStatus: text('subscription_status').default('active'),
});

export const schoolStudents = pgTable('school_students', {
  schoolId: integer('school_id').references(() => schools.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
});
