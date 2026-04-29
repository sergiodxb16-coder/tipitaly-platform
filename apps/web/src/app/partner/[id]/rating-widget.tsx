"use client";

import { useState } from "react";

interface RatingWidgetProps {
  partnerId: string;
  initialRating: number | null;
  ratingMedia: number | null;
  ratingCount: number;
}

export function RatingWidget({
  partnerId,
  initialRating,
  ratingMedia: initialMedia,
  ratingCount: initialCount,
}: RatingWidgetProps) {
  const [myRating, setMyRating] = useState<number | null>(initialRating);
  const [hovered, setHovered] = useState<number | null>(null);
  const [media, setMedia] = useState(initialMedia);
  const [count, setCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleRate = async (stelle: number) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stelle }),
      });
      if (res.ok) {
        const data = await res.json();
        setMyRating(stelle);
        setMedia(data.ratingMedia);
        setCount(data.ratingCount);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const display = hovered ?? myRating ?? 0;

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => handleRate(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(null)}
            disabled={saving}
            className="focus:outline-none disabled:opacity-50"
            aria-label={`Valuta ${s} stelle`}
          >
            <svg
              className={`h-7 w-7 transition-colors ${
                s <= display ? "text-amber-400 fill-current" : "text-gray-200 fill-current"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {saved && (
          <span className="ml-2 text-sm text-green-600 font-medium">Salvato!</span>
        )}
      </div>
      {myRating && !saved && (
        <p className="mt-1 text-xs text-gray-400">Hai dato {myRating} stelle</p>
      )}
      {media && count > 0 && (
        <p className="mt-1 text-xs text-gray-400">
          Media: {media.toFixed(1)} su {count} recensioni
        </p>
      )}
    </div>
  );
}
