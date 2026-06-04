import Link from "next/link";
import { flushAfterRender, recordRender } from "@/lib/flightrec-render";

function PostTitle() {
  recordRender("<PostTitle>", "app/playground/render/page.tsx:PostTitle");
  return <h2 className="display text-2xl">Shipping Flightrec</h2>;
}

function PostBody() {
  recordRender("<PostBody>", "app/playground/render/page.tsx:PostBody");
  return (
    <p className="mt-2 text-sm text-fg-muted">Rendered on the server, captured by the recorder.</p>
  );
}

function Article() {
  recordRender("<Article>", "app/playground/render/page.tsx:Article");
  return (
    <article className="card mx-auto max-w-md p-6 text-center">
      <PostTitle />
      <PostBody />
    </article>
  );
}

export default function RenderPage() {
  recordRender("<RenderPage>", "app/playground/render/page.tsx:RenderPage");
  const id = flushAfterRender();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center">
        <span className="eyebrow">Recorder · render capture</span>
        <h1 className="display mt-3 text-3xl">Captured while rendering.</h1>
        <p className="mt-3 max-w-md text-balance text-sm text-fg-muted">
          Each server component below records itself as it renders — one per-request recorder via
          React <code>cache()</code>, flushed after the response with <code>after()</code>.
        </p>
      </div>

      <Article />

      <Link
        href={`/inspector?session=${id}`}
        className="pill bg-fg px-5 py-3 text-sm font-medium text-bg shadow-(--shadow-card) transition hover:opacity-90"
      >
        Open the render trace →
      </Link>
    </main>
  );
}
