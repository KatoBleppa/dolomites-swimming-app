import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useSeason } from '../contexts/SeasonContext'
import { supabase } from '../lib/supabase'

interface Race {
  meet_id: number
  meet_name: string
  race_date: string
  location: string
  meet_course: number
}

export function RacesScreen() {
  const { selectedSeason } = useSeason()
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (selectedSeason) {
      fetchRaces()
    }
  }, [selectedSeason, filterType])

  async function fetchRaces() {
    if (!selectedSeason) return

    setLoading(true)
    try {
      let query = supabase
        .from('meets')
        .select('meet_id, meet_name, min_date, place, meet_course')
        .gte('min_date', selectedSeason.season_start)
        .lte('max_date', selectedSeason.season_end)
        .order('min_date', { ascending: false })

      if (filterType === '25') {
        query = query.eq('meet_course', 25)
      } else if (filterType === '50') {
        query = query.eq('meet_course', 50)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match interface
      const transformedData = (data || []).map((meet: any) => ({
        meet_id: meet.meet_id,
        meet_name: meet.meet_name,
        race_date: meet.min_date,
        location: meet.place,
        meet_course: meet.meet_course
      }))
      
      setRaces(transformedData)
    } catch (error) {
      console.error('Error fetching races:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading races...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Races</Text>
        <Text style={styles.subtitle}>
          {selectedSeason?.season_name || 'Select a season'}
        </Text>
      </View>

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {[{value: 'all', label: 'All Meets'}, {value: '25', label: 'Short Course (25m)'}, {value: '50', label: 'Long Course (50m)'}].map(type => (
            <TouchableOpacity
              key={type.value}
              style={[styles.filterButton, filterType === type.value && styles.filterButtonActive]}
              onPress={() => setFilterType(type.value)}
            >
              <Text style={[styles.filterButtonText, filterType === type.value && styles.filterButtonTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Races List */}
      <ScrollView style={styles.content}>
        {races.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No races found</Text>
          </View>
        ) : (
          races.map(race => (
            <View key={race.meet_id} style={styles.raceCard}>
              <View style={styles.raceHeader}>
                <Text style={styles.raceName}>{race.meet_name}</Text>
                <View style={styles.raceTypeBadge}>
                  <Text style={styles.raceTypeText}>{race.meet_course === 25 ? 'SC' : 'LC'}</Text>
                </View>
              </View>
              <View style={styles.raceDetails}>
                <Text style={styles.raceDate}>📅 {formatDate(race.race_date)}</Text>
                <Text style={styles.raceLocation}>📍 {race.location}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#475569',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  raceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  raceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  raceName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  raceTypeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  raceTypeText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  raceDetails: {
    marginTop: 8,
  },
  raceDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  raceLocation: {
    fontSize: 14,
    color: '#64748b',
  },
})
