import type { CSSProperties } from "react";

type BorderBeamStyle = CSSProperties & {
  "--border-beam-color": string;
  "--border-beam-duration": string;
};

type BorderBeamProps = {
  color?: string;
  durationSeconds?: number;
};

export function BorderBeam({
  color = "var(--coral-400)",
  durationSeconds = 7,
}: BorderBeamProps) {
  const style: BorderBeamStyle = {
    "--border-beam-color": color,
    "--border-beam-duration": `${durationSeconds}s`,
  };

  return <span aria-hidden="true" className="border-beam" style={style} />;
}
