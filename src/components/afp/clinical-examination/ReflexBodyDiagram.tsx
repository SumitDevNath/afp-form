interface ReflexBodyDiagramProps {
  className?: string;
}

export const REFLEX_ANCHORS = {
  biceps: {
    label: "Biceps",
    y: 185,
    rightX: 120,
    leftX: 240,
  },

  brachioradialis: {
    label: "Brachioradialis",
    y: 255,
    rightX: 98,
    leftX: 262,
  },

  patellar: {
    label: "Patellar",
    y: 435,
    rightX: 145,
    leftX: 215,
  },

  achilles: {
    label: "Achilles",
    y: 535,
    rightX: 139,
    leftX: 221,
  },

  plantar: {
    label: "Plantar",
    y: 585,
    rightX: 110,
    leftX: 250,
  },
} as const;

export const REFLEX_DIAGRAM_LAYOUT = {
  width: 360,
  height: 630,

  diagramTop: 30,

  stageHeight: 710,

  controlCenterOffset: 47,
} as const;

export default function ReflexBodyDiagram({
  className = "",
}: ReflexBodyDiagramProps) {
  const sites = Object.values(REFLEX_ANCHORS);

  return (
    <svg
      viewBox="0 0 360 630"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-labelledby="afp-reflex-title afp-reflex-description"
    >
      <title id="afp-reflex-title">Infant reflex examination diagram</title>

      <desc id="afp-reflex-description">
        A single front-facing schematic infant body showing bilateral biceps,
        brachioradialis, patellar, Achilles, and plantar reflex sites. The
        patient's right side is displayed on the viewer's left.
      </desc>

      {/* ================================
          HEAD - STRAIGHT LINE OUTLINE
         ================================ */}

      <circle
        cx="180"
        cy="72"
        r="50"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* NECK */}
      <line
        x1="180"
        y1="123"
        x2="180"
        y2="150"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          SHOULDERS
         ================================ */}

      <line
        x1="180"
        y1="150"
        x2="127"
        y2="159"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="180"
        y1="150"
        x2="233"
        y2="159"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          BODY / SPINE
         ================================ */}

      <line
        x1="180"
        y1="150"
        x2="180"
        y2="328"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          RIGHT ARM
          Patient RT / viewer left
         ================================ */}

      <line
        x1="127"
        y1="159"
        x2="113"
        y2="210"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="113"
        y1="210"
        x2="92"
        y2="275"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="92"
        y1="275"
        x2="65"
        y2="325"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* RIGHT HAND */}
      <polyline
        points="65,325 57,333 51,324"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ================================
          LEFT ARM
          Patient LT / viewer right
         ================================ */}

      <line
        x1="233"
        y1="159"
        x2="247"
        y2="210"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="247"
        y1="210"
        x2="268"
        y2="275"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="268"
        y1="275"
        x2="295"
        y2="325"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* LEFT HAND */}
      <polyline
        points="295,325 303,333 309,324"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ================================
          HIPS
         ================================ */}

      <line
        x1="180"
        y1="328"
        x2="145"
        y2="350"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="180"
        y1="328"
        x2="215"
        y2="350"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          RIGHT LEG
         ================================ */}

      <line
        x1="145"
        y1="350"
        x2="145"
        y2="435"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="145"
        y1="435"
        x2="139"
        y2="535"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          LEFT LEG
         ================================ */}

      <line
        x1="215"
        y1="350"
        x2="215"
        y2="435"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="215"
        y1="435"
        x2="221"
        y2="535"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          FEET
         ================================ */}

      <line
        x1="139"
        y1="535"
        x2="110"
        y2="585"
        stroke="#475569"
        strokeWidth="2"
      />

      <line
        x1="221"
        y1="535"
        x2="250"
        y2="585"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* ================================
          REFLEX MARKERS AND CONNECTORS
         ================================ */}

      {sites.map((site) => (
        <g key={site.label}>
          {/* Right-side connector */}
          <line
            x1="0"
            y1={site.y}
            x2={site.rightX}
            y2={site.y}
            stroke="#8ba6c4"
            strokeWidth="1.5"
          />

          {/* Left-side connector */}
          <line
            x1={site.leftX}
            y1={site.y}
            x2="360"
            y2={site.y}
            stroke="#8ba6c4"
            strokeWidth="1.5"
          />

          {/* RT anatomical point */}
          <circle
            cx={site.rightX}
            cy={site.y}
            r="4.5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            <title>Right {site.label} reflex site</title>
          </circle>

          {/* LT anatomical point */}
          <circle
            cx={site.leftX}
            cy={site.y}
            r="4.5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            <title>Left {site.label} reflex site</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
