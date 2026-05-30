import { SectionHead } from "./SectionHead";

type WorkbenchItem = {
  id: string;
  title: string;
  tag: string;
  cap: string;
  span: "span-3" | "span-4" | "span-5" | "span-6" | "span-7" | "span-8";
  ratio?: "ratio-square" | "ratio-tall" | "ratio-wide";
  /** Static-data overrides for special card variants. */
  conciergeLevel?: string;
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
    title: "Star Citizen",
    tag: "concierge · org",
    cap: "Killing Vanduul and hauling quantanium one 30k at a time.",
    span: "span-4",
    conciergeLevel: "Wing Commander",
  },
];

/* SC Fleet — Concierge tile. Renders inside the standard wbcard's photo
   slot (replacing the "PHOTO SOON" placeholder), so the outer card chrome
   matches the rest of the workbench. Sized to fit the slot's 4:3 ratio. */
function ConciergeSlot({ card }: { card: WorkbenchItem }) {
  return (
    <>
      <div className="wbcard--concierge__head">
        <div className="wbcard--concierge__head-text">
          <h3 className="wbcard--concierge__title">Calder Rhys</h3>
          <p className="wbcard--concierge__handle">@NZVengeance</p>
        </div>
        <svg
          className="wbcard--concierge__crest"
          width="119"
          height="122"
          viewBox="0 -12 119 122"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M82.3428 12.2589L60.7108 -9.37285C59.9929 -10.0907 58.8289 -10.0907 58.1111 -9.37283L37.2541 11.4845C36.5363 12.2023 36.5362 13.3662 37.2539 14.0841L38.1265 14.9569C38.8444 15.6749 40.0085 15.6749 40.7264 14.957L59.4109 -3.72789L78.8705 15.7314C79.5885 16.4493 80.7525 16.4492 81.4704 15.7312L82.343 14.8584C83.0607 14.1405 83.0607 12.9767 82.3428 12.2589Z" />
          <path d="M87.8247 16.9722L87.8134 16.9717L87.6802 16.9693H87.6689C85.362 16.9693 83.4916 18.8387 83.4916 21.1459C83.4916 23.4009 85.2776 25.238 87.5131 25.3203L87.5244 25.3208L87.6577 25.3232H87.6689C87.9184 25.3232 88.1619 25.3008 88.3981 25.2585L112.817 49.6778L84.7413 77.7539C84.6451 77.7418 84.5479 77.733 84.4496 77.7277L84.433 77.7268L84.242 77.7217H84.2255C81.9708 77.7217 80.1338 79.5077 80.0514 81.7428L80.051 81.7541L80.0485 81.8873V81.8986C80.0485 84.1533 81.8346 85.9903 84.0697 86.0727L84.0811 86.0731L84.2143 86.0756H84.2255C86.4802 86.0756 88.3172 84.2895 88.3996 82.0544L88.4 82.0432L88.4025 81.91V81.8986C88.4025 81.6299 88.3768 81.3667 88.3278 81.1114L118.462 50.9777C119.179 50.2598 119.179 49.0959 118.462 48.378L91.805 21.7214C91.8222 21.5997 91.8341 21.476 91.8404 21.3505L91.8412 21.3353L91.8455 21.1612V21.1459C91.8455 18.8912 90.0598 17.0545 87.8247 16.9722Z" />
          <path d="M31.4869 16.9722L31.4756 16.9717L31.3423 16.9693H31.3311C29.0244 16.9693 27.1541 18.8388 27.1541 21.1459C27.1541 21.2875 27.1615 21.4268 27.1754 21.5635L0.538428 48.2002C-0.179475 48.9181 -0.179475 50.082 0.53842 50.7999L30.7041 80.9656C30.6502 81.1985 30.6157 81.4393 30.603 81.6861L30.6022 81.7019L30.5975 81.8829V81.8986C30.5975 84.1535 32.3841 85.9903 34.6191 86.0727L34.6304 86.0731L34.7636 86.0756H34.7748C37.0295 86.0756 38.8666 84.2895 38.9489 82.0544L38.9494 82.0431L38.9518 81.9099V81.8986C38.9518 79.6439 37.1658 77.8069 34.9306 77.7245L34.9193 77.7241L34.7861 77.7217H34.7748C34.6548 77.7217 34.5367 77.7271 34.4209 77.7373L6.18337 49.5L30.4537 25.2294C30.6641 25.275 30.8807 25.3047 31.1021 25.3169L31.119 25.3178L31.3142 25.3232H31.3311C33.5861 25.3232 35.4232 23.5372 35.5055 21.3017L35.5059 21.2904L35.5084 21.1572V21.1459C35.5084 18.8909 33.7221 17.0545 31.4869 16.9722Z" />
          <path d="M43.8553 87.1723L59.589 102.906L75.1809 87.3135C75.8989 86.5956 77.0629 86.5956 77.7808 87.3136L78.6534 88.1864C79.3711 88.9043 79.3711 90.0682 78.6533 90.786L60.8889 108.55C60.171 109.268 59.0071 109.268 58.2892 108.55L40.3833 90.6444C39.6655 89.9266 39.6654 88.7628 40.3832 88.0449L41.2554 87.1724C41.9733 86.4544 43.1373 86.4544 43.8553 87.1723Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M40.3613 25.2975V24.5614H46.4954L55.3287 20.8809L70.5414 23.3346L67.8424 28.7327L74.7126 29.2234L76.1848 32.6585L85.5088 39.0381L82.319 39.2834L85.2634 42.4732L80.1107 45.9083L76.1848 46.6444L70.7868 40.5103L73.2404 38.5473L67.3516 37.3205L63.1804 32.9039L61.9536 35.3576L63.6711 41.7371L60.9721 40.5103L59.9906 36.0937L56.5555 32.4132L62.1989 28.2419L56.5555 24.8068L55.574 25.2975H40.3613ZM73.9354 32.1678L68.0877 32.6585L68.575 33.1493L74.91 35.6029L73.9354 34.1307V32.1678Z"
          />
          <path d="M35.6993 30.6956L30.0559 37.0751L44.0418 32.9039L43.5511 30.2049H52.3843L55.0833 28.4873V27.2605H47.2315L35.6993 30.6956Z" />
          <path d="M83.7912 46.6444L80.1107 47.8713L82.0736 51.3064L83.7912 46.6444Z" />
          <path d="M67.8424 46.8898L66.6155 48.6074L66.8609 50.325L71.0321 55.723L67.8424 46.8898Z" />
          <path d="M70.296 61.1211L66.8609 57.4406V59.8942L70.296 63.084V61.1211Z" />
          <path d="M59.0092 54.9869L72.259 67.746L73.4858 80.0143L67.3516 73.3894L66.8609 80.7504L62.935 76.8246L59.0092 54.9869Z" />
          <path d="M56.8009 70.9358L53.1204 44.9269L48.7037 63.3294L56.8009 70.9358Z" />
          <path d="M43.3057 57.1952L40.1159 59.8942L36.6808 56.2137L49.4399 45.1722L45.514 59.6489L43.3057 57.1952Z" />
          <path d="M53.6111 38.7927L48.213 39.0381L34.2271 52.2879L27.3568 43.7L46.2501 33.3946H54.1018L53.6111 38.7927Z" />
        </svg>
      </div>
      <div className="wbcard--concierge__pill">
        <svg
          className="wbcard--concierge__pill-icon"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M11.8685 1.6002C11.9099 1.4666 12.0901 1.4666 12.1315 1.6002L12.7449 3.58056C12.7634 3.64031 12.8165 3.68077 12.8764 3.68077H14.8615C14.9954 3.68077 15.0511 3.86052 14.9427 3.94309L13.3368 5.16703C13.2883 5.20395 13.268 5.26941 13.2865 5.32916L13.9 7.30952C13.9414 7.44312 13.7956 7.55422 13.6872 7.47165L12.0813 6.24771C12.0328 6.21079 11.9672 6.21079 11.9187 6.24772L10.3128 7.47165C10.2044 7.55422 10.0586 7.44312 10.1 7.30952L10.7135 5.32915C10.732 5.26941 10.7117 5.20395 10.6632 5.16703L9.05725 3.94309C8.94891 3.86052 9.00459 3.68077 9.13851 3.68077H11.1236C11.1835 3.68077 11.2366 3.64031 11.2551 3.58056L11.8685 1.6002Z" />
          <path d="M3.65139 18.0752C3.68243 17.9749 3.81757 17.9749 3.84861 18.0752L4.30868 19.5604C4.32256 19.6052 4.36237 19.6356 4.40729 19.6356H5.89612C5.99656 19.6356 6.03832 19.7704 5.95706 19.8323L4.75257 20.7503C4.71624 20.778 4.70103 20.8271 4.71491 20.8719L5.17498 22.3571C5.20602 22.4573 5.09669 22.5407 5.01543 22.4787L3.81094 21.5608C3.7746 21.5331 3.7254 21.5331 3.68906 21.5608L2.48457 22.4787C2.40331 22.5407 2.29398 22.4573 2.32502 22.3571L2.78509 20.8719C2.79897 20.8271 2.78376 20.778 2.74742 20.7503L1.54294 19.8323C1.46168 19.7704 1.50344 19.6356 1.60388 19.6356H3.09271C3.13763 19.6356 3.17744 19.6052 3.19132 19.5604L3.65139 18.0752Z" />
          <path d="M20.1514 18.0752C20.1824 17.9749 20.3176 17.9749 20.3486 18.0752L20.8087 19.5604C20.8226 19.6052 20.8624 19.6356 20.9073 19.6356H22.3961C22.4966 19.6356 22.5383 19.7704 22.4571 19.8323L21.2526 20.7503C21.2162 20.778 21.201 20.8271 21.2149 20.8719L21.675 22.3571C21.706 22.4573 21.5967 22.5407 21.5154 22.4787L20.3109 21.5608C20.2746 21.5331 20.2254 21.5331 20.1891 21.5608L18.9846 22.4787C18.9033 22.5407 18.794 22.4573 18.825 22.3571L19.2851 20.8719C19.299 20.8271 19.2838 20.778 19.2474 20.7503L18.0429 19.8323C17.9617 19.7704 18.0034 19.6356 18.1039 19.6356H19.5927C19.6376 19.6356 19.6774 19.6052 19.6913 19.5604L20.1514 18.0752Z" />
          <path d="M9 7.5H3L1.5 10.5H6.75L10.6757 17.2297L9 21L12 19.5L15 21L13.3243 17.2297L17.25 10.5H22.5L21 7.5H15L12 14.25L9 7.5Z" />
          <path d="M1.72852 11.25L3.40594 14.25H7.68738L6.00996 11.25H1.72852Z" />
          <path d="M3.8253 15L4.66401 16.5H8.94545L8.10674 15H3.8253Z" />
          <path d="M22.2169 11.25L20.5395 14.25H16.2581L17.9355 11.25H22.2169Z" />
          <path d="M20.1202 15L19.2814 16.5H15L15.8387 15H20.1202Z" />
        </svg>
        <div className="wbcard--concierge__pill-body">
          <span className="wbcard--concierge__pill-label">Your level:</span>
          <span className="wbcard--concierge__pill-value">
            {card.conciergeLevel}
          </span>
        </div>
      </div>
      <p className="wbcard--concierge__enlisted">Enlisted: 2016-JAN-04</p>
    </>
  );
}

export function Workbench() {
  return (
    <section className="section" id="workbench" aria-label="The workbench">
      <div className="frame">
        <SectionHead
          title={
            <>
              The <em>workbench</em>
            </>
          }
          caption={<>things I love · photos coming</>}
        />
        <div className="workbench">
          {WORKBENCH.map((card) => {
            const isFleet = card.id === "wb-scfleet";
            return (
              <article
                key={card.id}
                className={`wbcard ${card.span} ${card.ratio ?? ""}`}
              >
                <div
                  className={`wbcard__slot ${isFleet ? "wbcard__slot--concierge" : ""}`}
                >
                  {isFleet ? (
                    <ConciergeSlot card={card} />
                  ) : (
                    <span className="wbcard__slot-placeholder">
                      {card.title.toLowerCase()} · photo soon
                    </span>
                  )}
                </div>
                <div className="wbcard__head">
                  <h4 className="wbcard__title">{card.title}</h4>
                  <span className="wbcard__tag">{card.tag}</span>
                </div>
                <p className="wbcard__cap">{card.cap}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
