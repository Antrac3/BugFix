import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MapPin, Sword, Crown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="fantasy-card max-w-lg w-full">
        <CardContent className="p-12 text-center">
          <div className="relative mb-8">
            <MapPin className="h-24 w-24 text-muted-foreground mx-auto" />
            <div className="absolute -top-2 -right-2 flex space-x-1">
              <Sword className="h-6 w-6 text-fantasy-primary" />
              <Crown className="h-6 w-6 text-fantasy-gold" />
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-4 bg-fantasy-gradient bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            Perso nel Regno
          </h2>

          <p className="text-muted-foreground mb-8">
            La pagina che cerchi è svanita nel piano etereo. Nemmeno gli
            avventurieri più esperti riescono a trovare questo sentiero.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Tentativo di accesso a:{" "}
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {location.pathname}
            </code>
          </p>

          <Button asChild className="fantasy-button">
            <a href="/">
              <Home className="h-4 w-4 mr-2" />
              Ritorna alla Base della Campagna
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
