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
import { Audio } from "@remotion/media";
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
  ink: "#F5F7FB",
  muted: "#A7AFBF",
  line: "rgba(255, 255, 255, 0.12)",
  indigo: "#8C91FF",
  cyan: "#64D8FF",
  green: "#4ACB8F",
  coral: "#FF747E",
};

const captureByScene: Partial<Record<Scene["id"], string>> = {
  "create-and-name": "captures/theme-preview.png",
  "full-preview": "captures/theme-preview.png",
  "apply-without-account": "captures/apply-handoff.png",
  "discover-community": "captures/leaderboard.png",
  "creator-loop": "captures/creator-dashboard.png",
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 940,
          height: 940,
          borderRadius: "50%",
          top: -540,
          right: -200,
          opacity: 0.28,
          background: `radial-gradient(circle, ${COLORS.indigo} 0%, rgba(140,145,255,0) 68%)`,
          translate: `${interpolate(frame, [0, durationInFrames], [0, -80])}px ${interpolate(frame, [0, durationInFrames], [0, 70])}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          borderRadius: "50%",
          bottom: -590,
          left: -180,
          opacity: 0.2,
          background: `radial-gradient(circle, ${COLORS.cyan} 0%, rgba(100,216,255,0) 70%)`,
          translate: `${interpolate(frame, [0, durationInFrames], [0, 100])}px ${interpolate(frame, [0, durationInFrames], [0, -60])}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.17,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          translate: `${interpolate(frame, [0, durationInFrames], [0, 24])}px ${interpolate(frame, [0, durationInFrames], [0, 16])}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const SceneHeading: React.FC<{ scene: Scene; align?: "left" | "center" }> = ({
  scene,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const headline = scene.overlay.replaceAll(" • ", "  ·  ").replace(" → ", " → ");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap: 14,
        opacity: interpolate(frame, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: `0 ${interpolate(frame, [0, 18], [26, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
      }}
    >
      <span
        style={{
          color: COLORS.cyan,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        DexThemes for Codex
      </span>
      <h1
        style={{
          maxWidth: 1680,
          margin: 0,
          color: COLORS.ink,
          fontSize: scene.id === "hook" || scene.id === "end-card" ? 106 : 64,
          fontWeight: 780,
          letterSpacing: "-0.055em",
          lineHeight: 0.98,
        }}
      >
        {headline}
      </h1>
      <span
        style={{
          marginTop: 2,
          padding: "9px 14px",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 999,
          color: COLORS.ink,
          background: "rgba(255, 255, 255, 0.055)",
          fontSize: 20,
          fontWeight: 720,
          letterSpacing: "0.01em",
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
        top: 48,
        right: 64,
        zIndex: 40,
        padding: "12px 18px",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 999,
        color: COLORS.muted,
        background: "rgba(8, 10, 16, 0.78)",
        fontSize: 22,
        fontWeight: 760,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Previs · live capture pending
    </div>
  );
};

const CaptureFrame: React.FC<{ scene: Scene; source: string }> = ({ scene, source }) => {
  const frame = useCurrentFrame();
  const duration = Math.round(scene.durationSeconds * storyboard.fps);
  const panEnd = scene.id === "apply-without-account" ? -470 : scene.id === "creator-loop" ? -710 : 0;
  const panStart = scene.id === "creator-loop" ? -20 : 0;
  return (
    <div
      style={{
        position: "relative",
        width: 1540,
        height: scene.id === "discover-community" ? 550 : 650,
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 34,
        background: "#E9EBF1",
        boxShadow: "0 34px 96px rgba(0, 0, 0, 0.42)",
        opacity: interpolate(frame, [6, 24, duration - 12, duration], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [0, duration], [0.975, 1.015], {
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
          translate: `0 ${interpolate(frame, [18, Math.max(19, duration - 22)], [panStart, panEnd], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 1, 0.68, 1),
          })}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
};

const ProductScene: React.FC<{ scene: Scene; source: string }> = ({ scene, source }) => {
  return (
    <AbsoluteFill style={{ padding: "78px 96px 88px", gap: 34 }}>
      <SceneHeading scene={scene} />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CaptureFrame scene={scene} source={source} />
      </div>
    </AbsoluteFill>
  );
};

const HookScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        padding: "120px 120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 48,
      }}
    >
      <Img
        src={staticFile("brand/dexthemes-logo.png")}
        style={{
          width: 164,
          height: 164,
          borderRadius: 40,
          filter: "drop-shadow(0 22px 50px rgba(100, 216, 255, 0.2))",
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 20], [0.82, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <SceneHeading scene={scene} align="center" />
      <div
        style={{
          width: 560,
          height: 7,
          overflow: "hidden",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${interpolate(frame, [28, 120], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.cyan})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const StepCard: React.FC<{
  number: string;
  title: string;
  detail: string;
  accent: string;
  delay: number;
}> = ({ number, title, detail, accent, delay }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        flex: 1,
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 42,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 30,
        background: `linear-gradient(145deg, ${COLORS.panelRaised}, ${COLORS.panel})`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
        opacity: interpolate(frame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0 ${interpolate(frame, [delay, delay + 20], [42, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
      }}
    >
      <span style={{ color: accent, fontSize: 42, fontWeight: 820 }}>{number}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <strong style={{ color: COLORS.ink, fontSize: 48, letterSpacing: "-0.04em" }}>{title}</strong>
        <span style={{ color: COLORS.muted, fontSize: 29, lineHeight: 1.25 }}>{detail}</span>
      </div>
    </div>
  );
};

const PublishScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  return (
    <AbsoluteFill style={{ padding: "88px 96px", display: "flex", flexDirection: "column", gap: 66 }}>
      <SceneHeading scene={scene} />
      <div style={{ display: "flex", gap: 28, flex: 1, alignItems: "center" }}>
        <StepCard number="01" title="Name" detail="Keep the title and story you want people to discover." accent={COLORS.cyan} delay={14} />
        <StepCard number="02" title="Preview" detail="Inspect the complete dark and light Codex workspaces." accent={COLORS.indigo} delay={24} />
        <StepCard number="03" title="Publish" detail="You press the final button; your GitHub identity gets the credit." accent={COLORS.green} delay={34} />
      </div>
    </AbsoluteFill>
  );
};

const ThemeVariantCard: React.FC<{
  label: string;
  surface: string;
  sidebar: string;
  ink: string;
  accent: string;
  delay: number;
}> = ({ label, surface, sidebar, ink, accent, delay }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        flex: 1,
        minHeight: 370,
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 30,
        color: ink,
        background: surface,
        boxShadow: "0 26px 70px rgba(0,0,0,0.3)",
        opacity: interpolate(frame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0 ${interpolate(frame, [delay, delay + 22], [34, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 20px", background: sidebar }}>
        <span style={{ fontSize: 18, fontWeight: 840, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ color: accent, fontSize: 18, fontWeight: 820 }}>Human Spark</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "104px 1fr", minHeight: 314 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "24px 18px", background: sidebar }}>
          <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 14, color: surface, background: accent, fontSize: 24, fontWeight: 900 }}>D</span>
          {[0, 1, 2].map((item) => <span key={item} style={{ width: 48, height: 7, borderRadius: 999, background: item === 0 ? accent : `${ink}2B` }} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 28 }}>
          <strong style={{ fontSize: 30, letterSpacing: "-0.035em" }}>People are the spark behind intelligence.</strong>
          <span style={{ maxWidth: 470, color: `${ink}A8`, fontSize: 21, lineHeight: 1.35 }}>A focused graphite workspace with signal green for ideas in motion.</span>
          <div style={{ marginTop: "auto", padding: 20, borderRadius: 16, background: sidebar, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 17 }}>
            <span style={{ display: "block", color: accent }}>+ human curiosity</span>
            <span style={{ display: "block", marginTop: 8, color: `${ink}A8` }}>+ machine intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HumanSparkScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  return (
    <AbsoluteFill style={{ padding: "74px 96px 82px", display: "flex", flexDirection: "column", gap: 34 }}>
      <SceneHeading scene={scene} />
      <div style={{ display: "flex", alignItems: "center", gap: 26, flex: 1 }}>
        <ThemeVariantCard label="Dark" surface="#101414" sidebar="#0B0E0E" ink="#F2F7F5" accent="#35C995" delay={12} />
        <ThemeVariantCard label="Light" surface="#F7FAF9" sidebar="#ECF2F0" ink="#17201D" accent="#14845F" delay={22} />
      </div>
    </AbsoluteFill>
  );
};

const FeedbackScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "88px 96px", display: "flex", flexDirection: "column", gap: 52 }}>
      <SceneHeading scene={scene} />
      <div
        style={{
          alignSelf: "center",
          width: 1440,
          display: "flex",
          flexDirection: "column",
          gap: 30,
          padding: 48,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 34,
          background: COLORS.panel,
          boxShadow: "0 30px 90px rgba(0,0,0,0.32)",
          opacity: interpolate(frame, [10, 28], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [10, 30], [0.97, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <strong style={{ fontSize: 42, letterSpacing: "-0.035em" }}>Theme preview blanks after switching variants</strong>
          <span style={{ color: COLORS.green, fontSize: 24, fontWeight: 780 }}>Nothing posted</span>
        </div>
        <div style={{ display: "grid", gap: 14, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 25 }}>
          <span style={{ color: COLORS.muted }}>Expected: dark and light previews stay visible.</span>
          <span style={{ color: COLORS.muted }}>Observed: the light preview becomes blank after switching.</span>
          <span style={{ color: COLORS.muted }}>Reproduction: open preview → choose light → return to dark.</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            padding: "18px 22px",
            borderRadius: 18,
            color: COLORS.ink,
            background: "rgba(140,145,255,0.11)",
            fontSize: 25,
            lineHeight: 1.3,
          }}
        >
          <span>Review the exact draft before continuing to GitHub.</span>
          <strong style={{ flex: "0 0 auto", padding: "12px 18px", borderRadius: 999, color: "#090B10", background: COLORS.ink, fontSize: 22 }}>Review GitHub issue →</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        padding: "110px 120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 42,
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile("brand/dexthemes-logo.png")}
        style={{
          width: 170,
          height: 170,
          borderRadius: 42,
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 22], [0.86, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <SceneHeading scene={scene} align="center" />
      <div style={{ display: "flex", gap: 22, alignItems: "center", color: COLORS.ink, fontSize: 32, fontWeight: 720 }}>
        <span>dexthemes.com</span>
        <span style={{ color: COLORS.indigo }}>·</span>
        <span>github.com/daeshawnballard/dexthemes</span>
        <span style={{ color: COLORS.indigo }}>·</span>
        <span style={{ color: COLORS.green }}>Open source</span>
      </div>
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  if (scene.id === "hook") return <HookScene scene={scene} />;
  if (scene.id === "human-spark") return <HumanSparkScene scene={scene} />;
  if (scene.id === "review-and-publish") return <PublishScene scene={scene} />;
  if (scene.id === "open-source-feedback") return <FeedbackScene scene={scene} />;
  if (scene.id === "end-card") return <EndScene scene={scene} />;
  const capture = captureByScene[scene.id];
  return capture ? <ProductScene scene={scene} source={capture} /> : null;
};

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const caption = captions.find((cue) => currentMs >= cue.startMs && currentMs <= cue.endMs);
  if (!caption) return null;

  const opacity = Math.min(
    interpolate(currentMs, [caption.startMs, caption.startMs + 120], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(currentMs, [caption.endMs - 120, caption.endMs], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 72,
        zIndex: 70,
        maxWidth: 1420,
        padding: "13px 22px 15px",
        border: "1px solid rgba(255, 255, 255, 0.13)",
        borderRadius: 18,
        color: "#FFFFFF",
        background: "rgba(5, 7, 12, 0.88)",
        boxShadow: "0 16px 44px rgba(0, 0, 0, 0.34)",
        fontSize: 33,
        fontWeight: 680,
        letterSpacing: "-0.02em",
        lineHeight: 1.22,
        textAlign: "center",
        opacity,
        translate: "-50% 0",
      }}
    >
      {caption.text}
    </div>
  );
};

const GlobalProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 72, right: 72, bottom: 38, zIndex: 50 }}>
      <div style={{ height: 5, overflow: "hidden", borderRadius: 999, background: "rgba(255,255,255,0.09)" }}>
        <div
          style={{
            width: `${interpolate(frame, [0, durationInFrames - 1], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.cyan})`,
          }}
        />
      </div>
    </div>
  );
};

export const BuildWeekDemo: React.FC<DemoProps> = ({ previsualization }) => {
  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      <Background />
      {storyboard.scenes.map((scene) => {
        const narration = narrationByScene.get(scene.id);
        return (
          <Sequence
            key={scene.id}
            from={Math.round(scene.startSeconds * storyboard.fps)}
            durationInFrames={Math.round(scene.durationSeconds * storyboard.fps)}
          >
            <SceneRenderer scene={scene} />
            {narration ? <Audio src={staticFile(narration.file)} volume={0.88} /> : null}
          </Sequence>
        );
      })}
      <PrevisBadge visible={previsualization} />
      <CaptionLayer />
      <GlobalProgress />
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
