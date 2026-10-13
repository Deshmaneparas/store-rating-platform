import React, { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({
  value = 0,
  onChange,
  interactive = false,
  size = 18,
  showBadge = true,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = interactive && hoverValue > 0 ? hoverValue : value;

  return (
    <div className="star-rating">
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          return (
            <Star
              key={star}
              size={size}
              className={interactive ? "star-interactive" : ""}
              fill={filled ? "#f59e0b" : "transparent"}
              color={filled ? "#f59e0b" : "#64748b"}
              strokeWidth={filled ? 0 : 1.5}
              onMouseEnter={() => interactive && setHoverValue(star)}
              onMouseLeave={() => interactive && setHoverValue(0)}
              onClick={() => interactive && onChange && onChange(star)}
            />
          );
        })}
      </div>
      {showBadge && (
        <span className="rating-badge" style={{ marginLeft: "4px" }}>
          {value > 0 ? Number(value).toFixed(1) : "No rating"}
        </span>
      )}
    </div>
  );
}
