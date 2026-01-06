import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { useSeason } from '../contexts/SeasonContext'
import { supabase } from '../lib/supabase'

interface Athlete {
  fincode: number
  firstname: string
  lastname: string
  birthdate: string
  gender: string
  group_name?: string
}

export function AthletesScreen() {
  const { selectedSeason } = useSeason()
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [groups, setGroups] = useState<{ id: number; group_name: string }[]>([])
  const [filterGroup, setFilterGroup] = useState<number | null>(null)

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchAthletes()
    }
  }, [selectedSeason, filterGroup])

  async function loadGroups() {
    try {
      const { data } = await supabase
        .from('_groups')
        .select('id, group_name')
        .order('group_name')
      
      if (data) setGroups(data)
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  async function fetchAthletes() {
    if (!selectedSeason) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('get_athletes_details', {
          p_season_id: selectedSeason.season_id,
          p_group_id: filterGroup
        })

      if (error) throw error
      setAthletes(data || [])
    } catch (error) {
      console.error('Error fetching athletes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAthletes = athletes.filter(athlete => {
    const fullName = `${athlete.firstname} ${athlete.lastname}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading athletes...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Athletes</Text>
        <Text style={styles.subtitle}>
          {selectedSeason?.season_name || 'Select a season'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search athletes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Group Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filterGroup === null && styles.filterButtonActive]}
            onPress={() => setFilterGroup(null)}
          >
            <Text style={[styles.filterButtonText, filterGroup === null && styles.filterButtonTextActive]}>
              All Groups
            </Text>
          </TouchableOpacity>
          {groups.map(group => (
            <TouchableOpacity
              key={group.id}
              style={[styles.filterButton, filterGroup === group.id && styles.filterButtonActive]}
              onPress={() => setFilterGroup(group.id)}
            >
              <Text style={[styles.filterButtonText, filterGroup === group.id && styles.filterButtonTextActive]}>
                {group.group_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Athletes List */}
      <ScrollView style={styles.content}>
        {filteredAthletes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No athletes found</Text>
          </View>
        ) : (
          filteredAthletes.map(athlete => (
            <View key={athlete.fincode} style={styles.athleteCard}>
              <View style={styles.athleteInfo}>
                <Text style={styles.athleteName}>
                  {athlete.firstname} {athlete.lastname}
                </Text>
                <Text style={styles.athleteDetails}>
                  {athlete.gender} • {calculateAge(athlete.birthdate)} years old
                </Text>
                {athlete.group_name && (
                  <Text style={styles.athleteGroup}>{athlete.group_name}</Text>
                )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
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
  athleteCard: {
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
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  athleteDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  athleteGroup: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
})
