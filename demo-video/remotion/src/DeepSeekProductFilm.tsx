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
const DURATION_IN_FRAMES = 26 * FPS;

const COLORS = {
  ink: "#F8FAFF",
  muted: "#BBC4D4",
  blue: "#68B9FF",
  orange: "#FF6A00",
  green: "#63D4A0",
  violet: "#B4A2FF",
  background: "#07090E",
};

type ProductSceneProps = {
  accent: string;
  title: string;
  kicker?: string;
  video?: string;
  still?: string;
  trimBefore?: number;
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const reveal = (frame: number, from = 0, to = 16) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const ProductScene: React.FC<ProductSceneProps> = ({ accent, title, kicker, video, still, trimBefore = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const entrance = reveal(frame, 0, 18);
  const exit = interpolate(frame, [durationInFrames - 13, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const opacity = Math.min(entrance, exit);

  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity,
          scale: interpolate(entrance, [0, 1], [1.035, 1]),
        }}
      >
        {video ? (
          <Video
            src={staticFile(video)}
            trimBefore={trimBefore * FPS}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Img src={staticFile(still ?? "")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(4,6,10,0.9) 0%, rgba(4,6,10,0.48) 38%, rgba(4,6,10,0.05) 70%), linear-gradient(0deg, rgba(4,6,10,0.28) 0%, transparent 40%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 84,
          width: 660,
          color: COLORS.ink,
          opacity,
          translate: `${interpolate(entrance, [0, 1], [-24, 0])}px 0px`,
        }}
      >
        {kicker ? (
          <div
            style={{
              marginBottom: 16,
              color: accent,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div style={{ fontSize: 78, fontWeight: 820, letterSpacing: "-0.065em", lineHeight: 0.92 }}>{title}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 92,
          bottom: 74,
          width: 88,
          height: 4,
          borderRadius: 4,
          background: accent,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const entrance = reveal(frame, 5, 25);
  const exit = interpolate(frame, [80, 89], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(entrance, exit);

  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      <Video
        src={staticFile("deepseek-release/captures/ui-flow.webm")}
        trimBefore={2 * FPS}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%", opacity: 0.5, filter: "blur(2px) saturate(0.78)" }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 63% 50%, rgba(104,185,255,0.2) 0%, transparent 34%), linear-gradient(90deg, rgba(4,6,10,0.94) 0%, rgba(4,6,10,0.62) 54%, rgba(4,6,10,0.2) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 290,
          width: 860,
          opacity,
          translate: `${interpolate(entrance, [0, 1], [-26, 0])}px 0px`,
        }}
      >
        <div style={{ marginBottom: 22, color: COLORS.blue, fontSize: 21, fontWeight: 820, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          DexThemes for DeepSeek Harness
        </div>
        <div style={{ color: COLORS.ink, fontSize: 102, fontWeight: 840, letterSpacing: "-0.07em", lineHeight: 0.88 }}>
          Your Harness.
          <br />
          Your atmosphere.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const entrance = reveal(frame, 4, 24);
  const { durationInFrames } = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(entrance, exit);

  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      <Img
        src={staticFile("deepseek-release/captures/chat-lucky-verified.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.16, filter: "blur(4px) saturate(0.58)" }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at center, rgba(104,185,255,0.18), rgba(7,9,14,0.97) 62%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 22,
          textAlign: "center",
          opacity,
          scale: interpolate(entrance, [0, 1], [0.96, 1]),
        }}
      >
        <Img src={staticFile("brand/dexthemes-logo.png")} style={{ width: 110, height: 110, borderRadius: 28 }} />
        <div style={{ color: COLORS.blue, fontSize: 20, fontWeight: 820, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          DexThemes for DeepSeek
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
        interpolate(frame, [0, 24, durationInFrames - 36, durationInFrames - 1], [0, 0.12, 0.12, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};

export const DeepSeekProductFilm: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <Music />
    <Sequence durationInFrames={90} premountFor={FPS}>
      <Intro />
    </Sequence>
    <Sequence from={90} durationInFrames={135} premountFor={FPS}>
      <ProductScene
        accent={COLORS.blue}
        kicker="Discover"
        title="Browse the catalog."
        video="deepseek-release/captures/ui-flow.webm"
        trimBefore={3.8}
      />
    </Sequence>
    <Sequence from={225} durationInFrames={120} premountFor={FPS}>
      <ProductScene
        accent={COLORS.orange}
        kicker="Preview"
        title="Preview both modes."
        still="deepseek-release/captures/ui-preview-verified.png"
      />
    </Sequence>
    <Sequence from={345} durationInFrames={120} premountFor={FPS}>
      <ProductScene
        accent={COLORS.orange}
        kicker="Apply"
        title="Apply in one click."
        still="deepseek-release/captures/ui-applied-verified.png"
      />
    </Sequence>
    <Sequence from={465} durationInFrames={105} premountFor={FPS}>
      <ProductScene
        accent={COLORS.green}
        kicker="Revert"
        title="Revert anytime."
        still="deepseek-release/captures/ui-reverted-verified.png"
      />
    </Sequence>
    <Sequence from={570} durationInFrames={135} premountFor={FPS}>
      <ProductScene
        accent={COLORS.violet}
        kicker="Chat"
        title="Create with chat."
        video="deepseek-release/captures/chat-lucky.webm"
        trimBefore={1.1}
      />
    </Sequence>
    <Sequence from={705} durationInFrames={75} premountFor={FPS}>
      <End />
    </Sequence>
  </AbsoluteFill>
);

export const DeepSeekProductFilmComposition: React.FC = () => (
  <Composition
    id="DeepSeekHarnessProductFilm"
    component={DeepSeekProductFilm}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
