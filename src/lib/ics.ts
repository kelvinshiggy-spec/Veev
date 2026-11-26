// Free calendar reminders: a .ics file her phone's Calendar can import, with a gentle alert.
// This works even when VEEV is closed, without any push service.

export interface CalEvent {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM, local; all-day if missing
  note?: string;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");

export function buildIcs(events: CalEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VEEV//Goals//EN", "CALSCALE:GREGORIAN"];
  events.forEach((e, i) => {
    const d = e.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT", `UID:${d}-${i}-${Math.random().toString(36).slice(2)}@veev`, `DTSTAMP:${stamp()}`);
    if (e.time) {
      const t = e.time.replace(":", "") + "00";
      lines.push(`DTSTART:${d}T${t}`, `DURATION:PT30M`);
    } else {
      const next = new Date(`${e.date}T12:00:00`);
      next.setDate(next.getDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`);
    }
    lines.push(`SUMMARY:${esc(e.title)}`);
    if (e.note) lines.push(`DESCRIPTION:${esc(e.note)}`);
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.title)}`, e.time ? "TRIGGER:-PT30M" : "TRIGGER:PT9H", "END:VALARM", "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export async function addToCalendar(events: CalEvent[], filename = "veev-goal") {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar" });
  const file = new File([blob], `${filename}.ics`, { type: "text/calendar" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Add to calendar" });
      return;
    }
  } catch {}
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
