import { useState } from "react";

export default function CouncilVisual({
  council,
  className = "",
  eager = false,
}) {
  const [failed, setFailed] = useState(false);
  if (council.image && !failed)
    return (
      <img
        src={council.image}
        alt={council.imageAlt || council.name}
        width="1280"
        height="720"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
        className={`aspect-video w-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  return (
    <div
      className={`relative flex aspect-video w-full items-end overflow-hidden bg-gradient-to-br from-navy-deep via-royal to-cyan p-5 text-white ${className}`}
      role="img"
      aria-label={`${council.name} image placeholder`}
    >
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[24px] border-white/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,.08)_45%,rgba(255,255,255,.08)_55%,transparent_55%)]"
        aria-hidden="true"
      />
      <span className="relative max-w-[28ch] font-serif text-lg font-bold">
        {council.name}
      </span>
    </div>
  );
}
