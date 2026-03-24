import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// Article content stored as simple objects — will migrate to MDX files later
const ARTICLES: Record<string, { title: string; date: string; readTime: string; category: string; content: string }> = {
  "how-to-build-a-house-in-togo": {
    title: "How to build a house in Togo: A complete guide for diaspora builders",
    date: "2026-03-20",
    readTime: "12 min",
    category: "West Africa",
    content: `Building a home in Togo from abroad is one of the most significant investments a diaspora family can make. Whether you are in the United States, France, or Germany, this guide walks you through every step of the process.

## Understanding the Togo construction market

Togo uses the **poteau-poutre** construction method — reinforced concrete columns and beams filled with concrete block walls. This is fundamentally different from the wood-frame construction common in the United States. Materials include cement blocks (agglo), rebar (fer a beton), concrete, and sand.

Labor costs in Lome typically range from 2,000 to 5,000 FCFA per day for general laborers and 5,000 to 15,000 FCFA per day for skilled tradespeople like masons (macons) and electricians.

## Securing land: The titre foncier process

Before building, you need secure land ownership. In Togo, this means obtaining a **titre foncier** (land title). The process involves:

1. **Identify the land** — work with a local agent or family member
2. **Verify ownership** — check with the cadastre (land registry) in Lome
3. **Draft a sales agreement** — use a notary (notaire) to formalize the purchase
4. **Register with authorities** — file at the Direction des Affaires Domaniales
5. **Obtain the titre foncier** — this can take 6-18 months

*This is educational guidance. Consult a licensed professional for your specific situation.*

## Financing: Phased cash building

Unlike the US, construction loans are rare in Togo. Most builders use **phased cash funding** — building in stages as money becomes available:

- **Phase 1:** Foundation and columns (30-40% of total cost)
- **Phase 2:** Walls and roof (25-30%)
- **Phase 3:** Plumbing, electrical, and finishes (30-40%)

This approach means construction can take 1-3 years but avoids interest payments entirely.

## Managing construction remotely

The biggest challenge for diaspora builders is oversight. Key strategies:

- **Hire a trusted foreman** (chef de chantier) who sends daily photo updates
- **Use milestone-based payments** — pay only when verified work is complete
- **Request timestamped, geotagged photos** for every payment milestone
- **Visit the site** at least twice during construction if possible
- **Use Keystone** to track progress, verify photos, and manage payments from anywhere

## Common pitfalls to avoid

- Buying land without a titre foncier (informal sales can be contested)
- Paying the full amount upfront to a contractor
- Not getting structural engineering review for column placement
- Using substandard cement or insufficient rebar
- Not budgeting for the "finitions" (finishing work) which often costs more than expected

## Cost estimates for 2026

A typical 3-bedroom house in Lome costs between 15,000,000 and 35,000,000 FCFA ($25,000-$58,000 USD) depending on size, location, and quality of finishes. Land in Lome ranges from 5,000 to 50,000 FCFA per square meter depending on the neighborhood.

*All costs are estimates and vary by location, materials, and market conditions. This is educational guidance. Consult local professionals for accurate quotes.*`,
  },
  "owner-builder-checklist-usa": {
    title: "The owner-builder checklist: 50 things to do before breaking ground",
    date: "2026-03-18",
    readTime: "8 min",
    category: "USA",
    content: `Being an owner-builder means you are acting as your own general contractor. It is one of the most rewarding ways to build a home, but it requires careful planning. Here are 50 things to do before your first shovel hits dirt.

## Planning phase (items 1-15)

1. Define your budget realistically — include a 15-20% contingency
2. Get pre-qualified for a construction loan (if not paying cash)
3. Research your target neighborhood's zoning regulations
4. Hire an architect or purchase stock plans
5. Get a preliminary cost estimate from a quantity surveyor
6. Verify your lot is buildable (soil test, survey, setbacks)
7. Check for easements, flood zones, or environmental restrictions
8. Research local building code requirements (IRC for residential)
9. Understand the permit process and timeline for your jurisdiction
10. Set a realistic construction timeline (typical: 8-12 months)
11. Research builder's risk insurance requirements
12. Set up a dedicated construction bank account
13. Create a draw schedule aligned with construction milestones
14. Interview at least 3 subcontractors for each major trade
15. Get your plans reviewed by a structural engineer

## Pre-construction (items 16-30)

16. Submit plans to your local building department
17. Address any plan review comments and resubmit
18. Obtain your building permit
19. Secure builder's risk insurance
20. Set up temporary utilities (power, water) for the site
21. Order a portable toilet for the construction site
22. Establish a material delivery schedule
23. Get firm quotes from all subcontractors
24. Sign contracts with subcontractors (include scope, timeline, payment terms)
25. Order long-lead items (windows, doors, custom materials)
26. Arrange for site clearing and grading
27. Confirm utility connection availability (water, sewer, electric, gas)
28. Create a construction schedule with your key subs
29. Set up a project management system (like Keystone)
30. Brief your lender on the construction timeline and draw schedule

## During construction (items 31-50)

31. Keep a daily construction log
32. Take photos every day from the same angles
33. Review every invoice before paying
34. Schedule inspections as required by your building department
35. Maintain a punch list throughout construction
36. Hold weekly meetings with your key subcontractors
37. Monitor material deliveries and quality
38. Track change orders and their cost impact
39. Keep all receipts organized for tax purposes
40. Verify insurance coverage is maintained throughout
41. Schedule rough-in inspections before closing walls
42. Review energy efficiency before insulation goes in
43. Walk the site weekly and document progress
44. Maintain clear communication with your lender
45. Schedule final inspection and certificate of occupancy
46. Complete all punch list items before final payments
47. Collect all warranties and manuals from subcontractors
48. Get final lien waivers from all subcontractors
49. Complete your certificate of occupancy paperwork
50. Celebrate — you built your own home

*This is educational guidance. Consult licensed professionals for your specific situation.*`,
  },
  "construction-loan-vs-cash-building": {
    title: "Construction loan vs. cash building: Which is right for you?",
    date: "2026-03-15",
    readTime: "10 min",
    category: "Finance",
    content: `The way you finance your construction project fundamentally shapes your building experience. In the United States, construction loans are the norm. In West Africa, phased cash building is standard. Each has distinct advantages.

## Construction loans (US model)

A construction loan provides upfront capital to build your entire home at once. Key characteristics:

- **Interest rates:** Typically 1-2% above conventional mortgage rates
- **Draw schedule:** Lender releases funds at predetermined milestones
- **Term:** Usually 12-18 months, then converts to a permanent mortgage
- **Down payment:** Typically 20-25% of total project cost
- **Inspections:** Lender sends an inspector before each draw

**Advantages:**
- Build the entire home at once (faster completion)
- Professional oversight from lender inspections
- Locked-in timeline and budget

**Disadvantages:**
- Interest payments during construction ($500-$2,000/month on average)
- Strict qualification requirements (DTI ratio, credit score)
- Less flexibility to change plans mid-build
- Risk of cost overruns requiring personal funds

## Phased cash building (West Africa model)

In Togo, Ghana, and Benin, most homes are built in phases using saved cash, diaspora transfers, or tontine (community savings group) contributions.

**Advantages:**
- No interest payments — ever
- Build at your own pace
- No bank qualification required
- Flexibility to adjust plans between phases

**Disadvantages:**
- Construction takes 1-5 years
- Structure exposed to weather between phases
- Quality control harder over long timelines
- No professional lender oversight

## Cost comparison

For a $300,000 home in the US with a construction loan at 8%:
- Interest during 12-month build: approximately $12,000-$18,000
- Closing costs: approximately $5,000-$8,000
- **Total financing cost: $17,000-$26,000**

For a 25,000,000 FCFA home in Togo built in 3 phases over 2 years:
- No interest costs
- No closing costs
- **Total financing cost: $0**

However, inflation may increase material costs 5-10% per year during a phased build, effectively adding $1,250-$2,500 in costs per year.

*This is educational guidance. Consult a licensed financial professional for your specific situation.*`,
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) return { title: "Article not found — Keystone" };
  return {
    title: `${article.title} — Keystone Blog`,
    description: article.content.slice(0, 160),
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[24px] text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>Article not found</h1>
          <Link href="/blog" className="text-[13px] text-clay hover:underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  // Simple markdown-to-HTML renderer for article content
  const sections = article.content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return <h2 key={i} className="text-[20px] text-earth mt-8 mb-3" style={{ fontFamily: "var(--font-heading)" }}>{block.slice(3)}</h2>;
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 mb-4">
          {items.map((item, j) => (
            <li key={j} className="text-[14px] text-slate leading-relaxed">{renderInline(item.slice(2))}</li>
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").filter((l) => /^\d+\.\s/.test(l));
      return (
        <ol key={i} className="list-decimal list-inside space-y-1.5 mb-4">
          {items.map((item, j) => (
            <li key={j} className="text-[14px] text-slate leading-relaxed">{renderInline(item.replace(/^\d+\.\s/, ""))}</li>
          ))}
        </ol>
      );
    }
    if (block.startsWith("*") && block.endsWith("*") && !block.startsWith("**")) {
      return <p key={i} className="text-[12px] text-muted italic mt-6 mb-4 border-l-2 border-sand pl-4">{block.slice(1, -1)}</p>;
    }
    return <p key={i} className="text-[14px] text-slate leading-relaxed mb-4">{renderInline(block)}</p>;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-muted hover:text-earth transition-colors text-[13px]">
            <ArrowLeft size={14} />
            Back to blog
          </Link>
          <Link href="/register" className="px-4 py-2 text-[12px] font-medium bg-earth text-warm rounded-xl hover:opacity-90 transition-opacity">
            Start free
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <div className="mb-8">
          <span className="text-[10px] font-medium text-clay uppercase tracking-wider">{article.category}</span>
          <h1 className="text-[28px] text-earth mt-2 mb-3 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {article.title}
          </h1>
          <p className="text-[12px] text-muted">
            {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &middot; {article.readTime} read
          </p>
        </div>

        <div className="prose-keystone">
          {sections}
        </div>

        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-[15px] text-earth mb-2" style={{ fontFamily: "var(--font-heading)" }}>Ready to start your build?</p>
          <p className="text-[13px] text-muted mb-4">Keystone guides you from first idea to final key.</p>
          <Link href="/register" className="inline-flex px-6 py-3 text-[13px] font-medium bg-earth text-warm rounded-xl hover:opacity-90 transition-opacity">
            Start your project free
          </Link>
        </div>
      </article>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-earth">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
