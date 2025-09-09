"use client";

export function HistorySidebar() {
  return (
    <aside
      className="fixed top-6 right-6 p-4 bg-white/80 backdrop-blur-md border rounded-2xl shadow-lg"
      data-testid="history-sidebar"
    >
      <button data-testid="history-trigger">History (Placeholder)</button>
    </aside>
  );
}
