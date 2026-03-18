/**
 * Calendar integration — generate .ics files for construction milestones,
 * inspection dates, and project deadlines.
 *
 * Users can download .ics files that import into Google Calendar,
 * Apple Calendar, Outlook, and any iCal-compatible app.
 */

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  allDay?: boolean;
}

/**
 * Generate a single .ics calendar event.
 */
export function generateICSEvent(event: CalendarEvent): string {
  const formatDate = (d: Date, allDay?: boolean) => {
    if (allDay) {
      return d.toISOString().replace(/[-:]/g, "").split("T")[0];
    }
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const end = event.endDate ?? new Date(event.startDate.getTime() + 60 * 60 * 1000); // default 1 hour
  const uid = `keystone-${Date.now()}-${Math.random().toString(36).slice(2)}@keystone.build`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Keystone//Construction Management//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`
      : `DTSTART:${formatDate(event.startDate)}`,
    event.allDay
      ? `DTEND;VALUE=DATE:${formatDate(end, true)}`
      : `DTEND:${formatDate(end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/**
 * Generate .ics for multiple events (e.g., all milestones for a project).
 */
export function generateICSCalendar(events: CalendarEvent[], calendarName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Keystone//Construction Management//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
  ];

  for (const event of events) {
    const formatDate = (d: Date, allDay?: boolean) => {
      if (allDay) return d.toISOString().replace(/[-:]/g, "").split("T")[0];
      return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };
    const end = event.endDate ?? new Date(event.startDate.getTime() + 60 * 60 * 1000);
    const uid = `keystone-${Date.now()}-${Math.random().toString(36).slice(2)}@keystone.build`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatDate(new Date())}`,
      event.allDay
        ? `DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`
        : `DTSTART:${formatDate(event.startDate)}`,
      event.allDay
        ? `DTEND;VALUE=DATE:${formatDate(end, true)}`
        : `DTEND:${formatDate(end)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Download an .ics file in the browser.
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate calendar events from project tasks and milestones.
 */
export function projectTasksToEvents(
  projectName: string,
  tasks: { label: string; done: boolean; dueDate?: string }[],
  city?: string
): CalendarEvent[] {
  return tasks
    .filter((t) => !t.done && t.dueDate)
    .map((t) => ({
      title: `[${projectName}] ${t.label}`,
      description: `Construction task for ${projectName}. Managed in Keystone.`,
      startDate: new Date(t.dueDate!),
      allDay: true,
      location: city,
    }));
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export type { CalendarEvent };
