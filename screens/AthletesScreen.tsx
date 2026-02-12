import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Image, Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSeason } from '../contexts/SeasonContext'
import { supabase, supabaseUrl } from '../lib/supabase'

interface Athlete {
  fincode: number
  firstname: string
  lastname: string
  birthdate: string
  gender: string
  group_name?: string
  email?: string
  phone?: string
}

export function AthletesScreen() {
  const { selectedSeason } = useSeason()
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [groups, setGroups] = useState<{ id: number; group_name: string }[]>([])
  const [filterGroup, setFilterGroup] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)

  // Helper function to generate Supabase storage URL for athlete portraits
  const getPortraitUrl = (fincode: number): string => {
    return `${supabaseUrl}/storage/v1/object/public/PortraitPics/${fincode}.jpg`
  }

  // Handle image load errors
  const handleImageError = (fincode: number) => {
    setImageErrors(prev => new Set(prev).add(fincode))
  }

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
      
      if (data) {
        setGroups(data)

        if (filterGroup === null) {
          const defaultGroup = data.find(group => group.group_name === 'ASS')
          if (defaultGroup) setFilterGroup(defaultGroup.id)
        }
      }
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
    const email = (athlete.email || '').toLowerCase()
    const phone = (athlete.phone || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || email.includes(query) || phone.includes(query)
  })

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
        <Text style={styles.subtitle}>
          {selectedSeason?.season_name || 'Select a season in Settings'}
        </Text>
      </View>

      {/* Group Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
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
          filteredAthletes.map(athlete => {
            const shouldLoadImage = !imageErrors.has(athlete.fincode)
            const photoUrl = getPortraitUrl(athlete.fincode)
            
            return (
              <TouchableOpacity
                key={athlete.fincode}
                style={styles.athleteCard}
                onPress={() => setSelectedAthlete(athlete)}
                activeOpacity={0.85}
              >
                <View style={styles.athleteInfo}>
                  <View style={styles.athleteNameRow}>
                    <Text style={styles.athleteName}>
                      {athlete.firstname} {athlete.lastname}
                    </Text>
                    <Ionicons
                      name={athlete.gender === 'M' ? 'male' : 'female'}
                      size={18}
                      color={athlete.gender === 'M' ? '#2563eb' : '#db2777'}
                      style={styles.genderIcon}
                    />
                  </View>
                  {athlete.email ? (
                    <View style={styles.athleteContactRow}>
                      <Ionicons name="mail" size={16} color="#64748b" style={styles.contactIcon} />
                      <Text style={styles.athleteContact}>{athlete.email}</Text>
                    </View>
                  ) : null}
                  {athlete.phone ? (
                    <View style={styles.athleteContactRow}>
                      <Ionicons name="call" size={16} color="#64748b" style={styles.contactIcon} />
                      <Text style={styles.athleteContact}>{athlete.phone}</Text>
                    </View>
                  ) : null}

                </View>
                {shouldLoadImage ? (
                  <Image
                    source={{ uri: photoUrl }}
                    style={styles.athletePortrait}
                    onError={(error: any) => {
                      const errorMsg = error.nativeEvent?.error || ''
                      if (
                        errorMsg.includes('404') ||
                        errorMsg.includes('Not Found') ||
                        errorMsg.includes('400') ||
                        errorMsg.includes('Bad Request') ||
                        errorMsg.includes('Unexpected HTTP code')
                      ) {
                        console.log(
                          `Portrait not found in Supabase storage for athlete ${athlete.firstname} ${athlete.lastname} (fincode: ${athlete.fincode}). Using default avatar.`
                        )
                      } else {
                        console.error(
                          `Failed to load portrait for athlete ${athlete.firstname} ${athlete.lastname}:`,
                          'URL:',
                          photoUrl,
                          'Error:',
                          error.nativeEvent
                        )
                      }
                      handleImageError(athlete.fincode)
                    }}
                  />
                ) : (
                  <Image
                    source={require('../assets/images/avatar.jpg')}
                    style={styles.athletePortrait}
                  />
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      <Modal
        visible={selectedAthlete !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAthlete(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedAthlete(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            {selectedAthlete && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    {imageErrors.has(selectedAthlete.fincode) ? (
                      <Image
                        source={require('../assets/images/avatar.jpg')}
                        style={styles.modalPortrait}
                      />
                    ) : (
                      <Image
                        source={{ uri: getPortraitUrl(selectedAthlete.fincode) }}
                        style={styles.modalPortrait}
                        onError={() => handleImageError(selectedAthlete.fincode)}
                      />
                    )}
                    <View style={styles.modalTitleBlock}>
                      <Text style={styles.modalTitle}>
                        {selectedAthlete.firstname} {selectedAthlete.lastname}
                      </Text>
                      <Text style={styles.modalSubtitle}>FIN Code: {selectedAthlete.fincode}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAthlete(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Gender</Text>
                    <Text style={styles.modalValue}>
                      {selectedAthlete.gender === 'M' ? 'Male' : 'Female'}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Birth Date</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedAthlete.birthdate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Email</Text>
                    <Text style={styles.modalValue}>{selectedAthlete.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Phone</Text>
                    <Text style={styles.modalValue}>{selectedAthlete.phone || 'N/A'}</Text>
                  </View>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  athleteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  genderIcon: {
    marginBottom: 4,
  },
  athleteDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  athleteContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  contactIcon: {
    marginTop: 1,
  },
  athleteContact: {
    fontSize: 13,
    color: '#64748b',
  },
  athleteGroup: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  athletePortrait: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalPortrait: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  modalClose: {
    fontSize: 20,
    color: '#64748b',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalBody: {
    gap: 10,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 14,
    color: '#1e293b',
  },
  athletePortraitPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 16,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  athletePortraitInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
})
