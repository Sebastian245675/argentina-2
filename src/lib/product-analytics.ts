import { doc, updateDoc, getDoc, increment, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Estructura de datos para el análisis de productos
export interface ProductView {
  productId: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface ProductAnalytics {
  id: string;
  productId: string;
  productName: string;
  totalViews: number;
  lastViewed: Date;
  viewsByDay?: Record<string, number>;
}

// Registra una vista de producto
export const recordProductView = async (
  productId: string, 
  productName: string,
  userId?: string
) => {
  try {
    // Generamos un ID de sesión si no hay usuario autenticado
    const sessionId = userId || `anon_${Math.random().toString(36).substring(2, 15)}`;
    
    // 1. Primero actualizamos el contador general de vistas del producto
    const productAnalyticsRef = doc(db, "productAnalytics", productId);
    const productAnalyticsDoc = await getDoc(productAnalyticsRef);
    
    // Formato de fecha YYYY-MM-DD para agrupar vistas por día
    const today = new Date().toISOString().split('T')[0];
    
    if (productAnalyticsDoc.exists()) {
      // Actualizamos el documento existente
      const viewsByDay = productAnalyticsDoc.data().viewsByDay || {};
      viewsByDay[today] = (viewsByDay[today] || 0) + 1;
      
      await updateDoc(productAnalyticsRef, {
        totalViews: increment(1),
        lastViewed: serverTimestamp(),
        viewsByDay: viewsByDay,
        productName: productName // Por si cambió el nombre del producto
      });
    } else {
      // Creamos un nuevo documento de analytics para este producto
      const viewsByDay: Record<string, number> = {};
      viewsByDay[today] = 1;
      
      await setDoc(productAnalyticsRef, {
        productId,
        productName,
        totalViews: 1,
        lastViewed: serverTimestamp(),
        viewsByDay,
        createdAt: serverTimestamp()
      });
    }
    
    // 2. Registramos la vista individual (para análisis detallado)
    await addDoc(collection(db, "productViews"), {
      productId,
      productName,
      userId,
      sessionId,
      timestamp: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error al registrar vista de producto:", error);
    return false;
  }
};

// Obtiene los productos más vistos
export const getMostViewedProducts = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "productAnalytics"),
      orderBy("totalViews", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProductAnalytics[];
  } catch (error) {
    console.error("Error al obtener productos más vistos:", error);
    return [];
  }
};

// Obtiene los productos menos vistos
export const getLeastViewedProducts = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "productAnalytics"),
      orderBy("totalViews", "asc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProductAnalytics[];
  } catch (error) {
    console.error("Error al obtener productos menos vistos:", error);
    return [];
  }
};

// Obtiene las vistas de un producto específico
export const getProductViewsData = async (productId: string) => {
  try {
    const docRef = doc(db, "productAnalytics", productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ProductAnalytics;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos de vistas del producto:", error);
    return null;
  }
};

// Obtiene datos para gráficos de tendencia (últimos 30 días)
export const getProductViewsTrend = async (productId?: string) => {
  try {
    // Generamos un array de los últimos 30 días (formato YYYY-MM-DD)
    const last30Days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last30Days.push(date.toISOString().split('T')[0]);
    }
    
    // Si se especifica un producto, obtenemos solo sus datos
    if (productId) {
      const productData = await getProductViewsData(productId);
      if (productData) {
        const viewsByDay = productData.viewsByDay || {};
        return last30Days.map(day => ({
          date: day,
          views: viewsByDay[day] || 0
        }));
      }
      return [];
    } 
    
    // Si no se especifica producto, obtenemos datos agregados de todos los productos
    else {
      const snapshot = await getDocs(collection(db, "productAnalytics"));
      const aggregated: Record<string, number> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const viewsByDay = data.viewsByDay || {};
        
        for (const day in viewsByDay) {
          aggregated[day] = (aggregated[day] || 0) + viewsByDay[day];
        }
      });
      
      return last30Days.map(day => ({
        date: day,
        views: aggregated[day] || 0
      }));
    }
  } catch (error) {
    console.error("Error al obtener tendencia de vistas:", error);
    return [];
  }
};

// Exporta datos para Excel (todos los productos con su análisis)
export const getProductsViewsForExport = async () => {
  try {
    const snapshot = await getDocs(collection(db, "productAnalytics"));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const viewsByDay = data.viewsByDay || {};
      
      // Calculamos algunas métricas adicionales
      const dates = Object.keys(viewsByDay);
      const totalDays = dates.length;
      const totalViews = data.totalViews || 0;
      const averageViewsPerDay = totalDays > 0 ? totalViews / totalDays : 0;
      
      // Encontramos el día con más vistas
      let peakDay = "";
      let peakViews = 0;
      
      for (const day in viewsByDay) {
        if (viewsByDay[day] > peakViews) {
          peakDay = day;
          peakViews = viewsByDay[day];
        }
      }
      
      return {
        id: doc.id,
        productName: data.productName || "Producto sin nombre",
        totalViews,
        averageViewsPerDay: averageViewsPerDay.toFixed(2),
        firstViewed: dates.length > 0 ? dates.sort()[0] : "Sin datos",
        lastViewed: data.lastViewed ? new Date(data.lastViewed.seconds * 1000).toLocaleDateString() : "Sin datos",
        peakDay,
        peakViews,
        viewsByDay
      };
    });
  } catch (error) {
    console.error("Error al preparar datos para exportación:", error);
    return [];
  }
};
