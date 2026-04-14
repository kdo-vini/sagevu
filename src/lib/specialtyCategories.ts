export const SPECIALTY_CATEGORIES = [
  'Personal Finance & Investing',
  'Mental Health & CBT',
  'Fitness & Nutrition',
  'Legal Guidance',
  'Digital Marketing & Growth',
  'Software Engineering & Architecture',
  'Career Coaching & Job Search',
  'Business Strategy & Entrepreneurship',
  'Relationships & Communication',
  'Data Science & AI/ML',
  'Productivity & Time Management',
  'Parenting & Family',
  'Leadership & Management',
  'Real Estate & Property',
  'Creative Writing & Storytelling',
] as const

export type SpecialtyCategory = typeof SPECIALTY_CATEGORIES[number]
