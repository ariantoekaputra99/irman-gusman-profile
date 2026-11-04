import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { biography, profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Biografi",
  description: biography.lead,
};

export default function BiographyPage() {
  return (
    <PageShell eyebrow="BIOGRAFI" title={profile.name} intro={biography.lead}>
      {biography.sections.map((s) => (
        <section key={s.heading}>
          <h2 className="serif text-3xl mt-16">{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p className="text-neutral-600 mt-3" key={p}>
              {p}
            </p>
          ))}
        </section>
      ))}
    </PageShell>
  );
}
