import { getColorValue, getColorName, isValidColor } from '@/lib/utils';

interface ColorDisplayProps {
  colors: string[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function ColorDisplay({ 
  colors, 
  size = 'md', 
  showLabels = false, 
  maxDisplay = 10,
  className = '' 
}: ColorDisplayProps) {
  if (!colors || colors.length === 0) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const displayedColors = colors.slice(0, maxDisplay);
  const remainingCount = colors.length - maxDisplay;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabels && (
        <span className="text-sm font-medium text-gray-300">Màu sắc:</span>
      )}
      <div className="flex gap-1">
        {displayedColors.map((color: string) => (
          <div key={color} className="flex flex-col items-center gap-1">
            <span 
              className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer`}
              style={{ background: getColorValue(color) }}
              title={`${color} (${getColorValue(color)})`}
            ></span>
            {showLabels && (
              <span className="text-xs text-gray-400 text-center max-w-16 truncate">
                {color}
              </span>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-400 flex items-center">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
}

// Component để hiển thị màu sắc đã chọn
export function SelectedColorDisplay({ color, small }: { color: string; small?: boolean }) {
  if (!color) return null;
  const colorName = getColorName(getColorValue(color));

  return (
    <div className={`flex items-center gap-1 p-1 bg-[#00FFFF]/10 rounded-lg border border-[#00FFFF]/30 w-fit`}>
      <span 
        className={`${small ? 'w-3 h-3' : 'w-4 h-4'} rounded-full border-2 border-white`} 
        style={{ background: getColorValue(color) }}
      ></span>
      <span className={`font-medium ${small ? 'text-xs text-[#00FFFF]' : 'text-sm text-[#00FFFF]'} max-w-[160px] truncate`}>
        Đã chọn: {colorName}
      </span>
    </div>
  );
}

// Demo component để test màu sắc
export function ColorDisplayDemo() {
  const testColors = [
    'Đen', 'Trắng', 'Xanh dương', 'Đỏ', 'Vàng', 'Tím', 'Cam', 'Hồng',
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    'invalid-color', '', 'rgb(255,0,0)', 'rgba(0,255,0,0.5)'
  ];

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Demo Color Display</h3>
      
      {/* Debug Info */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Information:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {testColors.map((color) => (
            <div key={color} className="flex items-center gap-2">
              <span 
                className="w-4 h-4 rounded-full border border-white" 
                style={{ background: getColorValue(color) }}
              ></span>
              <span className="text-gray-400">"{color}"</span>
              <span className="text-gray-300">→</span>
              <span className="text-cyan-400">{getColorValue(color)}</span>
              <span className={`px-1 rounded text-xs ${isValidColor(color) ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {isValidColor(color) ? 'Valid' : 'Invalid'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Small size:</h4>
          <ColorDisplay colors={testColors} size="sm" showLabels={true} maxDisplay={6} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Medium size:</h4>
          <ColorDisplay colors={testColors} size="md" showLabels={true} maxDisplay={6} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Large size:</h4>
          <ColorDisplay colors={testColors} size="lg" showLabels={true} maxDisplay={6} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Without labels:</h4>
          <ColorDisplay colors={testColors} size="md" showLabels={false} maxDisplay={8} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Color Display:</h4>
          <SelectedColorDisplay color="Đen" />
        </div>
      </div>
    </div>
  );
} 