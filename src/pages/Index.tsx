import { useEffect } from "react";
import ImageEditingPage from "../components/ImageEditingPage";

const Index = () => {
  // Set page title
  useEffect(() => {
    document.title = "Saia do Caixão - Gerador de Stories para Instagram";
  }, []);

  return (
    <ImageEditingPage
      headerPrimaryText="#EUVOU"
      headerSecondaryText="Saia do Caixão"
      headerSubText="Saia do Caixão - Imagens para Instagram"
      feedOverlayImage="lovable-uploads/SDC_Eu_vou_feed.png"
      storyOverlayImage="lovable-uploads/SDC_Eu_vou_story.png"
    />
  );
};

export default Index;
