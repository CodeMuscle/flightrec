"use client";

export function DownloadPdf() {
  return (
    <button
      onClick={() => window.print()}
      className="pill bg-fg px-4 py-2 text-sm font-medium text-bg shadow-(--shadow-sm) transition hover:opacity-90"
    >
      Download PDF
    </button>
  );
}
