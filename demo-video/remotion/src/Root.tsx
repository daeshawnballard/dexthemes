import "./index.css";
import { BuildWeekComposition } from "./Composition";
import { DeepSeekReleaseCompositions } from "./DeepSeekRelease";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <BuildWeekComposition />
      <DeepSeekReleaseCompositions />
    </>
  );
};
