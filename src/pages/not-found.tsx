
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { MainLayout } from "@/components/layout/main-layout";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <PageContainer className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h1 className="text-6xl font-bold gradient-text-nova mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-white/60 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate('/')} 
          className="gradient-bg-nova hover:shadow-neon-nova"
        >
          Return to Home
        </Button>
      </PageContainer>
    </MainLayout>
  );
}
