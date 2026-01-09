export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          property_types: string[]
          bedrooms: number
          bathrooms: number
          parking: number
          budget_min: number
          budget_max: number
          locations: string[]
          preferences: string[] | null
          status: 'new' | 'contacted' | 'interested' | 'closed' | 'lost'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          property_types: string[]
          bedrooms: number
          bathrooms: number
          parking: number
          budget_min: number
          budget_max: number
          locations: string[]
          preferences?: string[] | null
          status?: 'new' | 'contacted' | 'interested' | 'closed' | 'lost'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          property_types?: string[]
          bedrooms?: number
          bathrooms?: number
          parking?: number
          budget_min?: number
          budget_max?: number
          locations?: string[]
          preferences?: string[] | null
          status?: 'new' | 'contacted' | 'interested' | 'closed' | 'lost'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          wasi_url: string
          property_type: 'casa' | 'apartamento' | 'townhouse' | 'terreno'
          bedrooms: number
          bathrooms: number
          parking: number
          price: number
          location: string
          address: string | null
          description: string | null
          images: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          wasi_url: string
          property_type: 'casa' | 'apartamento' | 'townhouse' | 'terreno'
          bedrooms: number
          bathrooms: number
          parking: number
          price: number
          location: string
          address?: string | null
          description?: string | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          wasi_url?: string
          property_type?: 'casa' | 'apartamento' | 'townhouse' | 'terreno'
          bedrooms?: number
          bathrooms?: number
          parking?: number
          price?: number
          location?: string
          address?: string | null
          description?: string | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      client_properties: {
        Row: {
          id: string
          client_id: string
          property_id: string
          sent_at: string
          viewed_at: string | null
          status: 'sent' | 'viewed' | 'interested' | 'not_interested'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id: string
          sent_at?: string
          viewed_at?: string | null
          status?: 'sent' | 'viewed' | 'interested' | 'not_interested'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          sent_at?: string
          viewed_at?: string | null
          status?: 'sent' | 'viewed' | 'interested' | 'not_interested'
          notes?: string | null
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          client_id: string
          contact_type: 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting' | 'other'
          notes: string
          contact_date: string
          next_follow_up: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          contact_type: 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting' | 'other'
          notes: string
          contact_date?: string
          next_follow_up?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          contact_type?: 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting' | 'other'
          notes?: string
          contact_date?: string
          next_follow_up?: string | null
          created_at?: string
        }
      }
    }
  }
}



