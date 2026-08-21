import "./index.css";
import { BuildWeekComposition } from "./Composition";
import { DeepSeek064LaunchComposition } from "./DeepSeek064Launch";
import { DeepSeekProductFilmComposition } from "./DeepSeekProductFilm";
import { DeepSeekReleaseCompositions } from "./DeepSeekRelease";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <BuildWeekComposition />
      <DeepSeekReleaseCompositions />
      <DeepSeek064LaunchComposition />
      <DeepSeekProductFilmComposition />
    </>
  );
};
