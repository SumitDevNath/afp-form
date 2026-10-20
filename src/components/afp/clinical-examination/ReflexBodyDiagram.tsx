interface ReflexBodyDiagramProps {
  className?: string;
}

export default function ReflexBodyDiagram({
  className = "",
}: ReflexBodyDiagramProps) {
  return (
    <svg
      viewBox="0 0 320 470"
      role="img"
      aria-label="Body diagram for reflex examination"
      className={className}
    >
      {/* HEAD */}
      <ellipse
        cx="160"
        cy="70"
        rx="45"
        ry="55"
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* NECK / TORSO */}
      <line
        x1="160"
        y1="125"
        x2="160"
        y2="270"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* SHOULDERS */}
      <line
        x1="160"
        y1="125"
        x2="75"
        y2="175"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      <line
        x1="160"
        y1="125"
        x2="245"
        y2="175"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* ARMS */}
      <line
        x1="75"
        y1="175"
        x2="20"
        y2="140"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      <line
        x1="245"
        y1="175"
        x2="300"
        y2="140"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* HIPS */}
      <line
        x1="160"
        y1="270"
        x2="80"
        y2="315"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      <line
        x1="160"
        y1="270"
        x2="240"
        y2="315"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* LEGS */}
      <line
        x1="80"
        y1="315"
        x2="80"
        y2="425"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      <line
        x1="240"
        y1="315"
        x2="240"
        y2="425"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* FEET */}
      <line
        x1="80"
        y1="425"
        x2="125"
        y2="425"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      <line
        x1="240"
        y1="425"
        x2="195"
        y2="425"
        stroke="#1e293b"
        strokeWidth="1.5"
      />
    </svg>
  );
}
