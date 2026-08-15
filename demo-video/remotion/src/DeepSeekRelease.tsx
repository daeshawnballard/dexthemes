import type { Caption } from "@remotion/captions";
import { Audio, Video } from "@remotion/media";
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

const FPS = 30;
const DURATION_IN_FRAMES = 41 * FPS;

type ReleaseLayout = "landscape" | "vertical" | "square";

type ReleaseProps = {
  layout: ReleaseLayout;
};

type FootageScene = {
  id: "discovery" | "preview" | "apply" | "revert" | "chat";
  from: number;
  durationInFrames: number;
  source: string;
  sourceStartSeconds: number;
  eyebrow: string;
  title: string;
  proof: string;
  accent: string;
  objectPosition?: string;
  staticTail?: string;
  motionFrames?: number;
};

const COLORS = {
  background: "#07090E",
  ink: "#FAFBFF",
  muted: "#B4BBC8",
  blue: "#47ADFF",
  orange: "#FF6A00",
  warm: "#FFF2E7",
  green: "#52D39C",
  panel: "rgba(10, 12, 18, 0.88)",
  line: "rgba(255, 255, 255, 0.16)",
};

const FOOTAGE_SCENES: FootageScene[] = [
  {
    id: "discovery",
    from: 90,
    durationInFrames: 165,
    source: "deepseek-release/captures/ui-flow.webm",
    sourceStartSeconds: 1.75,
    eyebrow: "Inside the real Harness UI",
    title: "Open DexThemes in Settings.",
    proof: "Settings → Plugins",
    accent: COLORS.blue,
  },
  {
    id: "preview",
    from: 255,
    durationInFrames: 195,
    source: "deepseek-release/captures/ui-flow.webm",
    sourceStartSeconds: 5,
    eyebrow: "100 paired themes",
    title: "Search. Compare light + dark.",
    proof: "Bundled catalog",
    accent: "#FFD2AE",
  },
  {
    id: "apply",
    from: 450,
    durationInFrames: 150,
    source: "deepseek-release/captures/ui-flow.webm",
    sourceStartSeconds: 9.4,
    eyebrow: "Harness theme service",
    title: "Apply. The whole UI changes now.",
    proof: "Alibaba · #FF6A00",
    accent: COLORS.orange,
  },
  {
    id: "revert",
    from: 600,
    durationInFrames: 150,
    source: "deepseek-release/captures/ui-flow.webm",
    sourceStartSeconds: 12.5,
    eyebrow: "Reversible by design",
    title: "Revert restores Harness.",
    proof: "Default restored",
    accent: COLORS.green,
  },
  {
    id: "chat",
    from: 750,
    durationInFrames: 255,
    source: "deepseek-release/captures/chat-lucky.webm",
    sourceStartSeconds: 1.55,
    eyebrow: "Real Harness tool path",
    title: "Or just say: “Color me lucky.”",
    proof: "Local deterministic provider",
    accent: "#A99DFF",
    objectPosition: "56% center",
    staticTail: "deepseek-release/captures/chat-lucky-verified.png",
    motionFrames: 145,
  },
];

const wordCaptions = (text: string, startMs: number, endMs: number): Caption[] => {
  const words = text.split(" ");
  const duration = endMs - startMs;

  return words.map((word, index) => {
    const from = startMs + (duration * index) / words.length;
    const to = startMs + (duration * (index + 1)) / words.length;
    return {
      text: `${word}${index === words.length - 1 ? "" : " "}`,
      startMs: from,
      endMs: to,
      timestampMs: from,
      confidence: 1,
    };
  });
};

const captionPage = (text: string, startMs: number, endMs: number) => ({
  startMs,
  durationMs: endMs - startMs,
  tokens: wordCaptions(text, startMs, endMs).map((caption) => ({
    text: caption.text,
    fromMs: caption.startMs,
    toMs: caption.endMs,
  })),
});

const CAPTION_PAGES = [
  captionPage("Themes, without leaving Harness.", 420, 2550),
  captionPage("Open Settings, then Plugins, then DexThemes.", 3200, 7600),
  captionPage("Search 100 paired light and dark themes.", 8800, 13900),
  captionPage("Apply through Harness’s supported theme service.", 15100, 19400),
  captionPage("Revert restores the default.", 20300, 24300),
  captionPage("Or create from chat with Color me lucky.", 25400, 32900),
  captionPage("Find your vibe. Stay in flow.", 34200, 37600),
  captionPage("Unofficial community plugin. No endorsement implied.", 38100, 40700),
];

const frameProgress = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const layoutMetrics = (layout: ReleaseLayout) => {
  if (layout === "vertical") {
    return {
      frame: { left: 34, right: 34, top: 286, height: 1190, borderRadius: 34 },
      title: { top: 78, left: 58, right: 58, fontSize: 62, eyebrowSize: 21 },
      proof: { top: 226, right: 58, fontSize: 18 },
      caption: { bottom: 122, maxWidth: 940, fontSize: 38, padding: "17px 23px" },
      badge: { top: 34, right: 40, fontSize: 14 },
      endTitle: 78,
      endWidth: 930,
      logo: 128,
    };
  }

  if (layout === "square") {
    return {
      frame: { left: 24, right: 24, top: 112, height: 856, borderRadius: 30 },
      title: { top: 36, left: 48, right: 48, fontSize: 46, eyebrowSize: 16 },
      proof: { top: 120, right: 48, fontSize: 14 },
      caption: { bottom: 34, maxWidth: 960, fontSize: 28, padding: "12px 18px" },
      badge: { top: 28, right: 30, fontSize: 12 },
      endTitle: 64,
      endWidth: 930,
      logo: 112,
    };
  }

  return {
    frame: { left: 28, right: 28, top: 28, height: 1024, borderRadius: 32 },
    title: { top: 56, left: 72, right: 72, fontSize: 58, eyebrowSize: 18 },
    proof: { top: 62, right: 70, fontSize: 16 },
    caption: { bottom: 42, maxWidth: 1320, fontSize: 30, padding: "13px 21px" },
    badge: { top: 30, right: 38, fontSize: 13 },
    endTitle: 94,
    endWidth: 1440,
    logo: 124,
  };
};

const AmbientBackground: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [-4, 6]);

  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle at ${28 + drift}% 18%, ${accent}2A 0%, transparent 35%), ` +
          `radial-gradient(circle at 82% 84%, ${COLORS.blue}1C 0%, transparent 38%), ${COLORS.background}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.17,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </AbsoluteFill>
  );
};

const ProductFrame: React.FC<{
  layout: ReleaseLayout;
  source: string;
  sourceStartSeconds: number;
  objectPosition?: string;
  staticTail?: string;
  motionFrames?: number;
}> = ({
  layout,
  source,
  sourceStartSeconds,
  objectPosition = "center center",
  staticTail,
  motionFrames = 150,
}) => {
  const frame = useCurrentFrame();
  const metrics = layoutMetrics(layout);
  const reveal = frameProgress(frame, 0, 12);

  return (
    <div
      style={{
        position: "absolute",
        ...metrics.frame,
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        background: "#111318",
        boxShadow: "0 36px 120px rgba(0, 0, 0, 0.54)",
        opacity: reveal,
        transform: `scale(${interpolate(reveal, [0, 1], [0.988, 1])})`,
      }}
    >
      <Sequence durationInFrames={staticTail ? motionFrames : undefined}>
        <Video
          src={staticFile(source)}
          trimBefore={Math.round(sourceStartSeconds * FPS)}
          muted
          objectFit="cover"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectPosition,
          }}
        />
      </Sequence>
      {staticTail ? (
        <Sequence from={motionFrames}>
          <Img
            src={staticFile(staticTail)}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition,
            }}
          />
        </Sequence>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
        }}
      />
    </div>
  );
};

const SceneTitle: React.FC<{
  layout: ReleaseLayout;
  scene: FootageScene;
}> = ({ layout, scene }) => {
  const frame = useCurrentFrame();
  const metrics = layoutMetrics(layout);
  const reveal = frameProgress(frame, 4, 18);
  const landscape = layout === "landscape";

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: layout === "vertical" ? 470 : 300,
          zIndex: 8,
          background: "linear-gradient(180deg, rgba(5,7,11,0.95) 0%, rgba(5,7,11,0.68) 52%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          ...metrics.title,
          zIndex: 12,
          maxWidth: landscape ? 1240 : undefined,
          opacity: reveal,
          transform: `translateY(${interpolate(reveal, [0, 1], [14, 0])}px)`,
        }}
      >
        <div
          style={{
            color: scene.accent,
            fontSize: metrics.title.eyebrowSize,
            fontWeight: 820,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {scene.eyebrow}
        </div>
        <div
          style={{
            maxWidth: landscape ? 1180 : 930,
            marginTop: 8,
            color: COLORS.ink,
            fontSize: metrics.title.fontSize,
            fontWeight: 810,
            letterSpacing: "-0.052em",
            lineHeight: 0.98,
            textShadow: "0 8px 36px rgba(0,0,0,0.58)",
          }}
        >
          {scene.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          ...metrics.proof,
          zIndex: 14,
          maxWidth: layout === "vertical" ? 500 : 430,
          padding: layout === "square" ? "7px 11px" : "9px 14px",
          border: `1px solid ${scene.accent}66`,
          borderRadius: 999,
          color: COLORS.ink,
          background: "rgba(7, 9, 14, 0.84)",
          boxShadow: "0 12px 34px rgba(0,0,0,0.32)",
          fontSize: metrics.proof.fontSize,
          fontWeight: 760,
          opacity: reveal,
        }}
      >
        {scene.proof}
      </div>
    </>
  );
};

const FootageSceneView: React.FC<{
  layout: ReleaseLayout;
  scene: FootageScene;
}> = ({ layout, scene }) => (
  <AbsoluteFill>
    <AmbientBackground accent={scene.accent} />
    <ProductFrame
      layout={layout}
      source={scene.source}
      sourceStartSeconds={scene.sourceStartSeconds}
      objectPosition={scene.objectPosition}
      staticTail={scene.staticTail}
      motionFrames={scene.motionFrames}
    />
    <SceneTitle layout={layout} scene={scene} />
  </AbsoluteFill>
);

const TrustBadge: React.FC<{ layout: ReleaseLayout }> = ({ layout }) => {
  const metrics = layoutMetrics(layout);
  if (layout === "landscape") return null;

  return (
    <div
      style={{
        position: "absolute",
        ...metrics.badge,
        zIndex: 40,
        padding: "7px 10px",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 999,
        color: COLORS.muted,
        background: "rgba(7, 9, 14, 0.82)",
        fontSize: metrics.badge.fontSize,
        fontWeight: 760,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      Unofficial community plugin
    </div>
  );
};

const CaptionLayer: React.FC<{ layout: ReleaseLayout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const page = CAPTION_PAGES.find(
    (candidate) => currentMs >= candidate.startMs && currentMs < candidate.startMs + candidate.durationMs,
  );
  if (!page) return null;

  const metrics = layoutMetrics(layout);
  const pageEnd = page.startMs + page.durationMs;
  const opacity = Math.min(
    interpolate(currentMs, [page.startMs, page.startMs + 110], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(currentMs, [pageEnd - 120, pageEnd], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: metrics.caption.bottom,
        zIndex: 60,
        width: "max-content",
        maxWidth: metrics.caption.maxWidth,
        padding: metrics.caption.padding,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 18,
        color: COLORS.ink,
        background: "rgba(4, 6, 10, 0.9)",
        boxShadow: "0 18px 56px rgba(0,0,0,0.5)",
        fontSize: metrics.caption.fontSize,
        fontWeight: 720,
        letterSpacing: "-0.025em",
        lineHeight: 1.18,
        textAlign: "center",
        opacity,
        transform: "translateX(-50%)",
      }}
    >
      {page.tokens.map((token) => {
        const active = currentMs >= token.fromMs && currentMs < token.toMs;
        return (
          <span key={`${token.fromMs}-${token.text}`} style={{ color: active ? COLORS.blue : COLORS.ink }}>
            {token.text}
          </span>
        );
      })}
    </div>
  );
};

const IntroScene: React.FC<{ layout: ReleaseLayout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const metrics = layoutMetrics(layout);
  const reveal = frameProgress(frame, 5, 23);
  const landscape = layout === "landscape";

  return (
    <AbsoluteFill>
      <AmbientBackground accent={COLORS.orange} />
      <div
        style={{
          position: "absolute",
          ...(landscape
            ? { inset: 28 }
            : layout === "vertical"
              ? { left: 34, right: 34, top: 286, height: 1190 }
              : { left: 24, right: 24, top: 112, height: 856 }),
          overflow: "hidden",
          border: `1px solid ${COLORS.line}`,
          borderRadius: metrics.frame.borderRadius,
          opacity: 0.48,
          filter: "saturate(0.82)",
          boxShadow: "0 36px 120px rgba(0,0,0,0.54)",
        }}
      >
        <Img
          src={staticFile("deepseek-release/captures/ui-global-applied-verified.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </div>
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at center, rgba(7,9,14,0.32) 0%, rgba(7,9,14,0.84) 66%, #07090E 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: layout === "vertical" ? 24 : 18,
          padding: 52,
          textAlign: "center",
          opacity: reveal,
          transform: `scale(${interpolate(reveal, [0, 1], [0.96, 1])})`,
        }}
      >
        <Img
          src={staticFile("brand/dexthemes-logo.png")}
          style={{
            width: metrics.logo,
            height: metrics.logo,
            borderRadius: Math.round(metrics.logo * 0.27),
            boxShadow: "0 24px 70px rgba(71,173,255,0.24)",
          }}
        />
        <div
          style={{
            color: COLORS.blue,
            fontSize: layout === "vertical" ? 23 : 19,
            fontWeight: 830,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          DexThemes for DeepSeek Harness
        </div>
        <h1
          style={{
            maxWidth: metrics.endWidth,
            margin: 0,
            color: COLORS.ink,
            fontSize: metrics.endTitle,
            fontWeight: 830,
            letterSpacing: "-0.064em",
            lineHeight: 0.92,
          }}
        >
          Themes, without leaving Harness.
        </h1>
        <div style={{ color: COLORS.muted, fontSize: layout === "vertical" ? 30 : 24, fontWeight: 650 }}>
          Browse · preview · apply · revert · create from chat
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{ layout: ReleaseLayout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const metrics = layoutMetrics(layout);
  const reveal = frameProgress(frame, 4, 22);
  const pills = ["100 paired themes", "Chat creation", "One-click revert"];

  return (
    <AbsoluteFill>
      <AmbientBackground accent={COLORS.orange} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,106,0,0.17) 0%, rgba(7,9,14,0.3) 36%, rgba(7,9,14,0.96) 78%)",
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
          gap: layout === "vertical" ? 26 : 19,
          padding: layout === "vertical" ? "80px 58px 154px" : "62px 48px 108px",
          textAlign: "center",
          opacity: reveal,
          transform: `translateY(${interpolate(reveal, [0, 1], [18, 0])}px)`,
        }}
      >
        <Img
          src={staticFile("brand/dexthemes-logo.png")}
          style={{
            width: metrics.logo,
            height: metrics.logo,
            borderRadius: Math.round(metrics.logo * 0.27),
            boxShadow: "0 26px 75px rgba(71,173,255,0.22)",
          }}
        />
        <div
          style={{
            color: COLORS.blue,
            fontSize: layout === "vertical" ? 22 : 18,
            fontWeight: 820,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          DexThemes for DeepSeek Harness
        </div>
        <h1
          style={{
            maxWidth: metrics.endWidth,
            margin: 0,
            color: COLORS.ink,
            fontSize: metrics.endTitle,
            fontWeight: 830,
            letterSpacing: "-0.064em",
            lineHeight: 0.93,
          }}
        >
          Find your vibe. Stay in flow.
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 6,
          }}
        >
          {pills.map((pill) => (
            <span
              key={pill}
              style={{
                padding: layout === "vertical" ? "11px 16px" : "9px 14px",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 999,
                color: COLORS.ink,
                background: "rgba(255,255,255,0.055)",
                fontSize: layout === "vertical" ? 22 : 17,
                fontWeight: 720,
              }}
            >
              {pill}
            </span>
          ))}
        </div>
        <div
          style={{
            maxWidth: layout === "vertical" ? 870 : 1200,
            marginTop: layout === "vertical" ? 28 : 18,
            color: COLORS.muted,
            fontSize: layout === "vertical" ? 20 : 16,
            fontWeight: 560,
            lineHeight: 1.35,
          }}
        >
          Unofficial community plugin. No affiliation, partnership, or endorsement by DeepSeek or ecosystem brands.
        </div>
        <div
          style={{
            maxWidth: layout === "vertical" ? 920 : 1240,
            padding: "8px 13px",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 999,
            color: "rgba(255,255,255,0.68)",
            background: "rgba(255,255,255,0.045)",
            fontSize: layout === "vertical" ? 19 : 17,
            fontWeight: 700,
            letterSpacing: "0.05em",
            lineHeight: 1.25,
          }}
        >
          Registry @dexthemes/deepseek-harness-plugin@0.6.2 · Harness 0.1.0-rc.5
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MusicBed: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile("music/close-up-michael-ramir-c.mp3")}
      volume={(frame) =>
        interpolate(
          frame,
          [0, 30, durationInFrames - 90, durationInFrames - 1],
          [0, 0.105, 0.105, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};

export const DeepSeekReleaseVideo: React.FC<ReleaseProps> = ({ layout }) => (
  <AbsoluteFill style={{ background: COLORS.background, fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <MusicBed />
    <Sequence durationInFrames={90} premountFor={FPS}>
      <IntroScene layout={layout} />
    </Sequence>
    {FOOTAGE_SCENES.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames} premountFor={FPS}>
        <FootageSceneView layout={layout} scene={scene} />
      </Sequence>
    ))}
    <Sequence from={1005} durationInFrames={225} premountFor={FPS}>
      <EndScene layout={layout} />
    </Sequence>
    <TrustBadge layout={layout} />
    <CaptionLayer layout={layout} />
  </AbsoluteFill>
);

export const DeepSeekReleaseCompositions: React.FC = () => (
  <>
    <Composition
      id="DeepSeekHarnessReleaseMaster"
      component={DeepSeekReleaseVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ layout: "landscape" }}
    />
    <Composition
      id="DeepSeekHarnessReleaseVertical"
      component={DeepSeekReleaseVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ layout: "vertical" }}
    />
    <Composition
      id="DeepSeekHarnessReleaseSquare"
      component={DeepSeekReleaseVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1080}
      defaultProps={{ layout: "square" }}
    />
  </>
);
