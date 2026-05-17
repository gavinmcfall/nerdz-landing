import { ReactNode } from "react";

type Props = {
  num: string;
  title: ReactNode;
  caption: ReactNode;
};

export function SectionHead({ num, title, caption }: Props) {
  return (
    <div className="section__head">
      <div className="section__numtitle">
        <span className="section__num">{num}</span>
        <h2 className="section__title">{title}</h2>
      </div>
      <div className="section__rule" aria-hidden="true" />
      <div className="section__caption">{caption}</div>
    </div>
  );
}
