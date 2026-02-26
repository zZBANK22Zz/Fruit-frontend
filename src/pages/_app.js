import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import initLiff from "@/utils/liff";
import { LanguageProvider } from "@/utils/LanguageContext";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initLiff();
    // Public routes that don't require authentication
    const publicRoutes = [
      '/registration/LoginPage',
      '/registration/RegisterPage',
      '/docs'
    ];

    const checkAuthentication = () => {
      // Check if current route is public
      const currentPath = router.pathname;
      const isPublicRoute = publicRoutes.includes(currentPath);

      // Check if user has token in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (isPublicRoute) {
        if (token) {
          // User is already authenticated, redirect away from LoginPage/RegisterPage
          setIsAuthenticated(true);
          setIsLoading(false);
          router.replace('/');
        } else {
          // If on public route and no token, allow access
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } else {
        // If not on public route, check authentication
        if (token) {
          // User is authenticated
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          // User is not authenticated, redirect to login
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Preserve query parameters (CRITICAL for LIFF login redirect)
          const queryString = typeof window !== 'undefined' ? window.location.search : '';
          router.replace(`/registration/LoginPage${queryString}`);
        }
      }
    };

    // Run check on mount
    checkAuthentication();

    // Listen for route changes
    const handleRouteChange = () => {
      setIsLoading(true);
      // Small delay to ensure route is updated
      setTimeout(checkAuthentication, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  // Only render component if authenticated or on public route
  const publicRoutes = ['/registration/LoginPage', '/registration/RegisterPage', '/docs'];
  const isPublicRoute = publicRoutes.includes(router.pathname);
  
  if (!isAuthenticated && !isPublicRoute) {
    return null; // Don't render anything while redirecting
  }

  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
