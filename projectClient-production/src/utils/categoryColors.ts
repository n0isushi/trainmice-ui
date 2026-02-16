/**
 * Pastel colors for each course category
 * Each category gets a unique pastel color scheme
 */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Human Resources': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Soft Skills & Administration': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  'Leadership & Management': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Finance & Accounts': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'Property & Real Estate': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Buildings & Facilities': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'IT & Software': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Conference': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  // Keeping some old ones just in case
  'Safety': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Others': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

/**
 * Get pastel color for a category
 */
export function getCategoryColor(category: string | null | undefined) {
  if (!category) {
    return CATEGORY_COLORS['Others'];
  }
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Others'];
}

