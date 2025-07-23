import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
          <p className="text-xl text-gray-600">Oops! Page not found</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
