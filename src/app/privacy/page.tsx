import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import "./privacy.css";

export const metadata: Metadata = {
  title: "Privacy — nerdz.cloud",
  description:
    "What nerdz.cloud stores and why: an anonymous account number and your reading progress if you sign in — no names, no emails, no tracking.",
};

// Required by Google's OAuth production policy (a published privacy policy
// URL), and the honest companion to the reading-sync sign-in: this page must
// keep saying exactly what the code does — if the data we keep ever changes,
// change this page in the same commit.
export default function PrivacyPage() {
  return (
    <section className="section" id="privacy" aria-label="Privacy">
      <div className="frame">
        <SectionHead
          title={
            <>
              Privacy, <em>plainly</em>
            </>
          }
          caption={<>no names · no emails · no tracking</>}
        />

        <div className="prose-block">
          <p>
            Most of this site stores nothing about you at all. The one
            exception is <strong>sign-in for reading-progress sync</strong>,
            and here is everything it involves:
          </p>

          <h3>If you sign in (Google or Discord)</h3>
          <ul>
            <li>
              We receive and keep exactly one thing: an{" "}
              <strong>anonymous account number</strong> — an opaque ID the
              provider generates for this site. We request the minimum scope
              the provider offers, and we do not store your name, email
              address, avatar, or anything else from your account.
            </li>
            <li>
              That ID is used for one purpose: remembering which chapters
              you&rsquo;ve ticked in reading guides, so your progress follows
              you between devices.
            </li>
            <li>
              A single session cookie keeps you signed in. There are no
              analytics cookies, no ad trackers, and your data is never shared
              or sold.
            </li>
            <li>
              Sign out at any time and the site goes back to storing your
              ticks only in your own browser. To have your synced progress
              deleted entirely, email{" "}
              <a href="mailto:gavin@nerdz.co.nz">gavin@nerdz.co.nz</a> and
              it&rsquo;s gone.
            </li>
          </ul>

          <h3>If you don&rsquo;t sign in</h3>
          <ul>
            <li>
              Reading-guide ticks live in your browser&rsquo;s local storage,
              on your machine. They never reach a server.
            </li>
            <li>No accounts, no cookies of consequence, no tracking.</li>
          </ul>

          <h3>Infrastructure</h3>
          <ul>
            <li>
              The site runs on Cloudflare; like any host, Cloudflare processes
              request logs (IP addresses, user agents) to serve and protect the
              site. We don&rsquo;t use that data to identify you.
            </li>
          </ul>

          <p className="prose-block__updated mono">
            Last updated 2026-08-28 · questions:{" "}
            <a href="mailto:gavin@nerdz.co.nz">gavin@nerdz.co.nz</a>
          </p>
        </div>
      </div>
    </section>
  );
}
