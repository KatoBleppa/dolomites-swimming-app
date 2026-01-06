import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, RefreshControl, TextInput, Alert } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSeason } from '../contexts/SeasonContext'
import { supabase } from '../lib/supabase'

interface Training {
  id: number
  date: string
  time: string
  type: string
  group_name: string
  volume?: number
  description?: string
  location?: string
  sess_group_id?: number
}

interface Group {
  id: number
  group_name: string
}

interface Athlete {
  fincode: number
  firstname: string
  lastname: string
  status?: number // 0=Present, 1=Late, 2=Justified, 3=Absent
}

export function TrainingsScreen() {
  const { selectedSeason } = useSeason()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()))
  const [selectedSession, setSelectedSession] = useState<Training | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'Swim',
    sess_group_id: 0,
    volume: '',
    location: '',
    description: ''
  })

  useEffect(() => {
    if (selectedSeason) {
      fetchTrainings()
      loadGroups()
    }
  }, [selectedSeason, currentWeekStart])

  function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  function getWeekDays(startDate: Date): Date[] {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  function goToPreviousWeek() {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  function goToNextWeek() {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  function goToCurrentWeek() {
    setCurrentWeekStart(getMonday(new Date()))
  }

  async function onRefresh() {
    setRefreshing(true)
    await fetchTrainings()
    setRefreshing(false)
  }

  async function fetchTrainings() {
    if (!selectedSeason) return

    setLoading(true)
    try {
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const query = supabase
        .from('sessions')
        .select(`
          sess_id,
          date,
          time,
          type,
          volume,
          description,
          location,
          sess_group_id,
          _groups!sessions_sess_group_id_fkey (
            group_name
          )
        `)
        .gte('date', currentWeekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match interface
      const transformedData = (data || []).map((session: any) => ({
        id: session.sess_id,
        date: session.date,
        time: session.time,
        type: session.type,
        volume: session.volume,
        description: session.description,
        location: session.location,
        group_name: session._groups?.group_name || 'Unknown',
        sess_group_id: session.sess_group_id
      }))
      
      setTrainings(transformedData)
    } catch (error) {
      console.error('Error fetching trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadGroups() {
    try {
      const { data, error } = await supabase
        .from('_groups')
        .select('id, group_name')
        .order('group_name')
      
      if (error) throw error
      setGroups(data || [])
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  function openAddModal() {
    setIsEditing(false)
    setFormData({
      date: currentWeekStart.toISOString().split('T')[0],
      time: '18:00',
      type: 'Swim',
      sess_group_id: groups[0]?.id || 0,
      volume: '',
      location: '',
      description: ''
    })
    setFormModalVisible(true)
  }

  function openEditModal() {
    if (!selectedSession) return
    setIsEditing(true)
    setFormData({
      date: selectedSession.date,
      time: selectedSession.time,
      type: selectedSession.type,
      sess_group_id: selectedSession.sess_group_id || 0,
      volume: selectedSession.volume?.toString() || '',
      location: selectedSession.location || '',
      description: selectedSession.description || ''
    })
    setModalVisible(false)
    setFormModalVisible(true)
  }

  async function handleSaveSession() {
    try {
      const sessionData = {
        date: formData.date,
        time: formData.time || null,
        type: formData.type,
        sess_group_id: formData.sess_group_id || null,
        volume: formData.volume ? parseInt(formData.volume) : null,
        location: formData.location || null,
        description: formData.description || null
      }

      if (isEditing && selectedSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('sess_id', selectedSession.id)
        
        if (error) throw error
        Alert.alert('Success', 'Session updated successfully')
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([sessionData])
        
        if (error) throw error
        Alert.alert('Success', 'Session created successfully')
      }

      setFormModalVisible(false)
      fetchTrainings()
    } catch (error: any) {
      console.error('Error saving session:', error)
      Alert.alert('Error', error.message || 'Failed to save session')
    }
  }

  async function handleDeleteSession() {
    if (!selectedSession) return

    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('sess_id', selectedSession.id)
              
              if (error) throw error
              Alert.alert('Success', 'Session deleted successfully')
              setModalVisible(false)
              fetchTrainings()
            } catch (error: any) {
              console.error('Error deleting session:', error)
              Alert.alert('Error', error.message || 'Failed to delete session')
            }
          }
        }
      ]
    )
  }

  async function openAttendanceModal() {
    if (!selectedSession) return
    
    setModalVisible(false)
    setAttendanceModalVisible(true)
    setAttendanceLoading(true)
    
    try {
      // Get athletes from the session's group and season using database function
      const { data: rosterData, error: rosterError } = await supabase
        .rpc('get_athletes_details', {
          p_season_id: selectedSeason?.season_id,
          p_group_id: selectedSession.sess_group_id
        })
      
      if (rosterError) throw rosterError

      // Get existing attendance for this session - map by fincode
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('fincode, status_code')
        .eq('sess_id', selectedSession.id)
      
      if (attendanceError) throw attendanceError

      const attendanceMap = new Map(attendanceData?.map(a => [a.fincode, a.status_code]) || [])
      
      const athletesList: Athlete[] = (rosterData || []).map((r: any) => ({
        fincode: r.fincode,
        firstname: r.firstname,
        lastname: r.lastname,
        status: attendanceMap.get(r.fincode)
      }))
      
      setAthletes(athletesList.sort((a, b) => a.lastname.localeCompare(b.lastname)))
    } catch (error: any) {
      console.error('Error loading attendance:', error)
      Alert.alert('Error', error.message || 'Failed to load athletes')
    } finally {
      setAttendanceLoading(false)
    }
  }

  function toggleAttendance(fincode: number) {
    setAthletes(prev => prev.map(a => {
      if (a.fincode === fincode) {
        // Cycle through states: undefined -> 0 (Present) -> 1 (Late) -> 2 (Justified) -> 3 (Absent) -> undefined
        const nextStatus = a.status === undefined ? 0 : a.status === 3 ? undefined : a.status + 1
        return { ...a, status: nextStatus }
      }
      return a
    }))
  }

  async function saveAttendance() {
    if (!selectedSession) return
    
    try {
      // Delete all existing attendance for this session
      await supabase
        .from('attendance')
        .delete()
        .eq('sess_id', selectedSession.id)
      
      // Insert new attendance records for athletes with a status
      const athletesWithStatus = athletes.filter(a => a.status !== undefined)
      if (athletesWithStatus.length > 0) {
        const attendanceRecords = athletesWithStatus.map(a => ({
          sess_id: selectedSession.id,
          fincode: a.fincode,
          status_code: a.status
        }))
        
        const { error } = await supabase
          .from('attendance')
          .insert(attendanceRecords)
        
        if (error) throw error
      }
      
      Alert.alert('Success', 'Attendance saved successfully')
      setAttendanceModalVisible(false)
    } catch (error: any) {
      console.error('Error saving attendance:', error)
      Alert.alert('Error', error.message || 'Failed to save attendance')
    }
  }

  function getSessionsForDate(date: Date): Training[] {
    const dateStr = date.toISOString().split('T')[0]
    return trainings.filter(t => t.date === dateStr)
  }

  function openSessionModal(session: Training) {
    setSelectedSession(session)
    setModalVisible(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatWeekRange = () => {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const weekDays = getWeekDays(currentWeekStart)
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading trainings...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.weekRangeContainer}>
          <Text style={styles.weekRangeText}>{formatWeekRange()}</Text>
          <TouchableOpacity onPress={goToCurrentWeek} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView 
        style={styles.calendarContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.calendarGrid}>
          {weekDays.map((day, index) => {
            const sessionsForDay = getSessionsForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <View key={index} style={styles.dayColumn}>
                <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
                  <Text style={[styles.dayName, isToday && styles.todayText]}>
                    {dayNames[index]}
                  </Text>
                  <Text style={[styles.dayDate, isToday && styles.todayText]}>
                    {day.getDate()}
                  </Text>
                </View>
                <View style={styles.sessionsContainer}>
                  {sessionsForDay.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.sessionIcon,
                        session.type === 'Gym' ? styles.gymSession : styles.swimSession
                      ]}
                      onPress={() => openSessionModal(session)}
                    >
                      <MaterialCommunityIcons
                        name={session.type === 'Gym' ? 'dumbbell' : 'waves'}
                        size={24}
                        color="#fff"
                      />
                      {session.time && (
                        <Text style={styles.sessionTime} numberOfLines={1}>
                          {String(session.time).substring(0, 5)}
                        </Text>
                      )}
                      {session.group_name && (
                        <Text style={styles.sessionGroup} numberOfLines={1}>
                          {session.group_name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* Session Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSession && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Training Session</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={28} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                  <View style={[
                    styles.modalTypeBadge,
                    selectedSession.type === 'Gym' ? styles.gymBadge : styles.swimBadge
                  ]}>
                    <MaterialCommunityIcons
                      name={selectedSession.type === 'Gym' ? 'dumbbell' : 'waves'}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.modalTypeBadgeText}>{selectedSession.type}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>{formatDate(selectedSession.date)}</Text>
                  </View>

                  {selectedSession.time && (
                    <View style={styles.modalRow}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                      <Text style={styles.modalLabel}>Time:</Text>
                      <Text style={styles.modalValue}>{String(selectedSession.time)}</Text>
                    </View>
                  )}

                  {selectedSession.group_name && (
                    <View style={styles.modalRow}>
                      <MaterialCommunityIcons name="account-group" size={20} color="#666" />
                      <Text style={styles.modalLabel}>Group:</Text>
                      <Text style={styles.modalValue}>{selectedSession.group_name}</Text>
                    </View>
                  )}

                  {selectedSession.volume && (
                    <View style={styles.modalRow}>
                      <MaterialCommunityIcons name="gauge" size={20} color="#666" />
                      <Text style={styles.modalLabel}>Volume:</Text>
                      <Text style={styles.modalValue}>{selectedSession.volume}m</Text>
                    </View>
                  )}

                  {selectedSession.location && (
                    <View style={styles.modalRow}>
                      <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                      <Text style={styles.modalLabel}>Location:</Text>
                      <Text style={styles.modalValue}>{selectedSession.location}</Text>
                    </View>
                  )}

                  {selectedSession.description && (
                    <View style={styles.modalDescriptionContainer}>
                      <Text style={styles.modalLabel}>Description:</Text>
                      <Text style={styles.modalDescription}>{selectedSession.description}</Text>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.attendanceButton} onPress={openAttendanceModal}>
                      <MaterialCommunityIcons name="clipboard-check" size={20} color="#fff" />
                      <Text style={styles.attendanceButtonText}>Att</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                      <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSession}>
                      <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Form Modal for Add/Edit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={formModalVisible}
        onRequestClose={() => setFormModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Session' : 'New Session'}</Text>
              <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({...formData, date: text})}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={formData.time}
                  onChangeText={(text) => setFormData({...formData, time: text})}
                  placeholder="HH:MM"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'Swim' && styles.typeButtonActive]}
                    onPress={() => setFormData({...formData, type: 'Swim'})}
                  >
                    <Text style={[styles.typeButtonText, formData.type === 'Swim' && styles.typeButtonTextActive]}>Swim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'Gym' && styles.typeButtonActive]}
                    onPress={() => setFormData({...formData, type: 'Gym'})}
                  >
                    <Text style={[styles.typeButtonText, formData.type === 'Gym' && styles.typeButtonTextActive]}>Gym</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
                  {groups.map(group => (
                    <TouchableOpacity
                      key={group.id}
                      style={[styles.groupButton, formData.sess_group_id === group.id && styles.groupButtonActive]}
                      onPress={() => setFormData({...formData, sess_group_id: group.id})}
                    >
                      <Text style={[styles.groupButtonText, formData.sess_group_id === group.id && styles.groupButtonTextActive]}>
                        {group.group_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Volume (meters)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.volume}
                  onChangeText={(text) => setFormData({...formData, volume: text})}
                  placeholder="e.g., 3000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => setFormData({...formData, location: text})}
                  placeholder="Pool or gym location"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  placeholder="Session notes..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSession}>
                <Text style={styles.saveButtonText}>{isEditing ? 'Update Session' : 'Create Session'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={attendanceModalVisible}
        onRequestClose={() => setAttendanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Attendance</Text>
              <TouchableOpacity onPress={() => setAttendanceModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            {attendanceLoading ? (
              <View style={styles.attendanceLoading}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.loadingText}>Loading athletes...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                <Text style={styles.attendanceInfo}>
                  Tap to cycle: Green (Present) → Yellow (Late) → Blue (Justified) → Red (Absent) → None
                </Text>
                {athletes.map((athlete) => {
                  const statusColors = [
                    { bg: '#dcfce7', text: '#166534', icon: '#16a34a' }, // 0: Present - green
                    { bg: '#fef9c3', text: '#854d0e', icon: '#ca8a04' }, // 1: Late - yellow
                    { bg: '#dbeafe', text: '#1e3a8a', icon: '#3b82f6' }, // 2: Justified - blue
                    { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626' }  // 3: Absent - red
                  ]
                  const statusLabels = ['Present', 'Late', 'Justified', 'Absent']
                  const currentStatus = athlete.status !== undefined ? statusColors[athlete.status] : null
                  
                  return (
                    <TouchableOpacity
                      key={athlete.fincode}
                      style={[
                        styles.athleteRow,
                        currentStatus && { backgroundColor: currentStatus.bg }
                      ]}
                      onPress={() => toggleAttendance(athlete.fincode)}
                    >
                      <MaterialCommunityIcons
                        name="circle"
                        size={24}
                        color={currentStatus?.icon || '#cbd5e1'}
                      />
                      <View style={styles.athleteInfo}>
                        <Text style={[
                          styles.athleteName,
                          currentStatus && { color: currentStatus.text }
                        ]}>
                          {athlete.lastname}, {athlete.firstname}
                        </Text>
                        {athlete.status !== undefined && (
                          <Text style={[
                            styles.athleteStatus,
                            { color: currentStatus?.text }
                          ]}>
                            {statusLabels[athlete.status]}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )
                })}
                
                <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
                  <Text style={styles.saveButtonText}>Save Attendance</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
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
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navButton: {
    padding: 8,
  },
  weekRangeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  todayButton: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#0284c7',
    borderRadius: 12,
  },
  todayButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    padding: 8,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 2,
  },
  dayHeader: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  todayHeader: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  todayText: {
    color: '#fff',
  },
  sessionsContainer: {
    gap: 8,
  },
  sessionIcon: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gymSession: {
    backgroundColor: '#dc2626',
  },
  swimSession: {
    backgroundColor: '#0284c7',
  },
  sessionTime: {
    fontSize: 8,
    color: '#fff',
    marginTop: 2,
    fontWeight: '600',
  },
  sessionGroup: {
    fontSize: 7,
    color: '#fff',
    marginTop: 1,
    fontWeight: '500',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
    paddingBottom: 30,
  },
  modalTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  gymBadge: {
    backgroundColor: '#dc2626',
  },
  swimBadge: {
    backgroundColor: '#0284c7',
  },
  modalTypeBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  modalDescriptionContainer: {
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  attendanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  groupScroll: {
    flexDirection: 'row',
  },
  groupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  groupButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  groupButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  groupButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  attendanceLoading: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    gap: 12,
  },
  athleteInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  athleteName: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  athleteStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})

