"use client";

import { useId, useState } from "react";
import type { Item } from "@/lib/warcraft/types";

// One paper-doll slot. The tooltip opens on hover and on keyboard focus,
// and closes on leave, blur or Escape. It stays in the DOM while hidden so
// aria-describedby always points at it.
export function ItemSlot({ item, label, side }: { item: Item | null; label: string; side: "left" | "right" | "bottom" }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  if (!item) {
    return (
      <div className={`wow-slot wow-slot--${side} wow-slot--empty`}>
        <span className="wow-slot__icon" aria-hidden="true" />
        <span className="wow-slot__text">
          <span className="wow-slot__name">{label}</span>
          <span className="wow-slot__sub">Empty</span>
        </span>
      </div>
    );
  }

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <div className={`wow-slot wow-slot--${side}`} data-quality={item.quality.toLowerCase()} onMouseLeave={hide}>
      <button
        type="button"
        className="wow-slot__button"
        aria-describedby={tipId}
        onMouseEnter={show}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Escape") hide();
        }}
      >
        <span className="wow-slot__icon" aria-hidden="true">
          {item.icon && <img src={item.icon} alt="" loading="lazy" />}
        </span>
        <span className="wow-slot__text">
          <span className="wow-slot__name">{item.name}</span>
          <span className="wow-slot__sub">
            {item.itemLevel ?? ""}
            <span className="wow-visually-hidden"> {item.slotName}</span>
          </span>
        </span>
      </button>
      <ItemTooltip id={tipId} item={item} hidden={!open} />
    </div>
  );
}

function ItemTooltip({ id, item, hidden }: { id: string; item: Item; hidden: boolean }) {
  return (
    <div id={id} role="tooltip" className="wow-tip" hidden={hidden}>
      <span className="wow-tip__name">{item.name}</span>
      {item.nameDescription && <span className="wow-tip__good">{item.nameDescription}</span>}
      {item.itemLevel != null && <span className="wow-tip__ilvl">Item Level {item.itemLevel}</span>}
      {item.binding && <span>{item.binding}</span>}
      {(item.inventoryType || item.subclass) && (
        <span className="wow-tip__split">
          <span>{item.inventoryType}</span>
          <span>{item.subclass}</span>
        </span>
      )}
      {item.armor && <span>{item.armor}</span>}
      {item.weapon && (
        <>
          <span className="wow-tip__split">
            <span>{item.weapon.damage}</span>
            <span>{item.weapon.speed}</span>
          </span>
          {item.weapon.dps && <span>{item.weapon.dps}</span>}
        </>
      )}
      {item.stats.map((s, i) => (
        <span
          key={i}
          className={s.negated ? "wow-tip__off" : s.equipBonus ? "wow-tip__good" : "wow-tip__stat"}
        >
          {s.text}
        </span>
      ))}
      {item.enchantments.map((e, i) => (
        <span key={`e${i}`} className="wow-tip__good">
          {e}
        </span>
      ))}
      {item.sockets.map((s, i) => (
        <span key={`s${i}`}>{s}</span>
      ))}
      {item.spells.map((s, i) => (
        <span key={`p${i}`} className="wow-tip__good">
          {s}
        </span>
      ))}
      {item.set && <span className="wow-tip__gold">{item.set}</span>}
      {item.requirement && <span>{item.requirement}</span>}
      {item.description && <span className="wow-tip__desc">{item.description}</span>}
    </div>
  );
}
