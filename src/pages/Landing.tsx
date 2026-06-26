import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, GraduationCap, Code, Trophy, Search, Globe } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import Logo from "../components/Logo.tsx";

export default function Landing() {
  const { signIn, user } = useAuth();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-slate-50">
      {/* Premium Navbar Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 px-6 border-b border-slate-200/50">
        <Link to="/">
          <Logo variant="light" size="md" />
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/opportunities" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors">
            Explore Opportunities
          </Link>
          {!user ? (
            <button
              onClick={() => signIn()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white px-5 transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.02]"
            >
              Log In / Register
            </button>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white px-5 transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.02]"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 mb-8 shadow-sm shadow-indigo-100">
          <Sparkles className="mr-2 h-4 w-4" />
          <span className="uppercase tracking-widest text-[10px] font-black">Launch Your Future</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 max-w-4xl text-slate-900">
          Find opportunities tailored to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ambition.</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-slate-600 md:text-xl leading-relaxed mb-10">
          Discover scholarships, internships, competitions, and programs designed for high school students looking to strengthen their future.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {!user ? (
            <button
              onClick={() => signIn()}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          ) : (
             <Link
              to="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
          <Link
            to="/opportunities"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-none"
          >
            Browse Opportunities
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full py-16 border-t border-slate-200">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Explore by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Scholarships", icon: GraduationCap, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
            { name: "Internships", icon: Search, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
            { name: "Competitions", icon: Trophy, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
            { name: "Hackathons", icon: Code, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
          ].map((cat) => (
            <Link key={cat.name} to={`/opportunities?category=${cat.name}`} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 flex flex-col items-center text-center">
              <div className={`mb-4 rounded-xl p-4 ${cat.bg} border ${cat.border}`}>
                <cat.icon className={`h-8 w-8 ${cat.color}`} />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="w-full py-16 md:py-24 border-t border-slate-100 bg-slate-50/50 rounded-3xl my-12 px-6 max-w-5xl">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Everything you need to stand out
          </h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            Our platform simplifies the search for high-caliber extracurriculars and financial aid, giving you a competitive edge.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Global & Local Tailoring</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Find programs matching your home country and eligibility criteria with our smart filtering. No more wasted time on unavailable awards.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Driven Matching</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Receive smart recommendations based on your unique academic profile, grade level, and interests, keeping you ahead of application timelines.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Portfolio Curation</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Organize saved internships, research opportunities, and scholarships into a unified tracker to map out your extracurricular milestone goals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
