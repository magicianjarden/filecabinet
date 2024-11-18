'use client';

interface ConversionChartProps {
  conversionTimes: number[];
}

export function ConversionChart({ conversionTimes }: ConversionChartProps) {
  const max = Math.max(...conversionTimes, 1);
  const min = Math.min(...conversionTimes, 0);
  const range = max - min;

  const getHeight = (value: number) => {
    return ((value - min) / range) * 100;
  };

  return (
    <div className="w-full h-[200px] flex items-end gap-2">
      {conversionTimes.map((time, index) => {
        const height = getHeight(time);
        return (
          <div
            key={index}
            className="group flex-1 flex flex-col items-center gap-2 relative"
          >
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded">
              {time.toFixed(1)}s
            </div>
            <div 
              className="w-full bg-green-600/20 hover:bg-green-600/30 transition-colors rounded-t"
              style={{ height: `${height}%` }}
            >
              <div 
                className="w-full bg-green-600 h-1 rounded-full transform -translate-y-1/2"
                style={{ opacity: height / 100 }}
              />
            </div>
            <span className="text-xs text-slate-600 absolute -bottom-6">
              {index + 1}
            </span>
          </div>
        )
      })}
    </div>
  );
} 