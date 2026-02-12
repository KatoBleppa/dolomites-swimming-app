import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { useSeason } from '../contexts/SeasonContext'

type StatState = {
  athletes: number
  meets: number
  swimSessions: number
  gymSessions: number
  results: number
  loading: boolean
}

export function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { selectedSeason } = useSeason()
  const [stats, setStats] = useState<StatState>({
    athletes: 0,
    meets: 0,
    swimSessions: 0,
    gymSessions: 0,
    results: 0,
    loading: true,
  })
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    if (selectedSeason) {
      fetchStats()
    } else {
      setStats(prev => ({ ...prev, loading: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason])

  async function fetchStats() {
    if (!selectedSeason) return

    setStats(prev => ({ ...prev, loading: true }))

    try {
      const { data: rosterData } = await supabase
        .from('roster')
        .select('fincode')
        .eq('season_id', selectedSeason.season_id)

      const fincodes = rosterData?.map(r => r.fincode) || []
      const athletesCount = fincodes.length

      const { count: meetsCount } = await supabase
        .from('meets')
        .select('meet_id', { count: 'exact', head: true })
        .gte('min_date', selectedSeason.season_start)
        .lte('max_date', selectedSeason.season_end)

      const { count: swimSessionsCount } = await supabase
        .from('sessions')
        .select('sess_id', { count: 'exact', head: true })
        .gte('date', selectedSeason.season_start)
        .lte('date', selectedSeason.season_end)
        .eq('type', 'Swim')

      const { count: gymSessionsCount } = await supabase
        .from('sessions')
        .select('sess_id', { count: 'exact', head: true })
        .gte('date', selectedSeason.season_start)
        .lte('date', selectedSeason.season_end)
        .eq('type', 'Gym')

      const { data: seasonMeets } = await supabase
        .from('meets')
        .select('meet_id')
        .gte('min_date', selectedSeason.season_start)
        .lte('max_date', selectedSeason.season_end)

      const meetIds = seasonMeets?.map(m => m.meet_id) || []

      const { count: resultsCount } = await supabase
        .from('results')
        .select('res_id', { count: 'exact', head: true })
        .in('fincode', fincodes.length > 0 ? fincodes : [-1])
        .in('meet_id', meetIds.length > 0 ? meetIds : [-1])

      setStats({
        athletes: athletesCount,
        meets: meetsCount || 0,
        swimSessions: swimSessionsCount || 0,
        gymSessions: gymSessionsCount || 0,
        results: resultsCount || 0,
        loading: false,
      })
      setLastSync(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const dashboardCards = useMemo(() => (
    [
      {
        title: 'Athletes',
        description: 'Registered swimmers',
        icon: 'account-group',
        target: 'Athletes',
        color: '#3b82f6',
        count: stats.athletes,
      },
      {
        title: 'Meets',
        description: 'Competitions & events',
        icon: 'trophy',
        target: 'Meets',
        color: '#22c55e',
        count: stats.meets,
      },
      {
        title: 'Swim Sessions',
        description: 'Swimming trainings',
        icon: 'waves',
        target: 'Trainings',
        color: '#0ea5e9',
        count: stats.swimSessions,
      },
      {
        title: 'Gym Sessions',
        description: 'Gym trainings',
        icon: 'dumbbell',
        target: 'Trainings',
        color: '#f59e0b',
        count: stats.gymSessions,
      },
      {
        title: 'Results',
        description: 'Competition results',
        icon: 'pulse',
        target: 'Meets',
        color: '#a855f7',
        count: stats.results,
      },
    ]
  ), [stats])

  const renderCount = (count: number) => {
    if (stats.loading) return <ActivityIndicator size="small" color="#0284c7" />
    return <Text style={styles.cardCount}>{count}</Text>
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to Dolomites Swimming management system</Text>
        <Text style={styles.seasonLabel}>
          {selectedSeason?.season_name || 'Select a season to view stats'}
        </Text>
      </View>

      <View style={styles.cardsGrid}>
        {dashboardCards.map(card => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            onPress={() => navigation.navigate(card.target)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <View style={[styles.cardIconWrap, { backgroundColor: `${card.color}1A` }]}> 
                <MaterialCommunityIcons name={card.icon as any} size={18} color={card.color} />
              </View>
            </View>
            <View style={styles.cardBody}>
              {renderCount(card.count)}
              <Text style={styles.cardDescription}>{card.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.gridRow}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Quick Actions</Text>
          <Text style={styles.panelSubtitle}>Manage your swimming club</Text>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Athletes')}>
            <View>
              <Text style={styles.quickTitle}>Add New Athlete</Text>
              <Text style={styles.quickSubtitle}>Register a new swimmer</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Meets')}>
            <View>
              <Text style={styles.quickTitle}>Schedule Meet</Text>
              <Text style={styles.quickSubtitle}>Create a new competition</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Trainings')}>
            <View>
              <Text style={styles.quickTitle}>Plan Training</Text>
              <Text style={styles.quickSubtitle}>Schedule a training session</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Database Status</Text>
          <Text style={styles.panelSubtitle}>Connection to Supabase</Text>
          {stats.loading ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#0284c7" />
              <Text style={styles.statusText}>Connecting to database...</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected to Supabase</Text>
            </View>
          )}
          <Text style={styles.syncText}>
            Last sync: {lastSync ? lastSync.toLocaleTimeString() : '—'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748b',
  },
  seasonLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
  cardsGrid: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    marginTop: 10,
  },
  cardCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  gridRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  panelSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  quickAction: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  quickSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
  },
  statusRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 13,
    color: '#1e293b',
  },
  syncText: {
    marginTop: 8,
    fontSize: 11,
    color: '#94a3b8',
  },
})
