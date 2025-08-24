import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color mapping for common color names (both English and Vietnamese)
const colorMap: { [key: string]: string } = {
  // English colors
  'black': '#000000',
  'white': '#FFFFFF',
  'red': '#FF0000',
  'green': '#00FF00',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'purple': '#800080',
  'orange': '#FFA500',
  'pink': '#FFC0CB',
  'gray': '#808080',
  'grey': '#808080',
  'brown': '#A52A2A',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'lime': '#00FF00',
  'navy': '#000080',
  'teal': '#008080',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  
  // Vietnamese colors
  'đen': '#000000',
  'trắng': '#FFFFFF',
  'đỏ': '#FF0000',
  'xanh lá': '#00FF00',
  'xanh dương': '#0000FF',
  'vàng': '#FFFF00',
  'tím': '#800080',
  'cam': '#FFA500',
  'hồng': '#FFC0CB',
  'xám': '#808080',
  'nâu': '#A52A2A',
  'xanh ngọc': '#00FFFF',
  'xanh navy': '#000080',
  'xanh rêu': '#008080',
  'bạc': '#C0C0C0',
  'vàng gold': '#FFD700',
  
  // Common variations
  'xanh cyan': '#00FFFF',
  'xanh mint': '#98FF98',
  'đỏ đậm': '#8B0000',
  'vàng đậm': '#B8860B',
  
  // Gaming-specific colors
  'rgb': '#00FFFF', // Cyan for gaming theme
  'gaming black': '#000000',
  'gaming white': '#FFFFFF',
  'gaming red': '#FF0000',
  'gaming blue': '#0000FF',
  'gaming green': '#00FF00',
  'gaming yellow': '#FFFF00',
  'gaming purple': '#800080',
  'gaming orange': '#FFA500',
  'gaming pink': '#FFC0CB',
  'gaming gray': '#808080',
  'gaming cyan': '#00FFFF',
  'gaming magenta': '#FF00FF',
  'gaming lime': '#00FF00',
  'gaming navy': '#000080',
  'gaming teal': '#008080',
  'gaming silver': '#C0C0C0',
  'gaming gold': '#FFD700'
};

/**
 * Helper function to validate and get color value
 * @param color - The color string (hex, name, or rgb)
 * @returns Valid color value for CSS
 */
export function getColorValue(color: string): string {
  if (!color || typeof color !== 'string') {
    return '#808080'; // Gray as fallback
  }

  const trimmedColor = color.trim();

  // If it's already a hex code, validate and return
  if (trimmedColor.startsWith('#')) {
    // Validate hex format
    if (/^#[0-9A-F]{6}$/i.test(trimmedColor)) {
      return trimmedColor;
    }
    // Try to fix 3-digit hex
    if (/^#[0-9A-F]{3}$/i.test(trimmedColor)) {
      return trimmedColor.split('').map(char => char === '#' ? '#' : char + char).join('');
    }
    // Invalid hex, return fallback
    return '#808080';
  }

  // If it's an RGB format, keep as is
  if (trimmedColor.startsWith('rgb(') || trimmedColor.startsWith('rgba(')) {
    return trimmedColor;
  }

  // If it's a named color, look it up
  const lowerColor = trimmedColor.toLowerCase();
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }

  // Try to find partial matches for Vietnamese colors
  const partialMatches = Object.keys(colorMap).filter(key => 
    key.includes(lowerColor) || lowerColor.includes(key)
  );
  
  if (partialMatches.length > 0) {
    return colorMap[partialMatches[0]];
  }

  // Default fallback to gray
  return '#808080';
}

/**
 * Check if a color is valid
 * @param color - The color string to validate
 * @returns boolean indicating if color is valid
 */
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }

  const trimmedColor = color.trim();

  // Check if it's a valid hex color
  if (trimmedColor.startsWith('#')) {
    return /^#[0-9A-F]{6}$/i.test(trimmedColor) || /^#[0-9A-F]{3}$/i.test(trimmedColor);
  }

  // Check if it's a valid RGB color
  if (trimmedColor.startsWith('rgb(') || trimmedColor.startsWith('rgba(')) {
    return true; // Basic check, could be more thorough
  }

  // Check if it's a known color name
  return colorMap[trimmedColor.toLowerCase()] !== undefined;
}

/**
 * Get color name from hex code
 * @param hexColor - The hex color code
 * @returns Color name or hex code if not found
 */
export function getColorName(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) {
    return hexColor;
  }

  const normalizedHex = hexColor.toUpperCase();
  
  // Find color name by hex value
  for (const [name, hex] of Object.entries(colorMap)) {
    if (hex.toUpperCase() === normalizedHex) {
      return name;
    }
  }

  return hexColor; // Return hex if no name found
}

/**
 * Get all available color names
 * @returns Array of color names
 */
export function getAvailableColors(): string[] {
  return Object.keys(colorMap);
}
