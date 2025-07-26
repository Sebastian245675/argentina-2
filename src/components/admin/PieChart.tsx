import React from 'react';

interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
}

// Genera colores pastel automáticamente si no se proveen
const pastelColors = [
  '#FFB347', '#FF6961', '#77DD77', '#AEC6CF', '#CBAACB', '#FFD1DC', '#B39EB5', '#FFB347', '#B0E0E6', '#FDFD96'
];

export const PieChart: React.FC<PieChartProps> = ({ data, size = 180 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;

  // Calcula los arcos para cada segmento
  const arcs = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    cumulative += d.value;

    // Coordenadas para el arco
    const x1 = size / 2 + (size / 2 - 10) * Math.cos(startAngle - Math.PI / 2);
    const y1 = size / 2 + (size / 2 - 10) * Math.sin(startAngle - Math.PI / 2);
    const x2 = size / 2 + (size / 2 - 10) * Math.cos(endAngle - Math.PI / 2);
    const y2 = size / 2 + (size / 2 - 10) * Math.sin(endAngle - Math.PI / 2);
    const largeArc = angle > Math.PI ? 1 : 0;
    const color = d.color || pastelColors[i % pastelColors.length];

    const pathData = [
      `M ${size / 2} ${size / 2}`,
      `L ${x1} ${y1}`,
      `A ${size / 2 - 10} ${size / 2 - 10} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return { pathData, color, label: d.label, value: d.value };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.pathData} fill={arc.color} stroke="#fff" strokeWidth={2} />
        ))}
      </svg>
      <div className="flex flex-wrap justify-center mt-4 gap-2">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: arc.color }}></span>
            <span className="font-medium">{arc.label}</span>
            <span className="text-muted-foreground">({arc.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
