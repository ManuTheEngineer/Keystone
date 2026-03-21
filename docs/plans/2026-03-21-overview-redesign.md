# Overview Page Redesign — Mission Control

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 3060-line overview page with a ~500-line single-screen "mission control" dashboard that requires zero scrolling on desktop.

**Architecture:** Fixed-height grid layout with 3 zones: header strip (KPIs), main panel (milestone workflow), side panel (charts + activity + alerts). All phase-specific conditional rendering eliminated — same layout for all 9 phases.

**Tech Stack:** React, Tailwind CSS, existing chart components, existing data subscriptions

---

### Task 1: Write the new overview client

**Files:**
- Replace: `apps/web/src/app/(dashboard)/project/[id]/overview/_client.tsx`

Single complete rewrite preserving all data subscriptions, handlers (approve/reject/complete task, change orders, ratings), and export/presentation modals. New layout:

1. Header: project name + phase + progress bar + 6 KPI cells
2. Left panel (55%): Milestone-grouped tasks + phase gate
3. Right panel (45%): Spend vs progress chart, recent activity feed, alerts
4. Bottom strip: Review queue banner (conditional)

### Task 2: Verify build and push

Run `next build`, commit, push.
