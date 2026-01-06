import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface Season {
  season_id: number
  season_name: string
  season_start: string
  season_end: string
}

interface SeasonContextType {
  selectedSeason: Season | null
  setSelectedSeason: (season: Season | null) => void
  seasons: Season[]
  loading: boolean
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined)

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeasons()
  }, [])

  async function loadSeasons() {
    try {
      const { data, error } = await supabase
        .from('_seasons')
        .select('*')
        .order('season_start', { ascending: false })

      if (error) throw error

      setSeasons(data || [])
      
      // Set most recent season as default
      if (data && data.length > 0) {
        setSelectedSeason(data[0])
      }
    } catch (error) {
      console.error('Error loading seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SeasonContext.Provider value={{ selectedSeason, setSelectedSeason, seasons, loading }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const context = useContext(SeasonContext)
  if (context === undefined) {
    throw new Error('useSeason must be used within a SeasonProvider')
  }
  return context
}