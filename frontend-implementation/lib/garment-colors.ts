/**
 * Garment Color Database for Style Variants
 * Maps color names to their standard codes and hex values
 */

export interface ColorOption {
  name: string;
  hex: string;
  pantone?: string;
  category: string;
}

export const GARMENT_COLORS: ColorOption[] = [
  // Reds
  { name: "Red", hex: "#FF0000", pantone: "Red 032 C", category: "Red" },
  { name: "Dark Red", hex: "#8B0000", pantone: "187 C", category: "Red" },
  { name: "Crimson", hex: "#DC143C", pantone: "199 C", category: "Red" },
  { name: "Maroon", hex: "#800000", pantone: "209 C", category: "Red" },
  { name: "Burgundy", hex: "#900020", pantone: "7427 C", category: "Red" },
  { name: "Cherry Red", hex: "#D2042D", pantone: "1795 C", category: "Red" },

  // Blues
  { name: "Navy Blue", hex: "#001F3F", pantone: "19-4052", category: "Blue" },
  { name: "Royal Blue", hex: "#4169E1", pantone: "286 C", category: "Blue" },
  { name: "Sky Blue", hex: "#87CEEB", pantone: "278 C", category: "Blue" },
  { name: "Light Blue", hex: "#ADD8E6", pantone: "283 C", category: "Blue" },
  { name: "Turquoise", hex: "#40E0D0", pantone: "3252 C", category: "Blue" },
  { name: "Teal", hex: "#008080", pantone: "3145 C", category: "Blue" },
  { name: "Cyan", hex: "#00FFFF", pantone: "311 C", category: "Blue" },
  { name: "Baby Blue", hex: "#89CFF0", pantone: "290 C", category: "Blue" },

  // Greens
  { name: "Green", hex: "#008000", pantone: "355 C", category: "Green" },
  { name: "Dark Green", hex: "#006400", pantone: "3425 C", category: "Green" },
  { name: "Lime Green", hex: "#32CD32", pantone: "374 C", category: "Green" },
  { name: "Olive Green", hex: "#808000", pantone: "5825 C", category: "Green" },
  { name: "Forest Green", hex: "#228B22", pantone: "7483 C", category: "Green" },
  { name: "Mint Green", hex: "#98FF98", pantone: "351 C", category: "Green" },
  { name: "Emerald", hex: "#50C878", pantone: "3405 C", category: "Green" },

  // Yellows & Oranges
  { name: "Yellow", hex: "#FFFF00", pantone: "Yellow C", category: "Yellow" },
  { name: "Gold", hex: "#FFD700", pantone: "7406 C", category: "Yellow" },
  { name: "Mustard", hex: "#FFDB58", pantone: "7563 C", category: "Yellow" },
  { name: "Lemon", hex: "#FFF700", pantone: "102 C", category: "Yellow" },
  { name: "Orange", hex: "#FFA500", pantone: "021 C", category: "Orange" },
  { name: "Dark Orange", hex: "#FF8C00", pantone: "1585 C", category: "Orange" },
  { name: "Coral", hex: "#FF7F50", pantone: "16-1546", category: "Orange" },
  { name: "Peach", hex: "#FFDAB9", pantone: "162 C", category: "Orange" },

  // Purples & Pinks
  { name: "Purple", hex: "#800080", pantone: "267 C", category: "Purple" },
  { name: "Violet", hex: "#8F00FF", pantone: "2665 C", category: "Purple" },
  { name: "Lavender", hex: "#E6E6FA", pantone: "9344 C", category: "Purple" },
  { name: "Magenta", hex: "#FF00FF", pantone: "Process Magenta", category: "Pink" },
  { name: "Pink", hex: "#FFC0CB", pantone: "1895 C", category: "Pink" },
  { name: "Hot Pink", hex: "#FF69B4", pantone: "806 C", category: "Pink" },
  { name: "Rose", hex: "#FF007F", pantone: "213 C", category: "Pink" },
  { name: "Fuchsia", hex: "#FF00FF", pantone: "226 C", category: "Pink" },

  // Neutrals
  { name: "White", hex: "#FFFFFF", pantone: "White", category: "Neutral" },
  { name: "Black", hex: "#000000", pantone: "Black C", category: "Neutral" },
  { name: "Gray", hex: "#808080", pantone: "Cool Gray 7 C", category: "Neutral" },
  { name: "Light Gray", hex: "#D3D3D3", pantone: "Cool Gray 3 C", category: "Neutral" },
  { name: "Dark Gray", hex: "#A9A9A9", pantone: "Cool Gray 10 C", category: "Neutral" },
  { name: "Charcoal", hex: "#36454F", pantone: "426 C", category: "Neutral" },
  { name: "Silver", hex: "#C0C0C0", pantone: "877 C", category: "Neutral" },

  // Browns & Beiges
  { name: "Brown", hex: "#A52A2A", pantone: "476 C", category: "Brown" },
  { name: "Tan", hex: "#D2B48C", pantone: "467 C", category: "Brown" },
  { name: "Beige", hex: "#F5F5DC", pantone: "7527 C", category: "Beige" },
  { name: "Khaki", hex: "#F0E68C", pantone: "7502 C", category: "Beige" },
  { name: "Cream", hex: "#FFFDD0", pantone: "9180 C", category: "Beige" },
  { name: "Ivory", hex: "#FFFFF0", pantone: "11-0602", category: "Beige" },
  { name: "Chocolate", hex: "#7B3F00", pantone: "1545 C", category: "Brown" },
  { name: "Coffee", hex: "#6F4E37", pantone: "7533 C", category: "Brown" },

  // Special Colors
  { name: "Heather Gray", hex: "#B7B8B6", pantone: "Cool Gray 5 C", category: "Neutral" },
  { name: "Ash Gray", hex: "#B2BEB5", pantone: "Cool Gray 4 C", category: "Neutral" },
  { name: "Denim Blue", hex: "#1560BD", pantone: "7686 C", category: "Blue" },
  { name: "Wine", hex: "#722F37", pantone: "506 C", category: "Red" },
];

export const GARMENT_SIZES = [
  { value: "XXS", label: "XXS (Extra Extra Small)" },
  { value: "XS", label: "XS (Extra Small)" },
  { value: "S", label: "S (Small)" },
  { value: "M", label: "M (Medium)" },
  { value: "L", label: "L (Large)" },
  { value: "XL", label: "XL (Extra Large)" },
  { value: "XXL", label: "XXL (Extra Extra Large)" },
  { value: "XXXL", label: "XXXL (3XL)" },
  { value: "4XL", label: "4XL" },
  { value: "5XL", label: "5XL" },
];

/**
 * Get all unique color categories
 */
export function getColorCategories(): string[] {
  const categories = new Set(GARMENT_COLORS.map(c => c.category));
  return Array.from(categories).sort();
}

/**
 * Get colors by category
 */
export function getColorsByCategory(category: string): ColorOption[] {
  return GARMENT_COLORS.filter(c => c.category === category);
}

/**
 * Search colors by name
 */
export function searchColors(query: string): ColorOption[] {
  const lowerQuery = query.toLowerCase();
  return GARMENT_COLORS.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.pantone?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get color codes for a specific color name
 * Returns the exact color and similar shades from the same category
 */
export function getColorCodes(colorName: string): ColorOption[] {
  const selectedColor = GARMENT_COLORS.find(
    c => c.name.toLowerCase() === colorName.toLowerCase()
  );

  if (!selectedColor) return [];

  // Return all colors from the same category to show different shades
  return GARMENT_COLORS.filter(c => c.category === selectedColor.category);
}
