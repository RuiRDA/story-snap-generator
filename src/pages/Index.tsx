
import { useEffect } from "react";
import StoryImageEditor from "../components/StoryImageEditor";
import FeedImageEditor from "../components/FeedImageEditor";

const Index = () => {
  // Set page title
  useEffect(() => {
    document.title = "Saia do Caixão - Gerador de Stories para Instagram";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="w-full py-6 px-4 md:px-8 border-b bg-background/80 backdrop-blur-lg fixed top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-primary">#EUVOU</span>
            <span className="font-bold text-lg">Saia do Caixão</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">Saia do Caixão - Imagens para Instagram</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-20">  
        <FeedImageEditor />
        <div className="mt-8"></div>
        <StoryImageEditor />
      
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Saia do Caixão - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
