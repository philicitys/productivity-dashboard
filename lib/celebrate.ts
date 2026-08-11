"use client";

// Little dopamine hits on completion — a generated "pop" sound (Web Audio,
// no audio file needed) plus a confetti burst from the clicked element.
// Inspired by Casey Danielle's dashboard.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AC =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function pop() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

const COLORS = ["#785b4e", "#7a816c", "#d68d84", "#cfbb9f", "#8e967d", "#f6efdf"];

export function confettiAt(el: HTMLElement | null) {
  if (typeof document === "undefined") return;
  const rect = el?.getBoundingClientRect();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 3;

  const layer = document.createElement("div");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(layer);

  const N = 16;
  for (let i = 0; i < N; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;left:${originX}px;top:${originY}px;width:${size}px;height:${size}px;border-radius:2px;background:${COLORS[i % COLORS.length]};will-change:transform,opacity;`;
    layer.appendChild(p);

    const angle = (Math.PI * 2 * i) / N + Math.random() * 0.6;
    const dist = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    const rot = (Math.random() * 720 - 360).toFixed(0);

    p.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 120}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: 750 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }
    );
  }

  setTimeout(() => layer.remove(), 1200);
}

export function celebrate(el: HTMLElement | null) {
  pop();
  confettiAt(el);
}
