import { SectionHead } from "./SectionHead";

type WorkbenchItem = {
  id: string;
  title: string;
  tag: string;
  cap: string;
  span: "span-3" | "span-4" | "span-5" | "span-6" | "span-7" | "span-8";
  ratio?: "ratio-square" | "ratio-tall" | "ratio-wide";
};

const WORKBENCH: WorkbenchItem[] = [
  {
    id: "wb-forge",
    title: "The Forge",
    tag: "workspace · akl",
    cap: "The intersection of creativity and ADHD.",
    span: "span-7",
    ratio: "ratio-wide",
  },
  {
    id: "wb-printers",
    title: "Printers",
    tag: "bambu h2c · uniformation gk-two",
    cap: "Forging nerdvana one layer at a time.",
    span: "span-5",
    ratio: "ratio-square",
  },
  {
    id: "wb-dopamine",
    title: "Dopamine Racing",
    tag: "rc drift · 1:10",
    cap: "Side-project incoming. Skill ceiling here is higher than it has any right to be.",
    span: "span-4",
  },
  {
    id: "wb-lowslow",
    title: "Low & Slow",
    tag: "oklahoma joe · bronco",
    cap: "BBQ is not a season.",
    span: "span-4",
    ratio: "ratio-tall",
  },
  {
    id: "wb-scfleet",
    title: "SC Fleet",
    tag: "concierge · org",
    cap: "Killing Vanduul and hauling quantanium one 30k at a time.",
    span: "span-4",
  },
];

export function Workbench() {
  return (
    <section className="section" id="workbench" aria-label="The workbench">
      <div className="frame">
        <SectionHead
          num="02"
          title={
            <>
              The <em>workbench</em>
            </>
          }
          caption={<>things I love · photos coming</>}
        />
        <div className="workbench">
          {WORKBENCH.map((card) => (
            <article
              key={card.id}
              className={`wbcard ${card.span} ${card.ratio ?? ""}`}
            >
              <div className="wbcard__slot">
                <span className="wbcard__slot-placeholder">
                  {card.title.toLowerCase()} · photo soon
                </span>
              </div>
              <div className="wbcard__head">
                <h4 className="wbcard__title">{card.title}</h4>
                <span className="wbcard__tag">{card.tag}</span>
              </div>
              <p className="wbcard__cap">{card.cap}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
