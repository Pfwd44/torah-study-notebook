export interface Entry {
  id: string
  category: string
  subcategory: string
  content: string
  references?: string
  tags: string[]
  createdAt: string
}

export interface Category {
  name: string
  subcategories: string[]
}
