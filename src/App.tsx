/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.tsx";
import Layout from "./components/Layout.tsx";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Opportunities from "./pages/Opportunities.tsx";
import OpportunityDetail from "./pages/OpportunityDetail.tsx";
import Profile from "./pages/Profile.tsx";
import AcademicProfile from "./pages/AcademicProfile.tsx";
import ApplicationTracker from "./pages/ApplicationTracker.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import ActivityTracker from "./pages/ActivityTracker.tsx";
import CollegeAnalyzer from "./pages/CollegeAnalyzer.tsx";
import AchievementVault from "./pages/AchievementVault.tsx";
import FounderMode from "./pages/FounderMode.tsx";
import CareerSimulator from "./pages/CareerSimulator.tsx";
import EssayAssistant from "./pages/EssayAssistant.tsx";
import Network from "./pages/Network.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="opportunities/:id" element={<OpportunityDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="academic-profile" element={<AcademicProfile />} />
            <Route path="applications" element={<ApplicationTracker />} />
            <Route path="analyzer" element={<CollegeAnalyzer />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="activities" element={<ActivityTracker />} />
            <Route path="vault" element={<AchievementVault />} />
            <Route path="founder" element={<FounderMode />} />
            <Route path="career" element={<CareerSimulator />} />
            <Route path="essay" element={<EssayAssistant />} />
            <Route path="network" element={<Network />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
