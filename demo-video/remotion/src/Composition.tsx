import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import storyboard from "../../storyboard.json";
import captions from "./captions.json";
import narrationManifest from "./narration-manifest.json";

type Scene = (typeof storyboard.scenes)[number];
type DemoProps = {
  previsualization: boolean;
};

const narrationByScene = new Map(
  narrationManifest.tracks.map((track) => [track.sceneId, track]),
);

const COLORS = {
  background: "#080A10",
  panel: "#11141D",
  panelRaised: "#171B26",
  ink: "#F7F8FC",
  muted: "#AAB2C2",
  line: "rgba(255, 255, 255, 0.13)",
  indigo: "#8C91FF",
  cyan: "#64D8FF",
  green: "#4ACB8F",
  coral: "#FF747E",
  yellow: "#FFD479",
};

const enter = (frame: number, delay = 0, duration = 14) =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          top: -650,
          right: -190,
          opacity: 0.24,
          background: `radial-gradient(circle, ${COLORS.indigo} 0%, rgba(140,145,255,0) 68%)`,
          translate: `${interpolate(frame, [0, durationInFrames], [0, -90])}px ${interpolate(frame, [0, durationInFrames], [0, 70])}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          bottom: -650,
          left: -200,
          opacity: 0.18,
          background: `radial-gradient(circle, ${COLORS.cyan} 0%, rgba(100,216,255,0) 70%)`,
          translate: `${interpolate(frame, [0, durationInFrames], [0, 110])}px ${interpolate(frame, [0, durationInFrames], [0, -60])}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.14,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          translate: `${interpolate(frame, [0, durationInFrames], [0, 24])}px ${interpolate(frame, [0, durationInFrames], [0, 16])}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const BrandLockup: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 46,
      left: 72,
      zIndex: 45,
      display: "flex",
      alignItems: "center",
      gap: 15,
    }}
  >
    <Img
      src={staticFile("brand/dexthemes-logo.png")}
      style={{ width: 54, height: 54, borderRadius: 15 }}
    />
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <strong
        style={{
          color: COLORS.ink,
          fontSize: 20,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
        }}
      >
        DexThemes
      </strong>
      <span
        style={{
          color: COLORS.muted,
          fontSize: 16,
          fontWeight: 720,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
        }}
      >
        Codex plugin · Build Week
      </span>
    </div>
  </div>
);

const SceneHeader: React.FC<{
  scene: Scene;
  compact?: boolean;
  title?: string;
  support?: string;
}> = ({ scene, compact = false, title, support }) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, 0, 13);

  return (
    <div
      style={{
        position: "absolute",
        top: compact ? 118 : 126,
        left: 80,
        right: 80,
        zIndex: 25,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 48,
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [20, 0])}px`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h1
          style={{
            maxWidth: compact ? 1260 : 1420,
            margin: 0,
            color: COLORS.ink,
            fontSize: compact ? 57 : 68,
            fontWeight: 790,
            letterSpacing: "-0.052em",
            lineHeight: 0.99,
          }}
        >
          {title ?? scene.overlay}
        </h1>
        <span
          style={{
            maxWidth: 1320,
            color: COLORS.muted,
            fontSize: compact ? 25 : 28,
            fontWeight: 520,
            letterSpacing: "-0.015em",
            lineHeight: 1.22,
          }}
        >
          {support ?? scene.support}
        </span>
      </div>
      <span
        style={{
          flex: "0 0 auto",
          maxWidth: 500,
          padding: "11px 16px",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 999,
          color: COLORS.ink,
          background: "rgba(255,255,255,0.06)",
          fontSize: 18,
          fontWeight: 750,
          letterSpacing: "0.01em",
          textAlign: "center",
        }}
      >
        {scene.proof}
      </span>
    </div>
  );
};

const PrevisBadge: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 52,
        right: 72,
        zIndex: 80,
        padding: "10px 15px",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 999,
        color: COLORS.muted,
        background: "rgba(8, 10, 16, 0.82)",
        fontSize: 17,
        fontWeight: 780,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Previs · live capture pending
    </div>
  );
};

const CaptureCard: React.FC<{
  source: string;
  top?: number;
  height?: number;
  imageTranslateY?: number;
  imageScale?: number;
  children?: React.ReactNode;
}> = ({
  source,
  top = 270,
  height = 690,
  imageTranslateY = 0,
  imageScale = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 132,
        right: 132,
        height,
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 32,
        background: "#E9EBF1",
        boxShadow: "0 34px 96px rgba(0, 0, 0, 0.42)",
        opacity: enter(frame, 3, 15),
        scale: interpolate(frame, [0, 80], [0.985, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <Img
        src={staticFile(source)}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          scale: imageScale,
          translate: `0 ${imageTranslateY}px`,
          transformOrigin: "top center",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
        }}
      />
      {children}
    </div>
  );
};

const PromptChip: React.FC<{
  children: React.ReactNode;
  delay: number;
  accent?: string;
}> = ({ children, delay, accent = COLORS.cyan }) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, delay, 15);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "17px 22px",
        border: `1px solid ${accent}66`,
        borderRadius: 20,
        color: COLORS.ink,
        background: "rgba(8, 10, 16, 0.9)",
        boxShadow: "0 22px 54px rgba(0,0,0,0.34)",
        fontSize: 24,
        fontWeight: 680,
        opacity: progress,
        translate: `${interpolate(progress, [0, 1], [36, 0])}px 0`,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 34,
          height: 34,
          borderRadius: 11,
          color: "#080A10",
          background: accent,
          fontSize: 19,
          fontWeight: 900,
        }}
      >
        ✦
      </span>
      {children}
    </div>
  );
};

const CreateAndNameScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const imageDrift = interpolate(frame, [0, scene.durationSeconds * storyboard.fps], [0, -54], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  return (
    <AbsoluteFill>
      <SceneHeader scene={scene} compact />
      <CaptureCard
        source="captures/theme-preview.png"
        top={255}
        height={720}
        imageTranslateY={imageDrift}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <PromptChip delay={12}>Argentina football at night</PromptChip>
          <PromptChip delay={265} accent={COLORS.indigo}>
            Name it Argentina Afterglow
          </PromptChip>
        </div>
      </CaptureCard>
    </AbsoluteFill>
  );
};

const BeatPill: React.FC<{
  text: string;
  delay: number;
  active?: boolean;
}> = ({ text, delay, active = false }) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, delay, 11);
  return (
    <span
      style={{
        padding: "10px 15px",
        border: `1px solid ${active ? `${COLORS.cyan}88` : COLORS.line}`,
        borderRadius: 999,
        color: active ? COLORS.ink : COLORS.muted,
        background: active ? "rgba(100,216,255,0.12)" : "rgba(8,10,16,0.78)",
        fontSize: 19,
        fontWeight: 760,
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [12, 0])}px`,
      }}
    >
      {text}
    </span>
  );
};

const PreviewAndApplyScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const phase = interpolate(frame, [148, 188], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const applyPan = interpolate(frame, [184, 338], [-34, -430], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  return (
    <AbsoluteFill>
      <SceneHeader
        scene={scene}
        compact
        title={phase < 0.52 ? "Preview the workspace—not just swatches." : "Apply with no account."}
        support={
          phase < 0.52
            ? "Judge the interface, code, diffs, contrast, and accents in context."
            : "Copy the exact import and open Codex Appearance from the same flow."
        }
      />
      <div
        style={{
          position: "absolute",
          top: 255,
          left: 132,
          right: 132,
          height: 720,
          overflow: "hidden",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 32,
          background: "#E9EBF1",
          boxShadow: "0 34px 96px rgba(0, 0, 0, 0.42)",
        }}
      >
        <Img
          src={staticFile("captures/theme-preview.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "auto",
            opacity: 1 - phase,
            translate: `${interpolate(phase, [0, 1], [0, -100])}px -28px`,
            scale: interpolate(frame, [0, 170], [1, 1.025], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <Img
          src={staticFile("captures/apply-handoff.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "auto",
            opacity: phase,
            translate: `${interpolate(phase, [0, 1], [110, 0])}px ${applyPan}px`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 28,
            right: 28,
            bottom: 26,
            display: "flex",
            justifyContent: phase < 0.52 ? "flex-start" : "flex-end",
            gap: 10,
          }}
        >
          {phase < 0.52 ? (
            <>
              <BeatPill text="Dark + light" delay={18} active />
              <BeatPill text="Code + diffs" delay={35} />
              <BeatPill text="Contrast" delay={52} />
            </>
          ) : (
            <>
              <BeatPill text="Exact import" delay={182} />
              <BeatPill text="Open Appearance" delay={198} active />
              <BeatPill text="No account" delay={214} />
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DiscoverScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scopeProgress = interpolate(frame, [60, durationInFrames - 45], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  return (
    <AbsoluteFill>
      <SceneHeader scene={scene} compact />
      <CaptureCard
        source="captures/leaderboard.png"
        top={262}
        height={610}
        imageTranslateY={-20}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 30,
            display: "flex",
            gap: 10,
          }}
        >
          <BeatPill text="Codex" delay={18} />
          <BeatPill text="DexThemes" delay={32} active />
          <BeatPill text="Community" delay={46} />
        </div>
      </CaptureCard>
      <div
        style={{
          position: "absolute",
          left: 330,
          right: 330,
          bottom: 105,
          height: 66,
          padding: 7,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          alignItems: "center",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 22,
          background: "rgba(12,15,22,0.92)",
          boxShadow: "0 20px 54px rgba(0,0,0,0.32)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 7,
            bottom: 7,
            left: 7,
            width: "calc((100% - 14px) / 4)",
            borderRadius: 16,
            background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.cyan})`,
            translate: `${scopeProgress * 100}% 0`,
          }}
        />
        {["Today", "This week", "This month", "All time"].map((label) => (
          <span
            key={label}
            style={{
              position: "relative",
              zIndex: 2,
              color: COLORS.ink,
              fontSize: 20,
              fontWeight: 790,
              textAlign: "center",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const PublishNode: React.FC<{
  label: string;
  title: string;
  detail: string;
  accent: string;
  delay: number;
  icon: string;
}> = ({ label, title, detail, accent, delay, icon }) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, delay, 16);
  return (
    <div
      style={{
        position: "relative",
        zIndex: 4,
        width: 470,
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 34,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 30,
        background: `linear-gradient(145deg, ${COLORS.panelRaised}, ${COLORS.panel})`,
        boxShadow: "0 28px 74px rgba(0,0,0,0.28)",
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [34, 0])}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 60,
            height: 60,
            borderRadius: 18,
            color: "#080A10",
            background: accent,
            fontSize: 25,
            fontWeight: 900,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            color: accent,
            fontSize: 17,
            fontWeight: 820,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <strong style={{ color: COLORS.ink, fontSize: 42, letterSpacing: "-0.045em" }}>
          {title}
        </strong>
        <span style={{ color: COLORS.muted, fontSize: 25, lineHeight: 1.28 }}>{detail}</span>
      </div>
    </div>
  );
};

const PublishScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [25, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill>
      <SceneHeader scene={scene} compact />
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 150,
          right: 150,
          height: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 42,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 210,
            right: 210,
            top: "50%",
            height: 5,
            overflow: "hidden",
            borderRadius: 999,
            background: "rgba(255,255,255,0.09)",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.cyan}, ${COLORS.green})`,
            }}
          />
        </div>
        <PublishNode
          label="On demand"
          title="GitHub OAuth"
          detail="Identity appears only when a community action needs it."
          accent={COLORS.indigo}
          delay={15}
          icon="GH"
        />
        <PublishNode
          label="Before writing"
          title="Review"
          detail="Confirm the name and inspect the complete dark and light pair."
          accent={COLORS.cyan}
          delay={68}
          icon="2×"
        />
        <PublishNode
          label="User controlled"
          title="Publish"
          detail="Press the final button and keep verified creator credit."
          accent={COLORS.green}
          delay={122}
          icon="✓"
        />
      </div>
    </AbsoluteFill>
  );
};

const CreatorScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pan = interpolate(frame, [18, durationInFrames - 24], [-22, -690], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  return (
    <AbsoluteFill>
      <SceneHeader scene={scene} compact />
      <div
        style={{
          position: "absolute",
          top: 252,
          left: 132,
          right: 132,
          height: 718,
          overflow: "hidden",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 32,
          background: "#E9EBF1",
          boxShadow: "0 34px 96px rgba(0, 0, 0, 0.42)",
        }}
      >
        <Img
          src={staticFile("captures/creator-dashboard.png")}
          style={{ width: "100%", height: "auto", translate: `0 ${pan}px` }}
        />
        <div
          style={{
            position: "absolute",
            right: 26,
            top: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <BeatPill text="Repeat wins add to stats" delay={28} active />
          <BeatPill text="Each reward unlocks once" delay={168} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 80,
            background: "linear-gradient(rgba(8,10,16,0), rgba(8,10,16,0.2))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const FeedbackScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, 14, 17);

  return (
    <AbsoluteFill>
      <SceneHeader scene={scene} compact />
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 230,
          right: 230,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          padding: 42,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 32,
          background: COLORS.panel,
          boxShadow: "0 30px 90px rgba(0,0,0,0.34)",
          opacity: progress,
          scale: interpolate(progress, [0, 1], [0.97, 1]),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 50,
                height: 50,
                borderRadius: 16,
                color: "#080A10",
                background: COLORS.indigo,
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              GH
            </span>
            <strong style={{ color: COLORS.ink, fontSize: 36, letterSpacing: "-0.035em" }}>
              Theme preview blanks after switching variants
            </strong>
          </div>
          <span style={{ color: COLORS.green, fontSize: 21, fontWeight: 790 }}>Draft only</span>
        </div>
        <div
          style={{
            display: "grid",
            gap: 12,
            padding: 24,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 20,
            background: "rgba(255,255,255,0.035)",
            color: COLORS.muted,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 23,
            lineHeight: 1.35,
          }}
        >
          <span>Expected: dark and light previews remain visible.</span>
          <span>Observed: light preview becomes blank after switching.</span>
          <span>Reproduction: open preview → light → dark.</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <span style={{ color: COLORS.muted, fontSize: 24 }}>
            Review the exact payload before leaving the conversation.
          </span>
          <strong
            style={{
              padding: "14px 20px",
              borderRadius: 999,
              color: "#080A10",
              background: COLORS.ink,
              fontSize: 21,
            }}
          >
            Review GitHub issue →
          </strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PipelineNode: React.FC<{
  eyebrow: string;
  title: string;
  detail: string;
  accent: string;
  delay: number;
  chips: string[];
}> = ({ eyebrow, title, detail, accent, delay, chips }) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, delay, 17);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 5,
        flex: 1,
        minHeight: 350,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: 32,
        border: `1px solid ${accent}55`,
        borderRadius: 30,
        background: `linear-gradient(145deg, ${COLORS.panelRaised}, ${COLORS.panel})`,
        boxShadow: `0 28px 80px ${accent}12`,
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [38, 0])}px`,
      }}
    >
      <span
        style={{
          color: accent,
          fontSize: 17,
          fontWeight: 840,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </span>
      <strong style={{ color: COLORS.ink, fontSize: 48, letterSpacing: "-0.05em" }}>
        {title}
      </strong>
      <span style={{ color: COLORS.muted, fontSize: 25, lineHeight: 1.28 }}>{detail}</span>
      <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 9 }}>
        {chips.map((chip) => (
          <span
            key={chip}
            style={{
              padding: "8px 12px",
              border: `1px solid ${COLORS.line}`,
              borderRadius: 999,
              color: COLORS.ink,
              background: "rgba(255,255,255,0.04)",
              fontSize: 17,
              fontWeight: 720,
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
};

const JudgeProofScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const lineProgress = interpolate(frame, [24, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill>
      <SceneHeader scene={scene} compact />
      <div
        style={{
          position: "absolute",
          top: 335,
          left: 132,
          right: 132,
          display: "flex",
          alignItems: "stretch",
          gap: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 210,
            right: 210,
            top: 174,
            height: 5,
            overflow: "hidden",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: `${lineProgress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.cyan}, ${COLORS.green})`,
            }}
          />
        </div>
        <PipelineNode
          eyebrow="Interpret"
          title="GPT-5.6"
          detail="Turns a personal reference into clear creative direction and semantic theme roles."
          accent={COLORS.indigo}
          delay={15}
          chips={["intent", "personality", "naming"]}
        />
        <PipelineNode
          eyebrow="Validate + secure"
          title="DexThemes MCP"
          detail="Keeps deterministic rules, verified identity, and public actions at the tool boundary."
          accent={COLORS.cyan}
          delay={70}
          chips={["colors", "names", "OAuth", "writes"]}
        />
        <PipelineNode
          eyebrow="Preview + act"
          title="Apps SDK UI"
          detail="Renders complete workspaces and keeps every choice inside the Codex conversation."
          accent={COLORS.green}
          delay={125}
          chips={["dark + light", "apply", "community"]}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 220,
          right: 220,
          bottom: 92,
          display: "flex",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <BeatPill text="Core value before sign-in" delay={188} active />
        <BeatPill text="User confirms public writes" delay={206} />
        <BeatPill text="Open source" delay={224} />
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const reveal = enter(frame, 4, 18);
  const drift = interpolate(frame, [0, scene.durationSeconds * storyboard.fps], [0, -36], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const montageCard = (
    source: string,
    style: React.CSSProperties,
    imageTranslateY = 0,
  ) => (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 28,
        background: "#E9EBF1",
        boxShadow: "0 32px 90px rgba(0,0,0,0.38)",
        ...style,
      }}
    >
      <Img
        src={staticFile(source)}
        style={{ width: "100%", height: "auto", translate: `0 ${imageTranslateY}px` }}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ opacity: 0.46, translate: `0 ${drift}px`, scale: 1.04 }}>
        {montageCard("captures/theme-preview.png", {
          top: 50,
          left: 40,
          width: 900,
          height: 620,
          rotate: "-2.5deg",
        })}
        {montageCard("captures/leaderboard.png", {
          top: 90,
          right: 34,
          width: 820,
          height: 510,
          rotate: "2.8deg",
        })}
        {montageCard(
          "captures/creator-dashboard.png",
          {
            top: 560,
            left: 490,
            width: 960,
            height: 620,
            rotate: "-0.8deg",
          },
          -260,
        )}
      </div>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at center, rgba(8,10,16,0.46) 0%, rgba(8,10,16,0.88) 62%, #080A10 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          textAlign: "center",
          opacity: reveal,
          scale: interpolate(reveal, [0, 1], [0.96, 1]),
        }}
      >
        <Img
          src={staticFile("brand/dexthemes-logo.png")}
          style={{
            width: 142,
            height: 142,
            borderRadius: 38,
            filter: "drop-shadow(0 24px 55px rgba(100,216,255,0.2))",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span
            style={{
              color: COLORS.cyan,
              fontSize: 21,
              fontWeight: 830,
              letterSpacing: "0.17em",
              textTransform: "uppercase",
            }}
          >
            DexThemes for Codex
          </span>
          <h1
            style={{
              maxWidth: 1450,
              margin: 0,
              color: COLORS.ink,
              fontSize: 100,
              fontWeight: 810,
              letterSpacing: "-0.06em",
              lineHeight: 0.94,
            }}
          >
            {scene.overlay}
          </h1>
          <span style={{ color: COLORS.muted, fontSize: 32, fontWeight: 640 }}>
            Create · discover · share
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            padding: "13px 20px",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 999,
            color: COLORS.ink,
            background: "rgba(8,10,16,0.72)",
            fontSize: 22,
            fontWeight: 730,
          }}
        >
          <span>dexthemes.com</span>
          <span style={{ color: COLORS.indigo }}>·</span>
          <span style={{ color: COLORS.green }}>Open source</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  if (scene.id === "create-and-name") return <CreateAndNameScene scene={scene} />;
  if (scene.id === "preview-and-apply") return <PreviewAndApplyScene scene={scene} />;
  if (scene.id === "discover-community") return <DiscoverScene scene={scene} />;
  if (scene.id === "review-and-publish") return <PublishScene scene={scene} />;
  if (scene.id === "creator-loop") return <CreatorScene scene={scene} />;
  if (scene.id === "open-source-feedback") return <FeedbackScene scene={scene} />;
  if (scene.id === "judge-proof") return <JudgeProofScene scene={scene} />;
  if (scene.id === "end-card") return <EndScene scene={scene} />;
  return null;
};

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const caption = captions.find((cue) => currentMs >= cue.startMs && currentMs <= cue.endMs);
  if (!caption) return null;

  const opacity = Math.min(
    interpolate(currentMs, [caption.startMs, caption.startMs + 100], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(currentMs, [caption.endMs - 100, caption.endMs], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 48,
        zIndex: 70,
        maxWidth: 1360,
        padding: "12px 20px 14px",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 17,
        color: "#FFFFFF",
        background: "rgba(5,7,12,0.9)",
        boxShadow: "0 16px 44px rgba(0,0,0,0.34)",
        fontSize: 30,
        fontWeight: 670,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        textAlign: "center",
        opacity,
        translate: "-50% 0",
      }}
    >
      {caption.text}
    </div>
  );
};

const MusicBed: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile("music/close-up-michael-ramir-c.mp3")}
      playbackRate={storyboard.music.playbackRate}
      volume={(frame) =>
        interpolate(
          frame,
          [0, 32, durationInFrames - 100, durationInFrames - 1],
          [0, 0.13, 0.13, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};

export const BuildWeekDemo: React.FC<DemoProps> = ({ previsualization }) => {
  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      <Background />
      <MusicBed />
      {storyboard.scenes.map((scene) => {
        const narration = narrationByScene.get(scene.id);
        return (
          <Sequence
            key={scene.id}
            from={Math.round(scene.startSeconds * storyboard.fps)}
            durationInFrames={Math.round(scene.durationSeconds * storyboard.fps)}
            premountFor={storyboard.fps}
          >
            <SceneRenderer scene={scene} />
            {narration ? <Audio src={staticFile(narration.file)} volume={0.88} /> : null}
          </Sequence>
        );
      })}
      <BrandLockup />
      <PrevisBadge visible={previsualization} />
      <CaptionLayer />
    </AbsoluteFill>
  );
};

export const BuildWeekComposition: React.FC = () => {
  return (
    <Composition
      id="BuildWeekDemo"
      component={BuildWeekDemo}
      durationInFrames={storyboard.totalFrames}
      fps={storyboard.fps}
      width={storyboard.width}
      height={storyboard.height}
      defaultProps={{ previsualization: true }}
    />
  );
};
