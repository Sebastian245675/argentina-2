import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, TrendingUp, TrendingDown, Download, BarChart3, LineChart } from 'lucide-react';
import { getMostViewedProducts, getLeastViewedProducts, getProductViewsTrend, getProductsViewsForExport, ProductAnalytics } from '@/lib/product-analytics';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
// Colores para el pastel de productos
const pieColors = [
  '#f59e42', '#fbbf24', '#10b981', '#3b82f6', '#6366f1', '#ef4444', '#a21caf', '#f472b6', '#facc15', '#14b8a6', '#64748b', '#eab308'
];

// Componente para gráfico de barras simple (usando divs)
const SimpleBarChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium truncate w-48">{item.name}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
              style={{ width: `${maxValue ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Gráfico de tendencia tipo montaña (área) usando recharts
const SimpleTrendChart = ({ data }: { data: { date: string; views: number }[] }) => {
  // Formatear fechas para eje X
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };
  return (
    <div className="h-52 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e42" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e42" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value: any) => [value, 'Vistas']} labelFormatter={formatShortDate} />
          <Area type="monotone" dataKey="views" stroke="#f59e42" fill="url(#colorViews)" strokeWidth={3} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};



export const ProductAnalyticsView: React.FC = () => {
  const [mostViewed, setMostViewed] = useState<ProductAnalytics[]>([]);
  const [leastViewed, setLeastViewed] = useState<ProductAnalytics[]>([]);
  const [trend, setTrend] = useState<{ date: string; views: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [categoryData, setCategoryData] = useState<{ label: string; value: number }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mostData, leastData, trendData] = await Promise.all([
          getMostViewedProducts(100),
          getLeastViewedProducts(100),
          getProductViewsTrend()
        ]);
        
        setMostViewed(mostData);
        setLeastViewed(leastData);
        setTrend(trendData);
        
        // Calcular distribución por categoría
        const catMap: Record<string, number> = {};
        mostData.forEach((p: any) => {
          const cat = (p.category || 'Sin categoría').toString();
          catMap[cat] = (catMap[cat] || 0) + (p.totalViews || 0);
        });
        setCategoryData(Object.entries(catMap).map(([label, value]) => ({ label, value })));
      } catch (error) {
        console.error("Error al cargar datos de análisis:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Exportar a Excel
  const handleExport = async () => {
    try {
      const productsData = await getProductsViewsForExport();
      
      // Crear libro y hoja
      const wb = XLSX.utils.book_new();
      
      // Exportar datos generales
      const wsData = productsData.map(p => ({
        'ID Producto': p.id,
        'Nombre': p.productName,
        'Total Vistas': p.totalViews,
        'Promedio Vistas/Día': p.averageViewsPerDay,
        'Primera Vista': p.firstViewed,
        'Última Vista': p.lastViewed,
        'Día con más vistas': p.peakDay,
        'Vistas en pico': p.peakViews
      }));
      
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Resumen Productos");
      
      // Exportar tendencia diaria (otra hoja)
      const allDates = new Set<string>();
      productsData.forEach(p => {
        if (p.viewsByDay) {
          Object.keys(p.viewsByDay).forEach(date => allDates.add(date));
        }
      });
      
      const sortedDates = Array.from(allDates).sort();
      const trendData: any[] = [];
      
      // Cabecera
      const trendHeader: any = { Fecha: 'Fecha' };
      productsData.forEach(p => {
        trendHeader[p.id] = p.productName;
      });
      trendData.push(trendHeader);
      
      // Datos por día
      sortedDates.forEach(date => {
        const row: any = { Fecha: date };
        productsData.forEach(p => {
          row[p.id] = p.viewsByDay?.[date] || 0;
        });
        trendData.push(row);
      });
      
      const wsTrend = XLSX.utils.json_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, wsTrend, "Tendencia Diaria");
      
      // Descargar
      XLSX.writeFile(wb, `Análisis_Productos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Error al exportar datos:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análisis de Productos</h2>
          <p className="text-muted-foreground">
            Métricas detalladas sobre las vistas de tus productos
          </p>
        </div>
        <Button 
          onClick={handleExport}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de tendencia general */}
        <Card className="md:col-span-3 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tendencia de Visualizaciones
                </CardTitle>
                <CardDescription>
                  Vistas totales a productos en los últimos 30 días
                </CardDescription>
              </div>
              <Select 
                defaultValue={timeRange} 
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
              </div>
            ) : trend.length > 0 ? (
              <SimpleTrendChart data={trend} />
            ) : (
              <div className="h-52 flex items-center justify-center">
                <div className="text-muted-foreground">Sin datos disponibles</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tarjetas de métricas principales */}
        <Tabs defaultValue="most-viewed" className="col-span-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="most-viewed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Más Vistos
            </TabsTrigger>
            <TabsTrigger value="least-viewed" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Menos Vistos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="most-viewed" className="space-y-4 pt-3">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Vistas</TableHead>
                      <TableHead className="w-32">Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          <div className="animate-pulse">Cargando datos...</div>
                        </TableCell>
                      </TableRow>
                    ) : mostViewed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No hay datos disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      mostViewed.map((product) => {
                        const maxViews = mostViewed[0]?.totalViews || 1;
                        const percentage = product.totalViews / maxViews * 100;
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.productName}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                {product.totalViews}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="least-viewed" className="space-y-4 pt-3">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Vistas</TableHead>
                      <TableHead className="w-32">Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          <div className="animate-pulse">Cargando datos...</div>
                        </TableCell>
                      </TableRow>
                    ) : leastViewed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No hay datos disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      leastViewed.map((product) => {
                        const maxViews = Math.max(...leastViewed.map(p => p.totalViews)) || 1;
                        const percentage = product.totalViews / maxViews * 100;
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.productName}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                {product.totalViews}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-red-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Gráfico de pastel de productos más vistos */}
        <Card className="row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución de Vistas por Producto
            </CardTitle>
            <CardDescription>
              Porcentaje de vistas de los productos más populares
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
              </div>
            ) : mostViewed.length > 0 ? (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mostViewed.slice(0, 8).map(product => ({
                        name: product.productName,
                        value: product.totalViews
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mostViewed.slice(0, 8).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `${value} vistas`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">Sin datos disponibles</div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
