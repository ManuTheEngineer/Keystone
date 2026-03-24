import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Keystone",
  description: "Construction guides, market insights, and building tips for owner-builders in the US and West Africa.",
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const POSTS: BlogPost[] = [
  {
    slug: "how-to-build-a-house-in-togo",
    title: "How to build a house in Togo: A complete guide for diaspora builders",
    excerpt: "Everything you need to know about building a home in Togo from abroad — land acquisition, titre foncier, contractor management, and phased cash funding.",
    date: "2026-03-20",
    readTime: "12 min",
    category: "West Africa",
  },
  {
    slug: "owner-builder-checklist-usa",
    title: "The owner-builder checklist: 50 things to do before breaking ground",
    excerpt: "A step-by-step checklist for first-time owner-builders in the United States, from financing to permits to contractor selection.",
    date: "2026-03-18",
    readTime: "8 min",
    category: "USA",
  },
  {
    slug: "construction-loan-vs-cash-building",
    title: "Construction loan vs. cash building: Which is right for you?",
    excerpt: "Compare the pros and cons of construction loans in the US versus phased cash building common in West Africa. Includes a cost analysis.",
    date: "2026-03-15",
    readTime: "10 min",
    category: "Finance",
  },
  {
    slug: "poteau-poutre-construction-explained",
    title: "Poteau-poutre construction explained: The backbone of West African building",
    excerpt: "Understanding the reinforced concrete column-and-beam construction method used across Togo, Ghana, and Benin — how it works, costs, and quality control.",
    date: "2026-03-12",
    readTime: "7 min",
    category: "West Africa",
  },
  {
    slug: "managing-construction-remotely",
    title: "5 ways to manage your construction project remotely",
    excerpt: "Practical strategies for diaspora builders who need to oversee construction from thousands of miles away — photo verification, milestone payments, and more.",
    date: "2026-03-10",
    readTime: "6 min",
    category: "Remote building",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "West Africa": "bg-accent-wa/10 text-accent-wa",
  "USA": "bg-accent-usa/10 text-accent-usa",
  "Finance": "bg-success/10 text-success",
  "Remote building": "bg-clay/10 text-clay",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-earth hover:opacity-80 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 16H28L16 2Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
              <rect x="8" y="16" width="16" height="12" stroke="currentColor" strokeWidth="2" fill="none" rx="1" />
            </svg>
            <span className="text-[13px] font-medium">Keystone</span>
          </Link>
          <Link href="/register" className="px-4 py-2 text-[12px] font-medium bg-earth text-warm rounded-xl hover:opacity-90 transition-opacity">
            Start free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-[32px] text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Construction insights
        </h1>
        <p className="text-[15px] text-muted max-w-lg leading-relaxed">
          Guides, tips, and market intelligence for owner-builders in the United States and West Africa.
        </p>
      </section>

      {/* Posts */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-6">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group bg-surface border border-border/30 rounded-2xl p-6 hover:border-sand/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${CATEGORY_COLORS[post.category] ?? "bg-warm/50 text-muted"}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <Calendar size={10} />
                  {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-[10px] text-muted">{post.readTime} read</span>
              </div>
              <h2 className="text-[18px] text-earth mb-2 group-hover:text-clay transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                {post.title}
              </h2>
              <p className="text-[13px] text-muted leading-relaxed mb-3">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-[12px] text-clay font-medium group-hover:gap-2 transition-all">
                Read article <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 text-center">
        <p className="text-[11px] text-muted">
          &copy; 2026 Keystone. <Link href="/" className="text-clay hover:underline">Back to home</Link>
        </p>
      </footer>
    </div>
  );
}
