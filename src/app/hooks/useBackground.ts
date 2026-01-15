import { useState, useEffect } from "react";

export function useBackground(pageName: string) {
  const [backgroundUrl, setBackgroundUrl] = useState<string>("/image-fundo-3.jpg");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBackground = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/backgrounds/${pageName}/`
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.background_url) {
            const fullUrl = data.background_url.startsWith("http")
              ? data.background_url
              : `${process.env.NEXT_PUBLIC_API_URL}${data.background_url}`;
            
            setBackgroundUrl(fullUrl);
          }
        }
      } catch (error) {
        console.error(`Erro ao carregar background da página ${pageName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadBackground();
  }, [pageName]);

  return { backgroundUrl, loading };
}