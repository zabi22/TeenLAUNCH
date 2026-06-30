/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { AuthProvider } from "./components/AuthContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import Layout from "./components/Layout.tsx";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Opportunities from "./pages/Opportunities.tsx";
import OpportunityDetail from "./pages/OpportunityDetail.tsx";
import Profile from "./pages/Profile.tsx";
import AcademicProfile from "./pages/AcademicProfile.tsx";
import ApplicationTracker from "./pages/ApplicationTracker.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import ActivityTracker from "./pages/ActivityTracker.tsx";
import CollegeAnalyzer from "./pages/CollegeAnalyzer.tsx";
import EssayAssistant from "./pages/EssayAssistant.tsx";
import Network from "./pages/Network.tsx";
import InterviewPrep from "./pages/InterviewPrep.tsx";
import Messages from "./pages/Messages.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import AiAgents from "./pages/AiAgents.tsx";
import CareerSimulator from "./pages/CareerSimulator.tsx";
import DigitalTwin from "./pages/DigitalTwin.tsx";
import FounderMode from "./pages/FounderMode.tsx";
import AchievementVault from "./pages/AchievementVault.tsx";
import ResearchMatching from "./pages/ResearchMatching.tsx";
import CounselorDashboard from "./pages/CounselorDashboard.tsx";
import ParentDashboard from "./pages/ParentDashboard.tsx";
import ImpactAnalytics from "./pages/ImpactAnalytics.tsx";
import DiscoveryDashboard from "./pages/DiscoveryDashboard.tsx";
import OpportunityMarketplace from "./pages/OpportunityMarketplace.tsx";
import PortfolioBuilder from "./pages/PortfolioBuilder.tsx";
import DocumentUpload from "./pages/DocumentUpload.tsx";
import { ToastContainer } from "./components/ui/ToastContainer.tsx";

import { ThemeProvider } from "./components/ThemeContext.tsx";

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      <ToastContainer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/" element={<Layout />}>
          <Route index element={<PageTransition><Landing /></PageTransition>} />
          <Route path="messages" element={<PageTransition><Messages /></PageTransition>} />
          <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="opportunities" element={<PageTransition><Opportunities /></PageTransition>} />
          <Route path="opportunities/:id" element={<PageTransition><OpportunityDetail /></PageTransition>} />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="academic-profile" element={<PageTransition><AcademicProfile /></PageTransition>} />
          <Route path="applications" element={<PageTransition><ApplicationTracker /></PageTransition>} />
          <Route path="analyzer" element={<PageTransition><CollegeAnalyzer /></PageTransition>} />
          <Route path="roadmap" element={<PageTransition><Roadmap /></PageTransition>} />
          <Route path="activities" element={<PageTransition><ActivityTracker /></PageTransition>} />
          <Route path="essay" element={<PageTransition><EssayAssistant /></PageTransition>} />
          <Route path="interview" element={<PageTransition><InterviewPrep /></PageTransition>} />
          <Route path="network" element={<PageTransition><Network /></PageTransition>} />
          <Route path="leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
          <Route path="agents" element={<PageTransition><AiAgents /></PageTransition>} />
          <Route path="career" element={<PageTransition><CareerSimulator /></PageTransition>} />
          <Route path="twin" element={<PageTransition><DigitalTwin /></PageTransition>} />
          <Route path="founder" element={<PageTransition><FounderMode /></PageTransition>} />
          <Route path="vault" element={<PageTransition><AchievementVault /></PageTransition>} />
          <Route path="research" element={<PageTransition><ResearchMatching /></PageTransition>} />
          <Route path="counselor" element={<PageTransition><CounselorDashboard /></PageTransition>} />
          <Route path="parent" element={<PageTransition><ParentDashboard /></PageTransition>} />
          <Route path="analytics" element={<PageTransition><ImpactAnalytics /></PageTransition>} />
          <Route path="discovery" element={<PageTransition><DiscoveryDashboard /></PageTransition>} />
          <Route path="marketplace" element={<PageTransition><OpportunityMarketplace /></PageTransition>} />
          <Route path="portfolio" element={<PageTransition><PortfolioBuilder /></PageTransition>} />
          <Route path="portfolio/documents" element={<PageTransition><DocumentUpload /></PageTransition>} />
          <Route path="*" element={<PageTransition><Navigate to="/" replace /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
