import { useEffect } from "react";
import ImageEditingPage from "../components/ImageEditingPage";

const Embaixadores = () => {
  // Set page title
  useEffect(() => {
    document.title = "Embaixadores - Gerador de Stories para Instagram";
  }, []);

  return (
    <ImageEditingPage
      headerPrimaryText="#EMBAIXADOR"
      headerSecondaryText="Saia do Caixão"
      headerSubText="Embaixadores - Imagens para Instagram"
      feedOverlayImage="lovable-uploads/SDC_Embaixador_feed.png"
      storyOverlayImage="lovable-uploads/SDC_Embaixador_Story.png"
    />
  );
};

export default Embaixadores;