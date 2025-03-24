
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="text-center space-y-6 animate-fade-in max-w-md">
        <h1 className="text-7xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A página que procura não existe.
        </p>
        <a
          href="/"
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
