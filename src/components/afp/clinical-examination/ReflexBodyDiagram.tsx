import { useId } from "react";
import Box from "@mui/material/Box";

export interface ReflexBodyDiagramProps {
  className?: string;
  renderer?: "mui" | "svg";
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
    y: 420,
    rightX: 145,
    leftX: 215,
  },
  achilles: {
    label: "Achilles",
    y: 500,
    rightX: 139,
    leftX: 221,
  },
  plantar: {
    label: "Plantar",
    y: 570,
    rightX: 110,
    leftX: 250,
  },
} as const;

export const REFLEX_DIAGRAM_LAYOUT = {
  width: 450,
  height: 763,
  diagramTop: 30,
  stageHeight: 830,
  controlCenterOffset: 36,
} as const;

// Anatomical coordinates.
const BODY_LINES = [
  [180, 123, 180, 150], // Neck
  [180, 150, 127, 159], // Right shoulder
  [180, 150, 233, 159], // Left shoulder
  [180, 150, 180, 328], // Spine
  [127, 159, 113, 210], // Right upper arm
  [113, 210, 92, 275], // Right forearm
  [92, 275, 65, 325], // Right wrist
  [233, 159, 247, 210], // Left upper arm
  [247, 210, 268, 275], // Left forearm
  [268, 275, 295, 325], // Left wrist
  [180, 328, 145, 350], // Right hip
  [180, 328, 215, 350], // Left hip
  [145, 350, 145, 420], // Right thigh
  [145, 420, 139, 500], // Right lower leg
  [215, 350, 215, 420], // Left thigh
  [215, 420, 221, 500], // Left lower leg
  [139, 500, 110, 570], // Right foot
  [221, 500, 250, 570], // Left foot
] as const;

export default function ReflexBodyDiagram({
  className = "",
  renderer = "mui",
}: ReflexBodyDiagramProps) {
  // Desktop and mobile instances need different IDs for accessibility.
  const uniqueId = useId();
  const titleId = `${uniqueId}-title`;
  const descriptionId = `${uniqueId}-description`;

  const contents = (
    <>
      <title id={titleId}>Infant reflex examination diagram</title>
      <desc id={descriptionId}>
        A single front-facing schematic infant body showing bilateral biceps,
        brachioradialis, patellar, Achilles, and plantar reflex sites. The
        patient's right side is displayed on the viewer's left.
      </desc>

      <circle
        cx="180"
        cy="72"
        r="50"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
      />

      {BODY_LINES.map(([x1, y1, x2, y2], index) => (
        <line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#475569"
          strokeWidth="2"
        />
      ))}

      <polyline
        points="65,325 57,333 51,324"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polyline
        points="295,325 303,333 309,324"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {Object.values(REFLEX_ANCHORS).map((site) => (
        <g key={site.label}>
          <line
            x1="0"
            y1={site.y}
            x2={site.rightX}
            y2={site.y}
            stroke="#8ba6c4"
            strokeWidth="1.5"
          />
          <line
            x1={site.leftX}
            y1={site.y}
            x2="360"
            y2={site.y}
            stroke="#8ba6c4"
            strokeWidth="1.5"
          />
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
    </>
  );

  const rootProps = {
    viewBox: "0 0 360 610",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    role: "img" as const,
    "aria-labelledby": `${titleId} ${descriptionId}`,
  };

  // MUI draws the diagram using Box rendered as an SVG root.
  if (renderer === "mui") {
    return (
      <Box component="svg" {...rootProps} sx={{ display: "block" }}>
        {contents}
      </Box>
    );
  }

  // Original native SVG root for a like-for-like comparison.
  return <svg {...rootProps}>{contents}</svg>;
}
