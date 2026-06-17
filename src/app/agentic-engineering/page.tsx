import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "Agentic Engineering — nerdz.cloud",
  description:
    "A QA, ten years deep, who never wrote code — until AI changed the gate. Agentic engineering vs vibe coding: same tool, opposite process, opposite result.",
};

export default function AgenticEngineeringPage() {
  return (
    <section className="section" id="agentic-engineering" aria-label="Agentic engineering">
      <div className="frame">
        <SectionHead
          title={
            <>
              Life as a developer who&rsquo;s <em>never written code</em>
            </>
          }
          caption={<>agentic engineering · my process · auckland</>}
        />

        <figure className="essay__hero">
          <img
            src="/agentic-engineering/hero.png"
            alt="A desk surrounded by monitors and sketches with a glowing AI node at the center — the workspace of agentic engineering."
            width={1920}
            height={1080}
            loading="eager"
          />
        </figure>

        <article className="essay">
          <h3 className="essay__h">First, a little about me</h3>

          <p className="essay__p">
            My career has been that of a <strong>QA</strong>{" "}&mdash; a
            Quality Assurance Engineer. The title is a bit of a
            misnomer: a QA isn&rsquo;t an engineer, and doesn&rsquo;t
            assure quality.
          </p>

          <p className="essay__p">
            It comes from manufacturing, where a QA&rsquo;s job was
            (simply put) to check the widget coming off the line and
            confirm &mdash; assure &mdash; that the machine was
            producing to a high standard. That doesn&rsquo;t map
            cleanly onto modern software.
          </p>

          <p className="essay__p">
            I work for a SaaS company that builds genuinely complex
            software, some of it processing billions of dollars in
            payments. Objectively, we are very good at building
            software.
          </p>

          <p className="essay__p">
            Our teams are small: four or five developers and a QA.
            We&rsquo;re agile, we move fast, and we break features
            into thin, easily validated vertical &ldquo;slices&rdquo;
            we can get in front of customers quickly &mdash; so we
            learn whether what we&rsquo;re building actually adds
            value.
          </p>

          <p className="essay__p">
            In a world that moves this fast, the QA&rsquo;s job is to
            shift left, to move as far up the{" "}
            <a
              href="https://arkbauer.com/blog/software-development-life-cycle-sdlc/"
              target="_blank"
              rel="noreferrer noopener"
            >
              SDLC
            </a>{" "}
            as possible:
          </p>

          <p className="essay__p essay__p--center">
            Planning &rarr; Analysis &rarr; Design &rarr;
            Implementation &rarr; Testing &amp; Integration &rarr;
            Maintenance
          </p>

          <p className="essay__p">
            Historically, QAs lived in those last two phases. Modern
            shift-left puts us in from the very first one &mdash;
            assessing risk, teasing out concepts, poking holes before
            they become code.
          </p>

          <p className="essay__p">
            Developers go deep. QAs go wide. (<a
              href="https://www.highspeedtraining.co.uk/hub/t-shaped-employee/"
              target="_blank"
              rel="noreferrer noopener"
            >T-shaped people</a>, if you&rsquo;ve met the term.) No one person is both
            &mdash; you get depth or breadth &mdash; which is exactly
            why a good QA and a good developer make such a strong
            pair. The skills are complementary.
          </p>

          <p className="essay__p">
            I&rsquo;ve spent ten years as a QA: traditional software,
            hardware and firmware, modern agile delivery. In{" "}
            <strong>September 2025</strong>{" "}I moved into leadership
            as a Tech Lead, running a team of developers and QAs on
            our Identity and Community work, augmented throughout
            with AI.
          </p>

          <p className="essay__p">
            Building software of my own, though, had always been out
            of reach. Call it aptitude, time, or just the way
            I&rsquo;m wired &mdash; I&rsquo;ve never been able to
            write code, and not for lack of trying. But I know how
            software gets built. I know what good process looks like.
            I know a healthy CI/CD pipeline when I see one. I know
            how to plan and stand up cloud infrastructure. I know how
            to test, both exploratory and automated.
          </p>

          <p className="essay__p">
            My knowledge is wide. I work across Product, UI/UX, SRE,
            Data, QA and Development.
          </p>

          <p className="essay__p">
            I know how to build good software. I just can&rsquo;t
            write the code myself.
          </p>

          <p className="essay__p">
            Until now&hellip; sort of.
          </p>

          <h3 className="essay__h">Enter AI</h3>

          <p className="essay__p">
            Large Language Models are getting genuinely good at
            writing code. They&rsquo;ve trained on the open-source
            codebases of the entire internet, in every language. If
            there&rsquo;s a process, an opinion, a language or a term
            that touches software engineering, they{" "}
            <em>&ldquo;know&rdquo;</em>{" "}it.
          </p>

          <p className="essay__p">
            So the gate that used to stay shut to non-developers has
            swung wide open. Now anyone with access to AI can write
            software.
          </p>

          <p className="essay__p">
            But a lot of it is, simply put&hellip; shit.
          </p>

          <h3 className="essay__h">Introducing: Vibe Coding</h3>

          <p className="essay__p">
            The term was coined by{" "}
            <a
              href="https://karpathy.ai/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Andrej Karpathy
            </a>
            , a founding member of OpenAI. Vibe coding is when you
            {" "}<em>&ldquo;vibe&rdquo;</em>{" "}with an AI in a chat window:
            you describe the outcome, let it write all the code, and
            as long as what comes back <em>looks</em>{" "}good enough,
            you ship it.
          </p>

          <p className="essay__p">
            Vibe-coded projects tend to be full of bugs, wide open to
            bad actors, and generally not fit for purpose.
          </p>

          <p className="essay__p">
            <em>
              Vibe coding is building a soapbox racer and merging
              onto the motorway.
            </em>
          </p>

          <p className="essay__p">
            And here&rsquo;s the problem: &ldquo;vibe coding&rdquo;
            has quietly become the word for <em>everything</em>{" "}built
            with AI. The assumption now runs one way &mdash; if you
            used AI, you made{" "}
            <a
              href="https://en.wikipedia.org/wiki/AI_slop"
              target="_blank"
              rel="noreferrer noopener"
            >
              slop
            </a>
            .
          </p>

          <p className="essay__p">
            But what happens when you don&rsquo;t?
          </p>

          <p className="essay__p">
            What happens when you approach building software with AI
            the same way you&rsquo;d approach it with a team of
            humans? When you want production-ready software
            that&rsquo;s properly scoped, researched, planned, tested
            and deployed? When AI stops being the thing that{" "}
            <em>writes</em>{" "}your software, and becomes the thing
            that <em>accelerates</em>{" "}how fast you build software you
            understand, software you can maintain&hellip; software
            that&rsquo;s actually good?
          </p>

          <h3 className="essay__h">Introducing: Agentic Engineering</h3>

          <p className="essay__p">
            That has a name too. It&rsquo;s just newer, and the
            vocabulary is still settling. Some call it{" "}
            <em>agentic engineering</em>{" "}(
            <a
              href="https://karpathy.bearblog.dev/sequoia-ascent-2026/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Karpathy
            </a>
            ,{" "}
            <a
              href="https://addyosmani.com/blog/agentic-engineering/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Addy Osmani
            </a>
            ); others <em>augmented coding</em>{" "}(
            <a
              href="https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes"
              target="_blank"
              rel="noreferrer noopener"
            >
              Kent Beck
            </a>
            ) or <em>vibe engineering</em>{" "}(
            <a
              href="https://simonwillison.net/2025/Oct/7/vibe-engineering/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Simon Willison
            </a>
            ). They&rsquo;re all circling the same idea.
          </p>

          <p className="essay__p">
            Agentic engineering is what happens when you build
            software the (subjectively) correct way, and use AI to
            go faster doing it.
          </p>

          <h3 className="essay__h">Quality in = Quality out</h3>

          <p className="essay__p">
            The old warning is{" "}
            <em>&ldquo;garbage in, garbage out.&rdquo;</em>{" "}The
            inverse is just as true, and far more useful: the more
            rigour you put in <em>before</em>{" "}a single line of code
            exists &mdash; the research, the scoping, the risk
            assessment a QA does on instinct &mdash; the better what
            comes out the other end.
          </p>

          <p className="essay__p">
            Vibe coding is low effort in. Agentic engineering is high
            effort in. Same tool. Opposite result.
          </p>

          <p className="essay__p">
            <em>The AI is the constant. The process is the variable.</em>
          </p>

          <h3 className="essay__h">How do I Agentically Engineer?</h3>

          <p className="essay__p">
            It starts with a scratch pad, an ideas space in my dev
            environment. I open a terminal, make a folder for
            whatever I want to build, and type{" "}
            <code className="essay__code-inline">claude</code>.
          </p>

          <p className="essay__p">
            Then I just talk. I bring the idea, I think out loud, I
            brainstorm &mdash; and Claude pushes back. My system
            prompt is tuned to make it play devil&rsquo;s advocate:
            never sycophantic, always challenging me. I go in with
            wild ideas and half-formed thoughts, and come out with
            something sharp.
          </p>

          <p className="essay__p">
            <em>
              Like a sculptor with a block of wood: you keep cutting
              away everything that isn&rsquo;t the thing, until
              what&rsquo;s left is refined.
            </em>
          </p>

          <p className="essay__p">
            From there, a new git repo. I drop the output of that
            first conversation into a markdown file, open a fresh
            Claude session inside the repo, and feed it in as the
            starting point for a custom process I call{" "}
            <strong>Outcome Driven Agentic Design</strong>. Together
            we map the north star, run deep research and competitor
            analysis, and chart the flows through the software, the
            user personas, the architecture.
          </p>

          <p className="essay__p">
            This is deep <em>planning</em>{" "}&mdash; but deliberately,
            it says nothing about <em>what language</em>{" "}it will be
            written in, or <em>how</em>{" "}the functions get built.
          </p>

          <p className="essay__p">
            Once that&rsquo;s done: design. Informed and constrained
            by everything that came before it.
          </p>

          <p className="essay__p">
            Then implementation. I usually have Claude (Opus)
            orchestrate the build, leaning on the{" "}
            <a
              href="https://claude.com/plugins/superpowers"
              target="_blank"
              rel="noreferrer noopener"
            >
              Superpowers plugin
            </a>{" "}
            &mdash; subagents, TDD, the lot.
          </p>

          <blockquote className="essay__quote">
            <p>But how do you make sure it&rsquo;s perfect?</p>
          </blockquote>

          <p className="essay__p">I don&rsquo;t.</p>

          <p className="essay__p">
            Perfect software doesn&rsquo;t exist, written by a human
            or an AI. <em>Perfection is the enemy of good.</em>{" "}Any
            seasoned QA or developer will tell you the same thing:
            you can&rsquo;t write bug-free code&hellip; but you can
            get close.
          </p>

          <p className="essay__p">
            In my experience, most of the bugs that surface in
            well-engineered software come from three places: a shaky
            understanding of customer need, ill-defined requirements,
            or not enough testing.
          </p>

          <p className="essay__p">
            All three are solvable. The process above closes the
            first two by design. The last one &mdash; testing
            &mdash; I close by working test-first: small, easily
            testable slices; custom prompts and tools that let
            Claude run automated and browser-driven tests; and then
            the oldest trick there is &mdash; putting it in front of
            real users and iterating on what they tell me.
          </p>

          <h3 className="essay__h">For a long time, I hid it</h3>

          <p className="essay__p">
            When I started building with AI, I made sure not one of
            my commits ever admitted it. I stripped every trace.
          </p>

          <p className="essay__p">
            Because I&rsquo;d watched the internet decide that
            &ldquo;AI-assisted&rdquo; and &ldquo;vibe-coded&rdquo;
            were the same thing &mdash; and that both meant bad.
          </p>

          <p className="essay__p">I don&rsquo;t do that anymore.</p>

          <p className="essay__p">
            Now every commit I make says exactly how it was built:
          </p>

          <pre className="essay__code-block">
            <code>{`Assisted-by: Claude Code (claude-opus-4-8)
Agentically-Engineered: https://nerdz.cloud/agentic-engineering`}</code>
          </pre>

          <p className="essay__p">
            I stopped hiding the process and started proving it.
            Because if the work is good &mdash; and I&rsquo;ve spent
            a career learning what <em>good</em>{" "}means &mdash; then
            the tools I used to build it aren&rsquo;t something to
            hide.
          </p>

          <p className="essay__p">
            <em>They&rsquo;re something to show.</em>
          </p>

          <hr className="rule" />

          <p className="essay__p">
            This space won&rsquo;t sit still. The models keep getting
            more capable, the memory systems sharper, the plugins and
            skills keep closing the gaps. What I do today, I&rsquo;ll
            do differently in six months.
          </p>

          <p className="essay__p">
            If you want to follow along, I write about all of it on
            my{" "}
            <Link href="/blog/">blog</Link>{" "}&mdash; you might be
            reading this there now.
          </p>

          <blockquote className="essay__quote">
            <p>Strong opinions, weakly held.</p>
            <footer>&mdash; <em>Paul Saffo</em></footer>
          </blockquote>

          <p className="essay__p">
            These are my opinions. They move. What I&rsquo;m sure of
            today might not survive tomorrow&rsquo;s evidence, and
            I&rsquo;m fine with that.
          </p>

          <p className="essay__p">
            Yours may differ. If they do, I&rsquo;d genuinely like to
            hear it.
          </p>

          <p className="essay__p">
            I try to be intellectually honest and aware of my own
            biases. If you catch one I&rsquo;ve missed, please
            &mdash; politely &mdash; call it out.
          </p>

          <p className="essay__p">
            And if you&rsquo;ve read this far: <strong>thank you</strong>.
          </p>
        </article>
      </div>
    </section>
  );
}
