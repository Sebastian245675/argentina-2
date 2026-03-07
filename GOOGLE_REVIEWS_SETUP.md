# Guía de Implementación: Google Reviews

## Paso 1: Configurar Google Cloud Project

1. **Ir a Google Cloud Console**
   - Visita: https://console.cloud.google.com
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar APIs necesarias**
   - Google My Business API
   - Google Business Profile API
   - Google Places API

3. **Crear credenciales**
   - API & Services → Credentials
   - Create Credentials → Service Account
   - Descargar el archivo JSON de credenciales

4. **Obtener tu Place ID**
   - Visita: https://developers.google.com/maps/documentation/places/web-service/place-id
   - Busca tu negocio y copia el Place ID

## Paso 2: Método 1 - Widget de Google Reviews (Más Simple)

### Opción A: Usar el Widget Oficial de Google

```html
<!-- En tu componente de testimonios -->
<div id="google-reviews-widget">
  <!-- Google generará este código desde tu perfil de Google Business -->
  <script src="https://apps.elfsight.com/p/platform.js" defer></script>
  <div class="elfsight-app-YOUR_APP_ID"></div>
</div>
```

**Pasos:**
1. Ve a tu Google Business Profile
2. Busca "Get more reviews" o "Compartir reseñas"
3. Genera el widget embed code
4. Pégalo en tu sitio web

### Opción B: Badge de Google Reviews

```html
<!-- Badge simple que redirige a Google -->
<a href="https://search.google.com/local/reviews?placeid=YOUR_PLACE_ID" 
   target="_blank" 
   rel="noopener">
  <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
       alt="Ver reseñas en Google">
</a>
```

## Paso 3: Método 2 - API de Google Places (Requiere Backend)

### Backend (Node.js/Express)

```javascript
// functions/index.js o similar
const functions = require('firebase-functions');
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

exports.getGoogleReviews = functions.https.onRequest(async (req, res) => {
  try {
    const placeId = 'TU_PLACE_ID'; // Place ID de tu negocio
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'rating', 'reviews', 'user_ratings_total'],
        key: apiKey,
      },
    });

    const reviews = response.data.result.reviews || [];
    const reviewsData = reviews.map(review => ({
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.time,
      profile_photo_url: review.profile_photo_url,
    }));

    res.json({
      success: true,
      rating: response.data.result.rating,
      total_ratings: response.data.result.user_ratings_total,
      reviews: reviewsData,
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Frontend (React/TypeScript)

```typescript
// src/hooks/use-google-reviews.ts
import { useState, useEffect } from 'react';

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
}

interface GoogleReviewsData {
  rating: number;
  total_ratings: number;
  reviews: GoogleReview[];
}

export const useGoogleReviews = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('YOUR_CLOUD_FUNCTION_URL/getGoogleReviews');
        const data: { success: boolean; rating: number; total_ratings: number; reviews: GoogleReview[] } = await response.json();
        
        if (data.success) {
          setReviews(data.reviews);
          setRating(data.rating);
          setTotalRatings(data.total_ratings);
        } else {
          setError('Error al cargar reseñas');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return { reviews, rating, totalRatings, loading, error };
};
```

## Paso 4: Método 3 - Servicio de Terceros (Recomendado para simplicidad)

### Servicios que puedes usar:

1. **Elfsight Google Reviews Widget** (Más popular)
   - https://elfsight.com/google-reviews-widget/
   - Precio: ~$5-20/mes
   - Instalación inmediata con script

2. **Trustmary**
   - https://trustmary.com
   - Precio: ~$49/mes
   - Integración completa con automatización

3. **Birdeye**
   - https://birdeye.com
   - Precio: Enterprise
   - Solución completa de gestión de reseñas

### Ejemplo con Elfsight:

```typescript
// src/components/GoogleReviewsWidget.tsx
import React, { useEffect } from 'react';

export const GoogleReviewsWidget: React.FC = () => {
  useEffect(() => {
    // Cargar script de Elfsight
    const script = document.createElement('script');
    script.src = 'https://apps.elfsight.com/p/platform.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="google-reviews-container py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Lo que dicen nuestros clientes
      </h2>
      <div className="elfsight-app-YOUR_APP_ID"></div>
    </div>
  );
};
```

## Paso 5: Implementación Recomendada para tu Proyecto

**Para "visfum", te recomiendo:**

### Opción A: Widget Simple (Sin costo, rápido)

1. Añade un botón que redirija a tus reseñas de Google
2. Muestra el rating promedio de Google
3. Mantén el sistema de testimonios actual para clientes internos

### Opción B: API + Cache (Mejor experiencia)

1. Configurar Cloud Function que consulte Google Places API
2. Cachear resultados por 24 horas
3. Mostrar reseñas reales de Google en tu sitio

## Paso 6: Instalación de Dependencias

```bash
# Para backend (Firebase Functions)
cd functions
npm install @googlemaps/google-maps-services-js
npm install dotenv

# Para frontend (si usas librería específica)
npm install react-google-reviews
```

## Paso 7: Variables de Entorno

```env
# .env o Firebase Config
GOOGLE_PLACES_API_KEY=tu_api_key_aqui
GOOGLE_PLACE_ID=tu_place_id_aqui
```

## Consideraciones Importantes

1. **Límites de API:**
   - Google Places API: 200,000 requests/mes gratis
   - Después: $2 por 1,000 requests

2. **Actualización:**
   - Las reseñas de Google no se actualizan en tiempo real
   - Recomendado: Cachear por 24 horas

3. **Políticas:**
   - No puedes modificar el contenido de las reseñas de Google
   - No puedes filtrar reseñas negativas (debe mostrar todas)
   - Debe tener enlace a Google para ver todas las reseñas

4. **Verificación de Negocio:**
   - Tu negocio debe estar verificado en Google My Business
   - Debe tener al menos algunas reseñas para mostrar

## Recursos Útiles

- Google Places API: https://developers.google.com/maps/documentation/places/web-service/overview
- Google My Business: https://www.google.com/business/
- Place ID Finder: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
