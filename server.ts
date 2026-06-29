import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";
dotenv.config();

// Initialize in-memory TTL cache (standard 5-minute TTL)
export const apiCache = new NodeCache({ stdTTL: 300 });

import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db, pool } from "./src/db/index.ts";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { adminDb, adminAuth } from "./src/lib/firebase-admin.ts";
import { opportunities, bookmarks, users, academicProfiles, applications, activities, posts, postReactions, postComments, connections, notifications, verificationRequests, messages } from "./src/db/schema.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { eq, desc, and, lt, or, sql } from "drizzle-orm";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { aiProviderManager, AIHistoryMessage, AIGenerateOptions } from "./src/lib/AIProviderManager.ts";

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    } else {
      cleaned = cleaned.replace(/^```(json)?/i, "");
    }
    cleaned = cleaned.replace(/```$/, "").trim();
  }
  
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  let endIdx = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  
  return JSON.parse(cleaned);
}

export async function generateChatContent(
  systemInstruction: string,
  history: any[],
  message: string,
  isComplex: boolean = false
): Promise<string> {
  const formattedHistory: AIHistoryMessage[] = history ? history.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    text: msg.text
  })) : [];
  
  return aiProviderManager.generateContent({
    systemInstruction,
    history: formattedHistory,
    prompt: message,
    isComplex,
    isJson: false
  });
}

export async function generateContentManager(
  systemInstruction: string,
  prompt: string,
  isJson: boolean = false,
  isComplex: boolean = false
): Promise<string> {
  return aiProviderManager.generateContent({
    systemInstruction,
    prompt,
    isJson,
    isComplex
  });
}

async function seedOpportunitiesIfEmpty() {
  try {
    const existing = await db.select().from(opportunities).limit(1);
    if (existing.length > 0) {
      console.log("Opportunities database already seeded.");
      return;
    }

    console.log("Seeding initial high-quality opportunities across multiple countries...");
    const seedData = [
      // 1. Scholarships
      {
        title: "Coca-Cola Scholars Program Scholarship",
        description: "An achievement-based scholarship awarded to graduating high school seniors. Students are recognized for their capacity to lead and serve, as well as their commitment to making a significant impact on their schools and communities.",
        category: "Scholarships",
        deadline: "2026-10-31",
        location: "United States (Any)",
        eligibility: "High school seniors with a minimum 3.0 GPA intending to pursue a degree at an accredited US post-secondary institution.",
        applicationUrl: "https://www.coca-colascholarsfoundation.org/apply/",
        organization: "Coca-Cola Scholars Foundation",
        isRemote: true,
        country: "United States",
        region: null,
        city: null,
        gradeLevel: "12th Grade",
        ageRequirement: "No age limit, high school senior",
        isPaid: false,
        programLength: "Academic Year"
      },
      {
        title: "Schulich Leader Scholarships",
        description: "Schulich Leader Scholarships are Canada's most coveted undergraduate STEM scholarships. Awarded to entrepreneurial-minded high school graduates enrolling in a Science, Technology, Engineering or Math program.",
        category: "Scholarships",
        deadline: "2026-02-15",
        location: "Canada (Partner Universities)",
        eligibility: "Canadian citizen or permanent resident, graduating high school, demonstrating academic excellence, leadership, and entrepreneurial profile.",
        applicationUrl: "https://www.schulichleaders.com/",
        organization: "Schulich Foundation",
        isRemote: false,
        country: "Canada",
        region: null,
        city: null,
        gradeLevel: "12th Grade",
        ageRequirement: "Under 21",
        isPaid: false,
        programLength: "4 Years"
      },
      {
        title: "KVPY (Kishore Vaigyanik Protsahan Yojana) Fellowship",
        description: "A highly prestigious national fellowship program in basic sciences, initiated and funded by the Department of Science and Technology of the Government of India, to attract exceptionally highly motivated students for pursuing basic science careers.",
        category: "Scholarships",
        deadline: "2026-09-30",
        location: "India (Any)",
        eligibility: "Indian students enrolled in XI, XII Standard or 1st year of UG courses in basic sciences with strong mathematical/scientific aptitude.",
        applicationUrl: "http://kvpy.iisc.ac.in/",
        organization: "Indian Institute of Science (IISc)",
        isRemote: false,
        country: "India",
        region: null,
        city: null,
        gradeLevel: "11th Grade, 12th Grade",
        ageRequirement: "15-19",
        isPaid: false,
        programLength: "Monthly Stipend"
      },
      // 2. Internships
      {
        title: "NASA High School Internship Program",
        description: "NASA Office of STEM Engagement internships provide high school students with the opportunity to participate in research and development, engineering, or administrative projects alongside NASA scientists and mentors.",
        category: "Internships",
        deadline: "2026-03-01",
        location: "Ames Research Center, CA",
        eligibility: "US citizen, minimum 16 years of age, 3.0 cumulative GPA, currently enrolled in high school.",
        applicationUrl: "https://intern.nasa.gov/",
        organization: "NASA",
        isRemote: false,
        country: "United States",
        region: "California",
        city: "Mountain View",
        gradeLevel: "11th Grade, 12th Grade",
        ageRequirement: "16+",
        isPaid: true,
        programLength: "8 Weeks"
      },
      {
        title: "KPMG Virtual STEM Internship",
        description: "Gain invaluable experience working with one of the 'Big Four' accounting and consulting firms globally. Understand tech consulting, cybersecurity, and data analysis in a simulated workspace environment.",
        category: "Internships",
        deadline: "2026-12-31",
        location: "Remote",
        eligibility: "Open to high school and college students globally interested in technology and consulting.",
        applicationUrl: "https://www.theforage.com/virtual-internships/theme/kpmg/stem",
        organization: "KPMG",
        isRemote: true,
        country: "Global",
        region: null,
        city: null,
        gradeLevel: "All",
        ageRequirement: "No age limit",
        isPaid: false,
        programLength: "Self-Paced (approx 10 hours)"
      },
      {
        title: "Tata Group High School Summer Internship",
        description: "Gain hands-on corporate and technological project experience under Tata Consultancy Services. Work with engineering mentors on real-world industry problem solving.",
        category: "Internships",
        deadline: "2026-04-10",
        location: "Mumbai, India",
        eligibility: "Indian high school students in grades 10-12 interested in business strategy, software engineering, or data science.",
        applicationUrl: "https://www.tata.com/careers",
        organization: "Tata Group",
        isRemote: false,
        country: "India",
        region: "Maharashtra",
        city: "Mumbai",
        gradeLevel: "10th Grade, 11th Grade, 12th Grade",
        ageRequirement: "15+",
        isPaid: true,
        programLength: "6 Weeks"
      },
      // 3. Competitions
      {
        title: "Google Science Fair",
        description: "A prestigious global online science and technology competition open to individuals and teams of teenagers from all over the world. Submit a research project to win scholarships and grand prizes.",
        category: "Competitions",
        deadline: "2026-05-15",
        location: "Global",
        eligibility: "Students aged 13 to 18 from any country around the world.",
        applicationUrl: "https://www.googlesciencefair.com/",
        organization: "Google",
        isRemote: true,
        country: "Global",
        region: null,
        city: null,
        gradeLevel: "All",
        ageRequirement: "13-18",
        isPaid: false,
        programLength: "Annual Competition"
      },
      {
        title: "International Mathematical Olympiad (IMO)",
        description: "The World Championship Mathematics Competition for High School students. Teams representing over 100 countries compete in rigorous multi-day mathematical examinations.",
        category: "Competitions",
        deadline: "2026-04-01",
        location: "Varies",
        eligibility: "Students must be nominated by their country's national mathematics association through qualifying exams.",
        applicationUrl: "https://www.imo-official.org/",
        organization: "IMO Foundation",
        isRemote: false,
        country: "Global",
        region: null,
        city: null,
        gradeLevel: "All",
        ageRequirement: "Under 20",
        isPaid: false,
        programLength: "2 Weeks"
      },
      {
        title: "Regeneron Science Talent Search (STS)",
        description: "The nation's oldest and most prestigious science and math competition for high school seniors. Awards millions of dollars in prizes annually to student scientists pursuing original scientific research.",
        category: "Competitions",
        deadline: "2026-11-12",
        location: "Washington, D.C.",
        eligibility: "High school seniors living in the US, or US citizens attending high schools abroad.",
        applicationUrl: "https://www.societyforscience.org/regeneron-sts/",
        organization: "Society for Science",
        isRemote: false,
        country: "United States",
        region: null,
        city: null,
        gradeLevel: "12th Grade",
        ageRequirement: "No age limit, high school senior",
        isPaid: false,
        programLength: "1 Week Finals"
      },
      // 4. Research Programs
      {
        title: "MIT Research Science Institute (RSI)",
        description: "A highly selective, fully funded summer research program for high school students. It combines on-campus course work in scientific theory with off-campus work in science and technology research.",
        category: "Research Programs",
        deadline: "2026-01-15",
        location: "MIT Campus, Cambridge, MA",
        eligibility: "High school juniors (grade 11) with exceptional academic and scientific profiles from any country (domestic and international).",
        applicationUrl: "https://www.cee.org/programs/research-science-institute",
        organization: "Center for Excellence in Education",
        isRemote: false,
        country: "Global",
        region: "Massachusetts",
        city: "Cambridge",
        gradeLevel: "11th Grade",
        ageRequirement: "No age limit",
        isPaid: true,
        programLength: "6 Weeks"
      },
      {
        title: "Stanford Institutes of Medicine Summer Research Program (SIMR)",
        description: "An 8-week program in which high school students perform hands-on research with Stanford faculty, postdoctoral fellows, and researchers in medically-related fields.",
        category: "Research Programs",
        deadline: "2026-02-21",
        location: "Stanford, CA",
        eligibility: "US citizens or permanent residents, at least 16 years of age, currently in 11th or 12th grade.",
        applicationUrl: "https://simr.stanford.edu/",
        organization: "Stanford University School of Medicine",
        isRemote: false,
        country: "United States",
        region: "California",
        city: "Stanford",
        gradeLevel: "11th Grade, 12th Grade",
        ageRequirement: "16+",
        isPaid: true,
        programLength: "8 Weeks"
      },
      // 5. Volunteer Opportunities
      {
        title: "Red Cross Youth Volunteer Network",
        description: "Make an impact in your community while building leadership skills. Youth volunteers assist with blood drives, disaster preparation awareness, and local community outreach.",
        category: "Volunteer Opportunities",
        deadline: "2026-12-31",
        location: "Local Chapter",
        eligibility: "Open to middle and high school students aged 13-18 globally. High integrity and commitment.",
        applicationUrl: "https://www.redcross.org/volunteer/become-a-volunteer/youth-volunteers.html",
        organization: "American Red Cross",
        isRemote: false,
        country: "Global",
        region: null,
        city: null,
        gradeLevel: "All",
        ageRequirement: "13+",
        isPaid: false,
        programLength: "Ongoing"
      },
      {
        title: "United Nations Online Volunteers",
        description: "Support UN agencies and global non-governmental organizations by applying your digital skills (translation, coding, design, research) in key sustainable development goals.",
        category: "Volunteer Opportunities",
        deadline: "2026-12-31",
        location: "Remote",
        eligibility: "Open to motivated individuals globally. Tech-savvy and dependable.",
        applicationUrl: "https://www.unv.org/become-online-volunteer",
        organization: "United Nations",
        isRemote: true,
        country: "Global",
        region: null,
        city: null,
        gradeLevel: "All",
        ageRequirement: "18+",
        isPaid: false,
        programLength: "Flexible"
      },
      // 6. Hackathons
      {
        title: "HackMIT",
        description: "MIT's flagship annual hackathon, bringing together thousands of high school and university students to collaborate on tech solutions, software projects, and hardware hacks.",
        category: "Hackathons",
        deadline: "2026-08-15",
        location: "Cambridge, MA",
        eligibility: "High school and undergraduate university students. Open to international applicants with travel reimbursement available.",
        applicationUrl: "https://hackmit.org/",
        organization: "MIT",
        isRemote: false,
        country: "Global",
        region: "Massachusetts",
        city: "Cambridge",
        gradeLevel: "All",
        ageRequirement: "15+",
        isPaid: false,
        programLength: "36 Hours"
      },
      {
        title: "Singapore Youth Tech Challenge Hackathon",
        description: "A premier youth hackathon focused on solving sustainability issues in urban ecosystems. Partnered with GovTech Singapore and SGInnovate.",
        category: "Hackathons",
        deadline: "2026-05-20",
        location: "Singapore City",
        eligibility: "Students studying in Singapore schools or international schools in ASEAN region, aged 14 to 19.",
        applicationUrl: "https://www.smartnation.gov.sg/",
        organization: "GovTech Singapore",
        isRemote: false,
        country: "Singapore",
        region: null,
        city: "Singapore",
        gradeLevel: "9th Grade, 10th Grade, 11th Grade, 12th Grade",
        ageRequirement: "14-19",
        isPaid: false,
        programLength: "3 Days"
      },
      // 7. Summer Programs
      {
        title: "Yale Young Global Scholars (YYGS)",
        description: "An academic development program that brings together outstanding high school students from over 150 countries for intensive collaborative study in humanities, sciences, or economics.",
        category: "Summer Programs",
        deadline: "2026-01-10",
        location: "Yale Campus, New Haven, CT",
        eligibility: "High school sophomores or juniors (grades 10 and 11) from any country, aged at least 15 by program start.",
        applicationUrl: "https://globalscholars.yale.edu/",
        organization: "Yale University",
        isRemote: false,
        country: "Global",
        region: "Connecticut",
        city: "New Haven",
        gradeLevel: "10th Grade, 11th Grade",
        ageRequirement: "15+",
        isPaid: false,
        programLength: "2 Weeks"
      },
      {
        title: "Oxbridge Summer Academy",
        description: "Experience university life at Oxford or Cambridge. Intensive academic courses paired with creative workshops, leadership training, and college prep mentoring.",
        category: "Summer Programs",
        deadline: "2026-03-31",
        location: "Oxford, United Kingdom",
        eligibility: "International high school students aged 15-18 with outstanding academic records.",
        applicationUrl: "https://www.oxbridgeacademicprograms.com/",
        organization: "Oxbridge Academic Programs",
        isRemote: false,
        country: "United Kingdom",
        region: "Oxfordshire",
        city: "Oxford",
        gradeLevel: "10th Grade, 11th Grade, 12th Grade",
        ageRequirement: "15-18",
        isPaid: false,
        programLength: "4 Weeks"
      }
    ];

    await db.insert(opportunities).values(seedData);
    console.log("Successfully seeded 17 prestigious opportunities!");
  } catch (error) {
    console.error("Failed to seed opportunities database:", error);
  }
}

async function startServer() {
  try {
    console.log("Testing database connection...");
    await pool.query('SELECT 1');
    console.log("Database connection test successful.");
  } catch (error) {
    console.error("CRITICAL: Database connection failed. Ensure DATABASE_URL is correct and reachable:", error);
    process.exit(1);
  }

  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations complete.");
  } catch (error) {
    console.error("Migrations failed:", error);
  }
  // Run DB seed check
  await seedOpportunitiesIfEmpty();

  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  app.use(cors());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          "connect-src": [
            "'self'", 
            "blob:", 
            "data:",
            "https://*.firebaseio.com",
            "https://*.cloudfunctions.net",
            "https://*.googleapis.com",
            "https://securetoken.googleapis.com",
            "https://identitytoolkit.googleapis.com",
            "https://firebasestorage.googleapis.com",
            "https://firestore.googleapis.com"
          ],
          "worker-src": ["'self'", "blob:", "data:"],
          "img-src": ["'self'", "blob:", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'sameorigin'
      },
      hidePoweredBy: true,
      noSniff: true,
      xssFilter: true,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      }
    })
  );
  app.use(express.json());

  // Set up standard rate limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    message: { error_code: 'TOO_MANY_REQUESTS', user_friendly_message: 'Too many requests from this IP, please try again after 15 minutes.', original_error: 'Rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", apiLimiter);

  // API Routes
  app.get("/healthz", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Sync user profile from Firebase to Postgres
  app.post("/api/users/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const user = await getOrCreateUser(req.user.uid, req.user.email || "", req.user.name);
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.get("/api/users/students", requireAuth, async (req: AuthRequest, res) => {
    try {
      const studentsList = await db.select().from(users);
      res.json(studentsList);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.get("/api/users/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      res.json(userRecords[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/users/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const { grade, interests, goals, country } = req.body;
      const updatedUser = await db.update(users)
        .set({ grade, interests, goals, country })
        .where(eq(users.uid, req.user.uid))
        .returning();

      res.json(updatedUser[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Academic Profile
  app.get("/api/academic-profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;
      
      const profile = await db.select().from(academicProfiles).where(eq(academicProfiles.userId, dbUserId));
      if (profile.length === 0) return res.json({});
      res.json(profile[0]);
    } catch (error: any) {
      res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
    }
  });

  app.post("/api/academic-profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;
      
      const existing = await db.select().from(academicProfiles).where(eq(academicProfiles.userId, dbUserId));
      if (existing.length > 0) {
        const updated = await db.update(academicProfiles)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(academicProfiles.userId, dbUserId))
          .returning();
        res.json(updated[0]);
      } else {
        const inserted = await db.insert(academicProfiles)
          .values({ ...req.body, userId: dbUserId })
          .returning();
        res.json(inserted[0]);
      }
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Applications
  app.get("/api/applications", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;
      
      const userApps = await db.select().from(applications).where(eq(applications.userId, dbUserId));
      res.json(userApps);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/applications", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;
      
      const inserted = await db.insert(applications)
        .values({ ...req.body, userId: dbUserId })
        .returning();
      res.json(inserted[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Activities
  app.get("/api/activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;
      
      const userActivities = await db.select().from(activities).where(eq(activities.userId, dbUserId));
      res.json(userActivities);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;
      
      const inserted = await db.insert(activities)
        .values({ ...req.body, userId: dbUserId })
        .returning();
      res.json(inserted[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Opportunities
  app.get("/api/opportunities", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      try {
        // Automatically remove outdated local/non-remote opportunities whose deadline is in the past
        await db.delete(opportunities).where(and(lt(opportunities.deadline, today), eq(opportunities.isRemote, false)));
      } catch (cleanError) {
        console.error("Cleanup outdated opportunities failed:", cleanError);
      }

      // Query parameters
      const q = (req.query.q as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const relax = req.query.relax === "true";
      
      let userCountry = (req.query.country as string) || "";
      let userGrade = "";
      if (!userCountry && req.headers.authorization) {
        try {
          const authHeader = req.headers.authorization;
          const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
          const decodedToken = await adminAuth.verifyIdToken(token);
          if (decodedToken && decodedToken.uid) {
            const userRecords = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
            if (userRecords.length > 0) {
              const data = userRecords[0];
              userCountry = data.country || "";
              userGrade = data.grade || "";
            }
          }
        } catch (authError) {
          console.warn("Optional auth lookup for opportunity prioritization failed:", authError);
        }
      }

      const offset = (page - 1) * perPage;
      let conditions = [];
      
      if (q) {
        const searchPattern = `%${q}%`;
        conditions.push(
          or(
            sql`${opportunities.title} ILIKE ${searchPattern}`,
            sql`${opportunities.organization} ILIKE ${searchPattern}`,
            sql`${opportunities.description} ILIKE ${searchPattern}`
          )
        );
      }

      if (userCountry && userCountry.toLowerCase() !== "all") {
        if (!relax) {
          conditions.push(
            or(
              sql`lower(${opportunities.country}) = ${userCountry.toLowerCase()}`,
              sql`lower(${opportunities.country}) = 'global'`,
              eq(opportunities.isRemote, true)
            )
          );
        }
      }

      // In relax mode, we don't enforce strict country filtering if results are low, but here we just order them
      
      let allOps;
      if (conditions.length > 0) {
         allOps = await db.select().from(opportunities).where(and(...conditions));
      } else {
         allOps = await db.select().from(opportunities);
      }

      // Manual sorting and scoring for "relevance"
      const scoredOps = allOps.map(op => {
        let score = 0;
        let explain = [];
        
        if (q) {
          const qLower = q.toLowerCase();
          if (op.title.toLowerCase().includes(qLower)) { score += 50; explain.push("Title match"); }
          if (op.organization.toLowerCase().includes(qLower)) { score += 30; explain.push("Organization match"); }
          if (op.description.toLowerCase().includes(qLower)) { score += 10; explain.push("Description match"); }
        }
        
        if (userCountry) {
          if (op.country.toLowerCase() === userCountry.toLowerCase()) {
            score += 20; explain.push("Country match");
          } else if (op.country.toLowerCase() === 'global') {
            score += 10; explain.push("Global availability");
          } else {
            score -= 10;
          }
        }
        
        if (op.deadline) {
           const deadlineDate = new Date(op.deadline);
           const timeDiff = deadlineDate.getTime() - new Date().getTime();
           const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
           if (daysUntil > 0 && daysUntil <= 30) {
             score += 15; explain.push("Approaching deadline");
           }
        }

        return { ...op, score, explain, provenance: "internal_db" };
      });

      scoredOps.sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // If strict filter yielded few results and relax is true, we could theoretically fetch more, but we already fetched all matching `q`
      
      const totalCount = scoredOps.length;
      const paginatedResults = scoredOps.slice(offset, offset + perPage);

      res.json({
         results: paginatedResults,
         total: totalCount,
         page,
         per_page: perPage,
         has_more: offset + perPage < totalCount
      });
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.get("/api/opportunities/stats", async (req, res) => {
    try {
      const cacheKey = "opportunities_stats";
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const allOps = await db.select().from(opportunities);
      const total = allOps.length;
      
      const newToday = allOps.filter(o => {
        if (!o.createdAt) return false;
        const opDate = new Date(o.createdAt);
        const today = new Date();
        return opDate.toDateString() === today.toDateString();
      }).length;

      const verifiedCount = allOps.filter(o => o.isVerified).length;

      const categories = allOps.reduce((acc: any, op) => {
        acc[op.category] = (acc[op.category] || 0) + 1;
        return acc;
      }, {});

      const bySource = allOps.reduce((acc: any, op) => {
        const source = op.source || "unknown";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const result = { total, newToday, verifiedCount, categories, bySource };
      apiCache.set(cacheKey, result);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // AI-Powered Opportunity Aggregator / Discovery
  app.post("/api/opportunities/aggregate", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { country, region, city, type } = req.body;
      const targetCountry = country || "Global";
      const targetRegion = region ? `, Region: ${region}` : "";
      const targetCity = city ? `, City: ${city}` : "";
      
      let scoutType = "mix of global prestigious and local/niche";
      if (type === "local") scoutType = "highly localized, low-competition";
      if (type === "global") scoutType = "prestigious, high-competition, international";

      const systemInstruction = `You are a world-class opportunity scout AI for students. 
Discover 3 to 5 REAL, active, prestigious upcoming opportunities (scholarships, internships, competitions, research, volunteering, hackathons, or summer programs).
Your scouting focus should be a ${scoutType} for a student in: ${targetCountry}${targetRegion}${targetCity}.
If focusing on local, find opportunities in or near the specified city/region. If global, find remote or prestigious international ones.
Use Chain-of-Thought reasoning to evaluate and score these opportunities based on a 'Diversity Scoring' algorithm ensuring a variety of categories and perfect alignment with an ambitious student profile.
Return ONLY a valid JSON array of objects representing these opportunities. 
Ensure the objects match the following JSON schema exactly, with NO wrapping markdown code blocks, NO backticks, and NO trailing commas:
[
  {
    "title": "Short descriptive official title of the opportunity",
    "description": "High-quality detailed description of the opportunity, its goals, and what the student will do (2-3 sentences)",
    "category": "Must be exactly one of: Scholarships, Internships, Competitions, Research Programs, Volunteer Opportunities, Hackathons, Summer Programs",
    "deadline": "YYYY-MM-DD (must be a future date in 2026 or 2027)",
    "location": "City, State or Virtual/Remote",
    "eligibility": "Clear eligibility requirements (e.g. high school seniors, age 15-18)",
    "applicationUrl": "Valid URL to the official website or application page (always starts with http or https)",
    "organization": "Official organization name hosting this opportunity",
    "isRemote": true or false,
    "country": "${targetCountry}",
    "region": "State, province, region or null",
    "city": "City name or null",
    "gradeLevel": "e.g. '10th Grade, 11th Grade' or 'All'",
    "ageRequirement": "e.g. '15+' or '14-18' or null",
    "isPaid": true or false,
    "programLength": "e.g. '6 weeks' or '3 months' or 'Summer'",
    "competitionLevel": "Low, Medium, or High",
    "acceptanceRate": "integer between 1 and 100 or null",
    "trustScore": "integer between 70 and 100",
    "completenessScore": "integer between 70 and 100",
    "isVerified": true or false,
    "source": "e.g. 'university_scraper', 'community_submission', 'partner_api'",
    "collegeValueScore": "integer between 50 and 100",
    "diversityScore": "integer between 50 and 100 indicating contribution to profile diversity"
  }
]`;

      const textResponse = await generateContentManager(
        systemInstruction,
        `Discover new student opportunities for: ${targetCountry}. Ensure 3 to 5 high-quality, varied opportunities (e.g., scholarships, internships, research). Think step-by-step to apply the Diversity Scoring algorithm before outputting the final JSON array.`,
        true,
        true
      );

      let discovered = [];
      try {
        discovered = cleanAndParseJson(textResponse);
      } catch (e) {
        console.error("Failed to parse JSON for aggregate:", textResponse);
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      if (!Array.isArray(discovered)) {
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      const insertedOps = [];
      for (const op of discovered) {
        if (!op.title || !op.description || !op.category || !op.applicationUrl || !op.organization) {
          continue;
        }
        
        // Generate a deduplication hash based on title and organization
        const hashInput = `${op.title.toLowerCase().trim()}|${op.organization.toLowerCase().trim()}`;
        const dedupeHash = crypto.createHash('sha256').update(hashInput).digest('hex');

        // Check if it already exists
        const existing = await db.select().from(opportunities).where(eq(opportunities.dedupeHash, dedupeHash));
        if (existing.length > 0) {
          continue; // Skip duplicate
        }

        const opToInsert = {
          title: op.title,
          description: op.description,
          category: op.category,
          deadline: op.deadline || null,
          location: op.location || "Remote",
          eligibility: op.eligibility || "High school students",
          applicationUrl: op.applicationUrl,
          organization: op.organization,
          isRemote: !!op.isRemote,
          country: op.country || targetCountry,
          region: op.region || null,
          city: op.city || null,
          gradeLevel: op.gradeLevel || "All",
          ageRequirement: op.ageRequirement || null,
          isPaid: !!op.isPaid,
          programLength: op.programLength || null,
          dedupeHash,
          competitionLevel: op.competitionLevel || "Medium",
          acceptanceRate: typeof op.acceptanceRate === 'number' ? op.acceptanceRate : null,
          trustScore: typeof op.trustScore === 'number' ? op.trustScore : 85,
          completenessScore: typeof op.completenessScore === 'number' ? op.completenessScore : 80,
          isVerified: !!op.isVerified,
          source: op.source || "gemini_scout",
          collegeValueScore: typeof op.collegeValueScore === 'number' ? op.collegeValueScore : 75,
        };

        const inserted = await db.insert(opportunities).values(opToInsert).returning();
        insertedOps.push(inserted[0]);
      }

      res.json({ success: true, count: insertedOps.length, opportunities: insertedOps });
    } catch (error: any) {
      console.error("Aggregation error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db.select().from(opportunities).where(eq(opportunities.id, id));
      if (result.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Admin: Create Opportunity
  // For safety in this demo, requiring auth. In reality, check admin claims.
  app.post("/api/opportunities", requireAuth, async (req: AuthRequest, res) => {
    try {
      const newOp = await db.insert(opportunities).values(req.body).returning();
      res.json(newOp[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Admin/System: Trigger Crawler Worker
  // In a real production app, this would be an admin-only endpoint or cron job.
  app.post("/api/opportunities/crawl", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { url, sourceName } = req.body;
      if (!url) {
        return res.status(400).json({ error_code: 'BAD_REQUEST', user_friendly_message: 'The request was invalid or missing required parameters.' });
      }
      
      const { Queue } = await import("bullmq");
      const crawlerQueue = new Queue('crawlerQueue', {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        }
      });
      
      await crawlerQueue.add('crawl', { url, sourceName: sourceName || 'manual_trigger' });
      
      res.json({ success: true, message: "Crawler job added to queue" });
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Generative UI API
  app.get("/api/dashboard/generative-ui", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });

      const current_user_goal_status = req.query.status || 'Application Week';
      const systemInstruction = `You are a Context-Aware Generative UI Engine.
Output a JSON configuration for a student dashboard.
The student's current_user_goal_status is '${current_user_goal_status}'.
You MUST output ONLY valid JSON without markdown wrapping.
The format must match:
{
  "layout": "urgent_focus",
  "components": [
    { "type": "DeadlineCounter", "props": { "target": "2026-11-01", "label": "Early Action" } },
    { "type": "EssayWorkflowStep", "props": { "stepName": "Draft 1 Review", "draftId": "d_123", "status": "urgent" } },
    { "type": "MilestoneProgressBar", "props": { "title": "Application Readiness", "progress": 7, "total": 10 } }
  ]
}`;

      // In production, we pass the user's actual goal context.
      const aiResult = await aiProviderManager.generateContent({
        systemInstruction,
        prompt: "Generate UI layout for current status",
        isComplex: false,
        isJson: true
      });

      let parsedConfig = { layout: "default", components: [] };
      try {
        const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedConfig = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse generative UI output:", aiResult);
      }

      res.json(parsedConfig);
    } catch (error: any) {
      console.error("Generative UI error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Coach Chat API using Gemini
  app.post("/api/coach/chat", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      const systemInstruction = `You are the TeenLaunch Student Digital Twin AI, an ultra-advanced, always-available strategic mentor for a high school student aiming for elite universities and world-class career goals.
You are powered by Gemini High Thinking mode. Use a Chain-of-Thought reasoning approach to analyze the student's context before responding. Act as a predictive intelligence and success strategist. Provide highly tactical, actionable, step-by-step guidance on academics, venture creation, internships, and scholarships rather than generic advice.
Keep your responses concise, highly professional, and structured with clean markdown. Your goal is to maximize the student's probability of success.`;
      
      const responseText = await generateChatContent(systemInstruction, history, message, true);

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Coach chat error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Bookmarks
  app.get("/api/bookmarks", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      
      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.json([]);
      const dbUserId = userRecords[0].id;

      const userBookmarks = await db.select({
        id: bookmarks.id,
        opportunity: opportunities
      })
      .from(bookmarks)
      .innerJoin(opportunities, eq(bookmarks.opportunityId, opportunities.id))
      .where(eq(bookmarks.userId, dbUserId));

      res.json(userBookmarks);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/bookmarks/:opportunityId", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const opId = parseInt(req.params.opportunityId);

      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;

      const newBookmark = await db.insert(bookmarks).values({
        userId: dbUserId,
        opportunityId: opId
      }).returning();
      res.json(newBookmark[0]);
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.delete("/api/bookmarks/:opportunityId", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const opId = parseInt(req.params.opportunityId);

      const userRecords = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (userRecords.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      const dbUserId = userRecords[0].id;

      await db.delete(bookmarks).where(
        and(eq(bookmarks.userId, dbUserId), eq(bookmarks.opportunityId, opId))
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Essay Assistant API using Gemini 3.1 Pro Preview with Thinking Mode
  app.post("/api/essay/analyze", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const { prompt, draft } = req.body;
      
      if (!prompt || !draft) {
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      const systemInstruction = `You are an elite college admissions essay advisor.
You help students craft compelling college admission essays by providing structural feedback and scoring for the given essay draft against the prompt.

Output MUST be a JSON object with this exact structure:
{
  "score": <number between 0 and 100>,
  "feedback": ["<feedback point 1>", "<feedback point 2>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "structureSuggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

      const textResponse = await generateContentManager(
        systemInstruction,
        `Essay Prompt: ${prompt}\n\nStudent Draft:\n${draft}`,
        true,
        true
      );
      
      let parsed = {};
      try {
        parsed = cleanAndParseJson(textResponse);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini:", textResponse);
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("Essay analysis error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/essay/brainstorm", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      const systemInstruction = `You are an elite college admissions essay advisor.
The student needs help brainstorming topic ideas for the given essay prompt.

Output MUST be a JSON array of objects with this exact structure:
[
  {
    "title": "<Short idea title>",
    "description": "<A paragraph describing the angle and why it works>"
  },
  ...
]
Provide 3 highly distinct and creative ideas.`;

      const textResponse = await generateContentManager(
        systemInstruction,
        `Essay Prompt: ${prompt}\n\nPlease brainstorm ideas.`,
        true,
        true
      );
      
      let parsed = [];
      try {
        parsed = cleanAndParseJson(textResponse);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini:", textResponse);
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      res.json({ ideas: parsed });
    } catch (error: any) {
      console.error("Brainstorm error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Roadmap Generator
  app.post("/api/roadmap/generate", requireAuth, async (req: AuthRequest, res) => {
    console.log("Roadmap generation request received");
    try {
      const { goal, grade, profile } = req.body;
      if (!goal || !grade) {
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      const systemInstruction = `You are an elite college admissions strategist.
Generate a multi-year strategic roadmap for a high school student.
Goal: ${goal}
Current Grade: ${grade}
Profile Context: ${JSON.stringify(profile || {})}

Return ONLY a valid JSON array of objects representing the years/grades. 
Example format:
[
  {
    "grade": "Grade 9",
    "priority": "High",
    "items": [
      { "title": "Join Coding Club", "type": "Extracurricular", "done": false, "hasOp": true }
    ]
  }
]
Types should be one of: Extracurricular, Competition, Academics, Service, Project, Leadership, Research, Testing, Application.`;

      const textResponse = await generateContentManager(
        systemInstruction,
        `Generate roadmap for: ${goal} starting from ${grade}`,
        true
      );
      
      let parsed = [];
      try {
        const rawParsed = cleanAndParseJson(textResponse);
        if (Array.isArray(rawParsed)) {
          parsed = rawParsed;
        } else if (rawParsed && typeof rawParsed === "object") {
          if (Array.isArray(rawParsed.roadmap)) {
            parsed = rawParsed.roadmap;
          } else if (Array.isArray(rawParsed.timeline)) {
            parsed = rawParsed.timeline;
          } else if (Array.isArray(rawParsed.items)) {
            parsed = rawParsed.items;
          } else {
            const foundArray = Object.values(rawParsed).find(val => Array.isArray(val));
            if (foundArray) {
              parsed = foundArray;
            } else {
              parsed = [rawParsed];
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse JSON from AI:", textResponse);
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      // Normalize each stage to guarantee exact structures expected by the frontend
      const normalizedRoadmap = parsed.map((stage: any) => {
        if (!stage || typeof stage !== "object") {
          return {
            grade: "Upcoming Step",
            priority: "Medium",
            items: []
          };
        }
        return {
          grade: stage.grade || "Upcoming Step",
          priority: stage.priority || "Medium",
          items: Array.isArray(stage.items) ? stage.items.map((item: any) => {
            if (typeof item === "string") {
              return { title: item, type: "Academics", done: false, hasOp: false };
            }
            return {
              title: item?.title || "Strategic Milestone",
              type: item?.type || "Academics",
              done: !!item?.done,
              hasOp: !!item?.hasOp
            };
          }) : []
        };
      });

      res.json({ roadmap: normalizedRoadmap });
    } catch (error: any) {
      console.error("Roadmap generation error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // College Competitiveness Analyzer
  app.post("/api/college/analyze", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { college, major, profile, activities } = req.body;
      if (!college || !profile) {
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      const systemInstruction = `You are the TeenLaunch AI Admissions Simulator. You simulate admissions review for top universities.
Analyze the student's competitiveness for ${college} (Major: ${major || "Undecided"}).
Student Profile: ${JSON.stringify(profile)}
Student Activities: ${JSON.stringify(activities)}

Use high-level strategic reasoning to provide a brutal, accurate admissions simulation.
Return ONLY valid JSON with this structure:
{
  "chances": 45,
  "category": "Reach",
  "missing": ["Need higher SAT", "Need more leadership in STEM"],
  "strengths": ["Strong GPA", "Good AP count"],
  "analysis": "A concise 2-3 sentence strategic summary outlining the probabilistic path to acceptance."
}`;

      // We use HIGH thinking mode via isComplex flag (generateChatContent)
      const textResponse = await generateChatContent(
        systemInstruction,
        [],
        `Analyze college competitiveness for ${college}.`,
        true
      );
      
      let parsed = {};
      try {
        parsed = cleanAndParseJson(textResponse);
      } catch (e) {
        console.error("Failed to parse JSON from AI:", textResponse);
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("College analysis error:", error);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // ==========================================
  // STUDENT SOCIAL NETWORK API
  // ==========================================

  // Helper to retrieve the DB user from Firebase Auth UID
  const getDbUser = async (uid: string) => {
    const records = await db.select().from(users).where(eq(users.uid, uid));
    if (records.length === 0) return null;
    return records[0];
  };

  // 1. Fetch Feed (LinkedIn-like prioritizing connections, grade, interests, etc.)
  app.get("/api/social/posts", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Fetch all posts with their creators
      const allPosts = await db.select().from(posts);
      
      // Fetch creator details for each post
      const postsWithCreators = await Promise.all(allPosts.map(async (post) => {
        const creator = await db.select().from(users).where(eq(users.id, post.userId));
        
        // Fetch reactions
        const reactions = await db.select().from(postReactions).where(eq(postReactions.postId, post.id));
        
        // Fetch comments count
        const comments = await db.select().from(postComments).where(eq(postComments.postId, post.id));

        // Check if current user reacted
        const userReaction = reactions.find(r => r.userId === currentUser.id)?.type || null;

        return {
          ...post,
          creator: creator[0] || null,
          reactions,
          reactionCounts: {
            like: reactions.filter(r => r.type === 'like').length,
            celebrate: reactions.filter(r => r.type === 'celebrate').length,
            inspire: reactions.filter(r => r.type === 'inspire').length,
            support: reactions.filter(r => r.type === 'support').length,
          },
          userReaction,
          commentsCount: comments.length,
        };
      }));

      // Fetch user's connections to calculate relevance
      // All accepted connections
      const userConnections = await db.select().from(connections).where(
        and(
          eq(connections.status, 'accepted'),
          or(eq(connections.senderId, currentUser.id), eq(connections.receiverId, currentUser.id))
        )
      );
      const connectedUserIds = new Set(userConnections.map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId));

      // Fetch user's following list
      const userFollowing = await db.select().from(connections).where(
        and(
          eq(connections.senderId, currentUser.id),
          eq(connections.type, 'follow')
        )
      );
      const followingUserIds = new Set(userFollowing.map(f => f.receiverId));

      // Professional Feed Algorithm
      const scoredPosts = postsWithCreators.map(post => {
        let score = 0;
        if (!post.creator) return { post, score: -999 };

        const isConnection = connectedUserIds.has(post.userId);
        const isFollowing = followingUserIds.has(post.userId);

        if (isConnection) score += 100;
        if (isFollowing) score += 50;

        // Same country (local)
        if (currentUser.country && post.creator.country && currentUser.country.toLowerCase() === post.creator.country.toLowerCase()) {
          score += 40;
        }

        // Same grade
        if (currentUser.grade && post.creator.grade && currentUser.grade.toLowerCase() === post.creator.grade.toLowerCase()) {
          score += 30;
        }

        // Similar interests
        if (currentUser.interests && post.creator.interests) {
          const myInterests = currentUser.interests.toLowerCase().split(",").map(i => i.trim());
          const theirInterests = post.creator.interests.toLowerCase().split(",").map(i => i.trim());
          const common = myInterests.filter(i => i && theirInterests.includes(i));
          score += common.length * 15;
        }

        // Trending achievements (engagement based)
        const engagement = post.reactions.length + post.commentsCount * 2;
        score += engagement * 5;

        // Recency decay (subtract points for older posts)
        const ageInHours = (Date.now() - new Date(post.createdAt || '').getTime()) / (1000 * 60 * 60);
        score -= ageInHours * 1.5; // lose 1.5 points per hour

        return { post, score };
      });

      // Sort scored posts
      scoredPosts.sort((a, b) => b.score - a.score);

      res.json(scoredPosts.map(sp => sp.post));
    } catch (err: any) {
      console.error("Error fetching feed:", err);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 2. Create Post
  app.post("/api/social/posts", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const { content, imageUrl, achievementBadge, link, tags, category, isFounderUpdate } = req.body;
      if (!content) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const result = await db.insert(posts).values({
        userId: currentUser.id,
        content,
        imageUrl,
        achievementBadge,
        link,
        tags,
        category: category || "General",
        isFounderUpdate: isFounderUpdate || false
      }).returning();

      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 3. React to Post (like, celebrate, inspire, support)
  app.post("/api/social/posts/:id/react", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const postId = parseInt(req.params.id);
      const { type } = req.body; // 'like', 'celebrate', 'inspire', 'support'
      if (!type) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Check if post exists
      const postRecord = await db.select().from(posts).where(eq(posts.id, postId));
      if (postRecord.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });

      // Check existing reaction by user on this post
      const existing = await db.select().from(postReactions).where(
        and(eq(postReactions.postId, postId), eq(postReactions.userId, currentUser.id))
      );

      if (existing.length > 0) {
        if (existing[0].type === type) {
          // Toggle off
          await db.delete(postReactions).where(eq(postReactions.id, existing[0].id));
          return res.json({ toggledOff: true });
        } else {
          // Update type
          const updated = await db.update(postReactions).set({ type }).where(eq(postReactions.id, existing[0].id)).returning();
          return res.json(updated[0]);
        }
      }

      // Create new reaction
      const result = await db.insert(postReactions).values({
        postId,
        userId: currentUser.id,
        type
      }).returning();

      // Send notification if not react on own post
      if (postRecord[0].userId !== currentUser.id) {
        await db.insert(notifications).values({
          userId: postRecord[0].userId,
          actorId: currentUser.id,
          type: type, // 'like', 'celebrate', etc.
          postId
        });
      }

      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 4. Comment on Post
  app.post("/api/social/posts/:id/comments", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const postId = parseInt(req.params.id);
      const { content, parentId } = req.body;
      if (!content) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const postRecord = await db.select().from(posts).where(eq(posts.id, postId));
      if (postRecord.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });

      const result = await db.insert(postComments).values({
        postId,
        userId: currentUser.id,
        content,
        parentId: parentId || null
      }).returning();

      // Trigger notification if commenting on someone else's post
      if (postRecord[0].userId !== currentUser.id) {
        await db.insert(notifications).values({
          userId: postRecord[0].userId,
          actorId: currentUser.id,
          type: 'comment',
          postId,
          commentId: result[0].id
        });
      }

      res.json({
        ...result[0],
        user: currentUser
      });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 5. Get Comments for Post
  app.get("/api/social/posts/:id/comments", requireAuth, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentsList = await db.select().from(postComments).where(eq(postComments.postId, postId)).orderBy(desc(postComments.createdAt));

      const commentsWithUsers = await Promise.all(commentsList.map(async (comment) => {
        const creator = await db.select().from(users).where(eq(users.id, comment.userId));
        return {
          ...comment,
          user: creator[0] || null
        };
      }));

      res.json(commentsWithUsers);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 6. Connect / Follow Action
  app.post("/api/social/connect", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const { receiverId, type } = req.body; // type: 'connection' or 'follow'
      if (!receiverId || !type) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      if (currentUser.id === receiverId) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Check if connection already exists
      const existing = await db.select().from(connections).where(
        or(
          and(eq(connections.senderId, currentUser.id), eq(connections.receiverId, receiverId)),
          and(eq(connections.senderId, receiverId), eq(connections.receiverId, currentUser.id))
        )
      );

      if (existing.length > 0) {
        // If they requested/connected already
        const match = existing.find(c => c.senderId === currentUser.id && c.receiverId === receiverId && c.type === type);
        if (match) return res.json(match); // already sent
        return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      }

      // Create relation
      const status = type === 'follow' ? 'accepted' : 'pending';
      const result = await db.insert(connections).values({
        senderId: currentUser.id,
        receiverId,
        type,
        status
      }).returning();

      // Notification
      await db.insert(notifications).values({
        userId: receiverId,
        actorId: currentUser.id,
        type: type === 'follow' ? 'follow' : 'connection_request'
      });

      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 7. Accept Connection Request
  app.post("/api/social/connect/accept", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const { senderId } = req.body;
      if (!senderId) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Find pending connection
      const pending = await db.select().from(connections).where(
        and(
          eq(connections.senderId, senderId),
          eq(connections.receiverId, currentUser.id),
          eq(connections.type, 'connection'),
          eq(connections.status, 'pending')
        )
      );

      if (pending.length === 0) {
        return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });
      }

      // Update to accepted
      const updated = await db.update(connections).set({
        status: 'accepted'
      }).where(eq(connections.id, pending[0].id)).returning();

      // Trigger accept notification
      await db.insert(notifications).values({
        userId: senderId,
        actorId: currentUser.id,
        type: 'connection_accept'
      });

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Analytics Endpoints
  app.get("/api/analytics/impact", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Fetch user's applications
      const userApps = await db.select().from(applications).where(eq(applications.userId, currentUser.id));
      
      const scholarships = userApps.filter(app => app.type === 'scholarship' && app.status === 'accepted').length;
      const internships = userApps.filter(app => app.type === 'internship' && app.status === 'accepted').length;
      const admissions = userApps.filter(app => app.type === 'college' && app.status === 'accepted').length;
      
      // Calculate total platform stats
      const allApps = await db.select().from(applications).where(eq(applications.status, 'accepted'));
      
      res.json({
        user: { scholarships, internships, admissions },
        global: { totalOpportunitiesWon: allApps.length }
      });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Messaging Endpoints
  app.get("/api/messages/conversations", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Get all unique users we've chatted with
      const sent = await db.select({ partnerId: messages.receiverId }).from(messages).where(eq(messages.senderId, currentUser.id));
      const received = await db.select({ partnerId: messages.senderId }).from(messages).where(eq(messages.receiverId, currentUser.id));
      
      const partnerIds = [...new Set([...sent.map(s => s.partnerId), ...received.map(r => r.partnerId)])];
      
      if (partnerIds.length === 0) return res.json([]);
      
      const partners = await db.select().from(users).where(sql`${users.id} IN (${sql.join(partnerIds, sql`, `)})`);
      
      // Get last message for each partner
      const conversations = await Promise.all(partners.map(async (partner) => {
        const lastMsg = await db.select()
          .from(messages)
          .where(or(
            and(eq(messages.senderId, currentUser.id), eq(messages.receiverId, partner.id)),
            and(eq(messages.senderId, partner.id), eq(messages.receiverId, currentUser.id))
          ))
          .orderBy(desc(messages.createdAt))
          .limit(1);
          
        return {
          id: partner.id,
          name: partner.name,
          role: partner.grade ? `${partner.grade} Student` : 'User',
          lastMessage: lastMsg[0]?.content || '',
          time: lastMsg[0]?.createdAt,
          online: false,
          unread: 0
        };
      }));

      res.json(conversations.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()));
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.get("/api/messages/:userId", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      
      const otherUserId = parseInt(req.params.userId);

      const conversation = await db.select()
        .from(messages)
        .where(or(
          and(eq(messages.senderId, currentUser.id), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, currentUser.id))
        ))
        .orderBy(messages.createdAt);

      res.json(conversation);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/messages/:userId", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
      
      const receiverId = parseInt(req.params.userId);
      const { content } = req.body;
      if (!content) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const newMsg = await db.insert(messages).values({
        senderId: currentUser.id,
        receiverId,
        content
      }).returning();

      res.json(newMsg[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 8. Connection Counts & Status Details
  app.get("/api/social/connections", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      // Connections: mutual connection type where status = 'accepted'
      const mutual = await db.select().from(connections).where(
        and(
          eq(connections.type, 'connection'),
          eq(connections.status, 'accepted'),
          or(eq(connections.senderId, currentUser.id), eq(connections.receiverId, currentUser.id))
        )
      );

      // Following: user is sender in follows, or user is in mutual connection
      const followingList = await db.select().from(connections).where(
        and(
          eq(connections.senderId, currentUser.id),
          or(eq(connections.type, 'follow'), eq(connections.status, 'accepted'))
        )
      );

      // Followers: user is receiver in follows, or user is in mutual connection
      const followersList = await db.select().from(connections).where(
        or(
          and(eq(connections.receiverId, currentUser.id), eq(connections.type, 'follow')),
          and(
            eq(connections.type, 'connection'),
            eq(connections.status, 'accepted'),
            or(eq(connections.senderId, currentUser.id), eq(connections.receiverId, currentUser.id))
          )
        )
      );

      // Pending incoming connections
      const incomingRequests = await db.select().from(connections).where(
        and(
          eq(connections.receiverId, currentUser.id),
          eq(connections.type, 'connection'),
          eq(connections.status, 'pending')
        )
      );

      const incomingWithUsers = await Promise.all(incomingRequests.map(async (r) => {
        const u = await db.select().from(users).where(eq(users.id, r.senderId));
        return {
          ...r,
          sender: u[0] || null
        };
      }));

      res.json({
        connectionsCount: mutual.length,
        followingCount: followingList.length,
        followersCount: followersList.length,
        incomingRequests: incomingWithUsers,
      });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 9. Fetch Notifications
  app.get("/api/social/notifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const list = await db.select().from(notifications).where(eq(notifications.userId, currentUser.id)).orderBy(desc(notifications.createdAt));

      const enriched = await Promise.all(list.map(async (n) => {
        const actor = await db.select().from(users).where(eq(users.id, n.actorId));
        let postPreview = null;
        if (n.postId) {
          const p = await db.select().from(posts).where(eq(posts.id, n.postId));
          if (p.length > 0) {
            postPreview = p[0].content.slice(0, 40) + "...";
          }
        }
        return {
          ...n,
          actor: actor[0] || null,
          postPreview
        };
      }));

      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 10. Mark Notifications as Read
  app.post("/api/social/notifications/read", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, currentUser.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 11. Profile Update
  app.post("/api/social/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const { headline, bio, portfolioUrl, skills, avatarUrl, grade, interests, goals, country } = req.body;

      const updated = await db.update(users).set({
        headline,
        bio,
        portfolioUrl,
        skills,
        avatarUrl,
        grade,
        interests,
        goals,
        country
      }).where(eq(users.uid, req.user.uid)).returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 12. Fetch Any User Profile Detail
  app.get("/api/social/profile/:userId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      const userRecord = await db.select().from(users).where(eq(users.id, targetUserId));
      if (userRecord.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });

      const profileUser = userRecord[0];

      // Fetch academic profile
      const acad = await db.select().from(academicProfiles).where(eq(academicProfiles.userId, targetUserId));
      
      // Fetch activities (leadership, volunteer, research, competitions, awards, projects)
      const userActivities = await db.select().from(activities).where(eq(activities.userId, targetUserId));

      // Fetch posts by user
      const userPosts = await db.select().from(posts).where(eq(posts.userId, targetUserId)).orderBy(desc(posts.createdAt));

      // Enrich posts with reactions and comments count
      const enrichedPosts = await Promise.all(userPosts.map(async (post) => {
        const reactions = await db.select().from(postReactions).where(eq(postReactions.postId, post.id));
        const comments = await db.select().from(postComments).where(eq(postComments.postId, post.id));
        return {
          ...post,
          reactions,
          reactionCounts: {
            like: reactions.filter(r => r.type === 'like').length,
            celebrate: reactions.filter(r => r.type === 'celebrate').length,
            inspire: reactions.filter(r => r.type === 'inspire').length,
            support: reactions.filter(r => r.type === 'support').length,
          },
          commentsCount: comments.length,
        };
      }));

      // Connections details
      const mutual = await db.select().from(connections).where(
        and(
          eq(connections.type, 'connection'),
          eq(connections.status, 'accepted'),
          or(eq(connections.senderId, targetUserId), eq(connections.receiverId, targetUserId))
        )
      );

      const followingList = await db.select().from(connections).where(
        and(
          eq(connections.senderId, targetUserId),
          or(eq(connections.type, 'follow'), eq(connections.status, 'accepted'))
        )
      );

      const followersList = await db.select().from(connections).where(
        or(
          and(eq(connections.receiverId, targetUserId), eq(connections.type, 'follow')),
          and(
            eq(connections.type, 'connection'),
            eq(connections.status, 'accepted'),
            or(eq(connections.senderId, targetUserId), eq(connections.receiverId, targetUserId))
          )
        )
      );

      // Check current connection state between logged user and targetUser
      const loggedInRecord = await getDbUser(req.user?.uid || "");
      let connectionState: any = null;
      if (loggedInRecord && loggedInRecord.id !== targetUserId) {
        const existing = await db.select().from(connections).where(
          or(
            and(eq(connections.senderId, loggedInRecord.id), eq(connections.receiverId, targetUserId)),
            and(eq(connections.senderId, targetUserId), eq(connections.receiverId, loggedInRecord.id))
          )
        );
        if (existing.length > 0) {
          connectionState = existing[0];
        }
      }

      res.json({
        user: profileUser,
        academicProfile: acad[0] || null,
        activities: userActivities,
        posts: enrichedPosts,
        connectionsCount: mutual.length,
        followingCount: followingList.length,
        followersCount: followersList.length,
        connectionState,
      });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 13. Dynamic Leaderboard using Real Database Users ONLY (Strict Integrity!)
  app.get("/api/social/leaderboard", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      if (allUsers.length === 0) {
        return res.json([]);
      }

      const leaderboardEntries = await Promise.all(allUsers.map(async (u) => {
        // Compute score based on real user achievements
        const acad = await db.select().from(academicProfiles).where(eq(academicProfiles.userId, u.id));
        const userActivities = await db.select().from(activities).where(eq(activities.userId, u.id));
        const userPosts = await db.select().from(posts).where(eq(posts.userId, u.id));

        // Approved verification badges
        const badgeCount = (u.verificationBadges || "").split(",").filter(b => b.trim().length > 0).length;

        let score = 0;
        score += badgeCount * 150; // Each verification badge is huge
        
        // Academic profile weight (AP, Honors courses)
        if (acad.length > 0) {
          score += (acad[0].apCourses || 0) * 30;
          score += (acad[0].honorsCourses || 0) * 15;
          if (acad[0].gpa) {
            score += Math.round(acad[0].gpa * 50); // e.g. 4.0 GPA adds 200 points
          }
        }

        // Activities logged
        userActivities.forEach(act => {
          score += 20; // 20 points per activity entry
          score += (act.hours || 0) * 2; // 2 points per logged hour
          if (act.type?.toLowerCase() === 'leadership') score += 15;
          if (act.type?.toLowerCase() === 'research') score += 20;
          if (act.type?.toLowerCase() === 'award') score += 25;
        });

        // Posts shared
        score += userPosts.length * 10;

        return {
          id: u.id,
          name: u.name || "Anonymous Student",
          avatarUrl: u.avatarUrl,
          headline: u.headline || `${u.grade || "Student"}`,
          country: u.country,
          grade: u.grade,
          verificationBadges: u.verificationBadges,
          score,
          activitiesCount: userActivities.length,
          postsCount: userPosts.length,
        };
      }));

      // Sort by score descending and remove any zero-score users if we want, or list them. Let's list all sorted.
      leaderboardEntries.sort((a, b) => b.score - a.score);

      res.json(leaderboardEntries);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 14. Trending Students (using Real database users)
  app.get("/api/social/trending", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      if (allUsers.length === 0) return res.json({ active: [], volunteers: [], scholarshipWinners: [], competitors: [] });

      const usersWithMetrics = await Promise.all(allUsers.map(async (u) => {
        const userActivities = await db.select().from(activities).where(eq(activities.userId, u.id));
        const userPosts = await db.select().from(posts).where(eq(posts.userId, u.id));
        
        const volunteerHours = userActivities
          .filter(a => a.type?.toLowerCase().includes('volunteer'))
          .reduce((sum, current) => sum + (current.hours || 0), 0);

        const hasScholarshipBadge = (u.verificationBadges || "").toLowerCase().includes("scholarship");
        const hasCompetitionBadge = (u.verificationBadges || "").toLowerCase().includes("competition");

        return {
          id: u.id,
          name: u.name,
          avatarUrl: u.avatarUrl,
          headline: u.headline || `${u.grade || "Student"}`,
          country: u.country,
          verificationBadges: u.verificationBadges,
          postsCount: userPosts.length,
          activitiesCount: userActivities.length,
          volunteerHours,
          hasScholarshipBadge,
          hasCompetitionBadge,
        };
      }));

      // Active
      const active = [...usersWithMetrics]
        .filter(u => u.postsCount > 0 || u.activitiesCount > 0)
        .sort((a, b) => b.postsCount - a.postsCount)
        .slice(0, 5);

      // Volunteers
      const volunteers = [...usersWithMetrics]
        .filter(u => u.volunteerHours > 0)
        .sort((a, b) => b.volunteerHours - a.volunteerHours)
        .slice(0, 5);

      // Scholarship Winners
      const scholarshipWinners = [...usersWithMetrics]
        .filter(u => u.hasScholarshipBadge)
        .slice(0, 5);

      // Competitors
      const competitors = [...usersWithMetrics]
        .filter(u => u.hasCompetitionBadge)
        .slice(0, 5);

      res.json({
        active,
        volunteers,
        scholarshipWinners,
        competitors
      });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 15. Profile Verification Application
  app.post("/api/social/verify", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error_code: 'UNAUTHORIZED', user_friendly_message: 'You must be logged in to perform this action.' });
      const currentUser = await getDbUser(req.user.uid);
      if (!currentUser) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const { badgeType, proof } = req.body;
      if (!badgeType || !proof) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const result = await db.insert(verificationRequests).values({
        userId: currentUser.id,
        badgeType,
        proof,
        status: 'pending'
      }).returning();

      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // 16. Admin/Moderator approval endpoint
  app.get("/api/social/verification-requests", requireAuth, async (req: AuthRequest, res) => {
    try {
      const list = await db.select().from(verificationRequests).orderBy(desc(verificationRequests.createdAt));
      const enriched = await Promise.all(list.map(async (r) => {
        const u = await db.select().from(users).where(eq(users.id, r.userId));
        return {
          ...r,
          user: u[0] || null
        };
      }));
      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/social/verify-approve", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { requestId, status } = req.body; // status = 'approved' or 'rejected'
      if (!requestId || !status) return res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });

      const reqRecord = await db.select().from(verificationRequests).where(eq(verificationRequests.id, requestId));
      if (reqRecord.length === 0) return res.status(404).json({ error_code: 'NOT_FOUND', user_friendly_message: 'The requested resource could not be found.' });

      // Update request status
      await db.update(verificationRequests).set({ status }).where(eq(verificationRequests.id, requestId));

      if (status === 'approved') {
        // Append badge to user
        const targetUser = await db.select().from(users).where(eq(users.id, reqRecord[0].userId));
        if (targetUser.length > 0) {
          const currentBadges = targetUser[0].verificationBadges || "";
          const badgeList = currentBadges.split(",").map(b => b.trim()).filter(b => b.length > 0);
          if (!badgeList.includes(reqRecord[0].badgeType)) {
            badgeList.push(reqRecord[0].badgeType);
          }
          await db.update(users).set({
            verificationBadges: badgeList.join(", ")
          }).where(eq(users.id, reqRecord[0].userId));

          // Send notification
          await db.insert(notifications).values({
            userId: reqRecord[0].userId,
            actorId: reqRecord[0].userId, // Self/admin trigger
            type: 'connection_accept', // Reused type for badges update
          });
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/agents/chat", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { agentId, message, history } = req.body;
      let systemInstruction = "You are a helpful AI assistant.";
      
      switch(agentId) {
        case "admissions":
          systemInstruction = "You are an Ivy League & Top-Tier Admissions Strategist. You provide high-level narrative and strategy advice for college applications. Be concise, strategic, and brutally honest but encouraging.";
          break;
        case "scholarship":
          systemInstruction = "You are a Scholarship Hunter AI. You find obscure scholarships, calculate ROI, and advise students on financial aid strategy.";
          break;
        case "career":
          systemInstruction = "You are a Career Architect AI. You help reverse-engineer career paths from 10-year goals, suggesting internships, pathways, and skills.";
          break;
        case "founder":
          systemInstruction = "You are a Startup Mentor AI for ambitious teens. You evaluate ideas, suggest pivots, and help structure pitches for venture-scale ideas.";
          break;
        case "essay":
          systemInstruction = "You are an Elite Essay Reviewer. You provide narrative and tone coaching. Do not just fix grammar; analyze the emotional hook and structure.";
          break;
      }

      // We use HIGH thinking level via generateChatContent's isComplex flag
      const reply = await generateChatContent(systemInstruction, history, message, true);
      res.json({ reply });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  app.post("/api/twin/analyze", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { targetGoal } = req.body;
      const systemInstruction = `You are the TeenLaunch Student Digital Twin AI.
You perform Gap Analysis and generate Opportunity Roadmaps for ambitious students.
The student's target goal is ${targetGoal}. 
Assume a baseline smart student who has good grades (3.8 GPA) but lacks highly specific spikes.
Return ONLY valid JSON with this structure:
{
  "readiness": {
    "college": 75,
    "scholarship": 60,
    "internship": 40,
    "research": 30
  },
  "gaps": [
    { "title": "Lack of Independent Research", "severity": "High", "description": "No published or structured research in CS.", "recommendation": "Cold email 10 local university professors asking to assist in ML labs." }
  ],
  "roadmap": [
    { "timeframe": "Next 3 Months", "action": "Secure Research Mentor", "details": "Utilize the Research Matching engine to find a local PI." }
  ]
}`;
      const response = await generateChatContent(systemInstruction, [], "Run analysis", true);
      const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (err: any) {
      res.status(500).json({ error_code: 'INTERNAL_SERVER_ERROR', user_friendly_message: 'An unexpected error occurred on the server.' });
    }
  });

  // Global Error-Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("SERVER CRASH LOG:", err.stack || err);
    res.status(err.status || 500).json({
      error: true,
      message: err.message || "An unexpected error occurred on the server.",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
