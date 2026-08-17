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

const FPS = 30;
const DURATION_IN_FRAMES = 22 * FPS;

const COLORS = {
  background: "#07090E",
  ink: "#F7F8FC",
  muted: "#A8B0BF",
  line: "rgba(255,255,255,0.14)",
  blue: "#47ADFF",
  rose: "#FF4F72",
  green: "#69D4A5",
};

type ProofSceneProps = {
  eyebrow: string;
  title: string;
  body: string;
  badge: string;
  accent: string;
  image: string;
  imagePosition?: string;
};

const enter = (frame: number, from = 0, to = 18) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [-4, 6]);

  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle at ${22 + drift}% 18%, ${accent}2E 0%, transparent 37%), ` +
          `radial-gradient(circle at 88% 82%, ${COLORS.blue}1F 0%, transparent 34%), ${COLORS.background}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </AbsoluteFill>
  );
};

const ReleaseMark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 38,
      right: 44,
      zIndex: 20,
      padding: "10px 15px",
      border: `1px solid ${COLORS.line}`,
      borderRadius: 999,
      color: COLORS.ink,
      background: "rgba(7,9,14,0.84)",
      fontSize: 17,
      fontWeight: 780,
      letterSpacing: "0.04em",
    }}
  >
    Public release · 0.6.4
  </div>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = enter(frame, 4, 24);

  return (
    <AbsoluteFill>
      <Background accent={COLORS.rose} />
      <Img
        src={staticFile("deepseek-release/captures/dexthemes-064-lunar-orchard-applied.png")}
        style={{
          position: "absolute",
          inset: 28,
          width: "calc(100% - 56px)",
          height: "calc(100% - 56px)",
          objectFit: "cover",
          objectPosition: "center 28%",
          borderRadius: 34,
          filter: "blur(3px) saturate(0.76)",
          opacity: 0.28,
          scale: 1.02,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at center, rgba(7,9,14,0.2) 0%, rgba(7,9,14,0.88) 72%)",
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
          gap: 22,
          textAlign: "center",
          opacity: reveal,
          scale: interpolate(reveal, [0, 1], [0.96, 1]),
        }}
      >
        <Img
          src={staticFile("brand/dexthemes-logo.png")}
          style={{ width: 132, height: 132, borderRadius: 34, boxShadow: "0 24px 80px rgba(71,173,255,0.3)" }}
        />
        <div style={{ color: COLORS.blue, fontSize: 20, fontWeight: 830, letterSpacing: "0.17em", textTransform: "uppercase" }}>
          DexThemes for DeepSeek Harness
        </div>
        <h1
          style={{
            maxWidth: 1460,
            margin: 0,
            color: COLORS.ink,
            fontSize: 104,
            fontWeight: 840,
            letterSpacing: "-0.065em",
            lineHeight: 0.92,
          }}
        >
          Themes, without leaving Harness.
        </h1>
        <div style={{ color: COLORS.muted, fontSize: 30, fontWeight: 660 }}>Browse · create · apply · revert</div>
      </div>
      <ReleaseMark />
    </AbsoluteFill>
  );
};

const ProofScene: React.FC<ProofSceneProps> = ({
  eyebrow,
  title,
  body,
  badge,
  accent,
  image,
  imagePosition = "center",
}) => {
  const frame = useCurrentFrame();
  const reveal = enter(frame, 2, 20);
  const imageReveal = enter(frame, 7, 27);

  return (
    <AbsoluteFill>
      <Background accent={accent} />
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 116,
          bottom: 106,
          width: 660,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 22,
          opacity: reveal,
          translate: `${interpolate(reveal, [0, 1], [-20, 0])}px 0px`,
        }}
      >
        <div style={{ color: accent, fontSize: 20, fontWeight: 820, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {eyebrow}
        </div>
        <h2
          style={{
            margin: 0,
            color: COLORS.ink,
            fontSize: 76,
            fontWeight: 830,
            letterSpacing: "-0.06em",
            lineHeight: 0.96,
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, maxWidth: 610, color: COLORS.muted, fontSize: 29, fontWeight: 580, lineHeight: 1.34 }}>
          {body}
        </p>
        <div
          style={{
            alignSelf: "flex-start",
            marginTop: 8,
            padding: "10px 15px",
            border: `1px solid ${accent}66`,
            borderRadius: 999,
            color: COLORS.ink,
            background: "rgba(255,255,255,0.06)",
            fontSize: 18,
            fontWeight: 760,
          }}
        >
          {badge}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 796,
          right: 54,
          top: 74,
          bottom: 74,
          overflow: "hidden",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 34,
          background: "#111318",
          boxShadow: "0 40px 130px rgba(0,0,0,0.58)",
          opacity: imageReveal,
          translate: `${interpolate(imageReveal, [0, 1], [24, 0])}px 0px`,
          scale: interpolate(imageReveal, [0, 1], [0.985, 1]),
        }}
      >
        <Img
          src={staticFile(image)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: imagePosition }}
        />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
      </div>
      <ReleaseMark />
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = enter(frame, 3, 22);

  return (
    <AbsoluteFill>
      <Background accent={COLORS.blue} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          padding: 70,
          textAlign: "center",
          opacity: reveal,
          translate: `0px ${interpolate(reveal, [0, 1], [18, 0])}px`,
        }}
      >
        <Img src={staticFile("brand/dexthemes-logo.png")} style={{ width: 112, height: 112, borderRadius: 29 }} />
        <div style={{ color: COLORS.blue, fontSize: 20, fontWeight: 830, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          DexThemes for DeepSeek Harness · 0.6.4
        </div>
        <h2
          style={{
            maxWidth: 1500,
            margin: 0,
            color: COLORS.ink,
            fontSize: 104,
            fontWeight: 840,
            letterSpacing: "-0.065em",
            lineHeight: 0.92,
          }}
        >
          Find your vibe. Stay in flow.
        </h2>
        <div
          style={{
            marginTop: 12,
            padding: "17px 25px",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 18,
            color: COLORS.ink,
            background: "rgba(255,255,255,0.06)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 25,
            fontWeight: 680,
          }}
        >
          npm i @dexthemes/deepseek-harness-plugin
        </div>
        <div style={{ color: COLORS.muted, fontSize: 18, fontWeight: 560 }}>
          Open source · Unofficial community plugin · Not affiliated with or endorsed by DeepSeek
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Music: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile("music/close-up-michael-ramir-c.mp3")}
      volume={(frame) =>
        interpolate(frame, [0, 30, durationInFrames - 60, durationInFrames - 1], [0, 0.11, 0.11, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};

export const DeepSeek064LaunchVideo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: COLORS.background,
      fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}
  >
    <Music />
    <Sequence durationInFrames={90} premountFor={FPS}>
      <Intro />
    </Sequence>
    <Sequence from={90} durationInFrames={150} premountFor={FPS}>
      <ProofScene
        eyebrow="Inside the real Harness UI"
        title="Themes live in Settings."
        body="Browse paired light and dark palettes, then apply through Harness's supported theme service."
        badge="Clean npm install · 0.6.4"
        accent={COLORS.blue}
        image="deepseek-release/captures/dexthemes-064-connected-activity-recorded.png"
        imagePosition="center 26%"
      />
    </Sequence>
    <Sequence from={240} durationInFrames={180} premountFor={FPS}>
      <ProofScene
        eyebrow="Create with chat"
        title="Generate. Validate. Apply."
        body="Lunar Orchard was created in a real Harness session and applied as a reversible Cordis package."
        badge="Loaded runtime · Applied"
        accent={COLORS.rose}
        image="deepseek-release/captures/dexthemes-064-lunar-orchard-applied.png"
        imagePosition="center 36%"
      />
    </Sequence>
    <Sequence from={420} durationInFrames={120} premountFor={FPS}>
      <ProofScene
        eyebrow="Reversible by design"
        title="Stop once. Harness returns."
        body="The exact theme layer is removed and the native Harness palette is restored."
        badge="Loaded runtime · Reverted"
        accent={COLORS.green}
        image="deepseek-release/captures/dexthemes-064-lunar-orchard-reverted.png"
        imagePosition="center 36%"
      />
    </Sequence>
    <Sequence from={540} durationInFrames={120} premountFor={FPS}>
      <End />
    </Sequence>
  </AbsoluteFill>
);

export const DeepSeek064LaunchComposition: React.FC = () => (
  <Composition
    id="DeepSeekHarness064Launch"
    component={DeepSeek064LaunchVideo}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
