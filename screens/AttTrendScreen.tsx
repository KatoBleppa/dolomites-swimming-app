import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import Svg, { Line, Circle, Text as SvgText, Path, G } from 'react-native-svg'
import { useSeason } from '../contexts/SeasonContext'
import { supabase } from '../lib/supabase'

interface TrendData {
  fincode: number
  firstname: string
  lastname: string
  cat_name?: string
  group_name?: string
  month_year: string
  month_date: string
  total_sessions: number
  present_count: number
  justified_count: number
  late_count: number
  absent_count: number
  attendance_percentage: number
}

interface Athlete {
  fincode: number
  firstname: string
  lastname: string
}

interface Season {
  season_id: number
  season_name: string
  season_start: string
  season_end: string
}

export function AttTrendScreen() {
  const { selectedSeason } = useSeason()
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  // Available options for filters
  const [seasons, setSeasons] = useState<Season[]>([])
  const [groups, setGroups] = useState<{ id: number; group_name: string }[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])

  // Filter states
  const [filterSeason, setFilterSeason] = useState<number | null>(null)
  const [filterGroup, setFilterGroup] = useState<number | null>(null)
  const [filterTrainingType, setFilterTrainingType] = useState<string>('all')
  const [filterAthlete, setFilterAthlete] = useState<number | null>(null)

  // Load filter options
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Set default group when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && filterGroup === null) {
      setFilterGroup(groups[0].id)
    }
  }, [groups])

  // Load data when season changes
  useEffect(() => {
    if (selectedSeason) {
      setFilterSeason(selectedSeason.season_id)
    }
  }, [selectedSeason])

  // Fetch athletes when group changes
  useEffect(() => {
    if (filterSeason && filterGroup) {
      fetchAthletes()
    }
  }, [filterSeason, filterGroup])

  // Fetch data when filters change
  useEffect(() => {
    if (filterSeason && filterGroup) {
      fetchTrendData()
    }
  }, [filterSeason, filterGroup, filterTrainingType, filterAthlete])

  async function loadFilterOptions() {
    try {
      // Load seasons
      const { data: seasonData } = await supabase
        .from('_seasons')
        .select('*')
        .order('season_start', { ascending: false })
      
      if (seasonData) {
        setSeasons(seasonData)
        if (seasonData.length > 0 && !filterSeason) {
          setFilterSeason(seasonData[0].season_id)
        }
      }

      // Load groups
      const { data: groupData } = await supabase
        .from('_groups')
        .select('id, group_name')
        .order('group_name')
      
      if (groupData) setGroups(groupData)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  async function fetchAthletes() {
    if (!filterSeason || !filterGroup) return

      try {
      const { data, error } = await supabase
        .rpc('get_athletes_details', {
          p_season_id: filterSeason,
          p_group_id: filterGroup
        })

      if (error) throw error
      
      const athletesList: Athlete[] = (data || []).map((a: any) => ({
        fincode: a.fincode,
        firstname: a.firstname,
        lastname: a.lastname
      }))
      
      setAthletes(athletesList)
      // Reset athlete selection when group changes
      setFilterAthlete(null)
    } catch (error) {
      console.error('Error fetching athletes:', error)
    }
  }

   async function fetchTrendData() {
    if (!filterSeason || !filterGroup) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('attendance_trend', {
          p_season_id: filterSeason,
          p_group_id: filterGroup,
          p_type: filterTrainingType === 'all' ? null : filterTrainingType,
          p_fincode: filterAthlete
        })

      if (error) throw error
      setTrendData(data || [])
    } catch (error) {
      console.error('Error fetching trend data:', error)
    } finally {
      setLoading(false)
    }
  }

  const athletesByMonth = useMemo(() => {
    const grouped = new Map<number, { athlete: string; data: TrendData[] }>()
    
    trendData.forEach(row => {
      if (!grouped.has(row.fincode)) {
        grouped.set(row.fincode, {
          athlete: `${row.firstname} ${row.lastname}`,
          data: []
        })
      }
      grouped.get(row.fincode)!.data.push(row)
    })
    
    return Array.from(grouped.values())
  }, [trendData])

  const allMonths = useMemo(() => {
    const months = new Set<string>()
    trendData.forEach(row => months.add(row.month_year))
    return Array.from(months).sort()
  }, [trendData])

  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getRateColor = (rate: number) => {
    if (rate >= 90) return '#22c55e'
    if (rate >= 75) return '#eab308'
    if (rate >= 60) return '#f97316'
    return '#ef4444'
  }

  const renderLineChart = (athleteData: { athlete: string; data: TrendData[] }) => {
    const chartWidth = Math.max(400, allMonths.length * 80)
    const chartHeight = 220
    const padding = { top: 30, right: 20, bottom: 40, left: 50 }
    const plotWidth = chartWidth - padding.left - padding.right
    const plotHeight = chartHeight - padding.top - padding.bottom

    // Prepare data points
    const points = allMonths.map((month, index) => {
      const monthData = athleteData.data.find(d => d.month_year === month)
      const rate = Number(monthData?.attendance_percentage || 0)
      const x = allMonths.length === 1 
        ? padding.left + plotWidth / 2 
        : padding.left + (index / (allMonths.length - 1)) * plotWidth
      // Y-axis: 0% at bottom (padding.top + plotHeight), 100% at top (padding.top)
      const y = padding.top + plotHeight * (1 - rate / 100)
      return { x, y, rate, month, monthData }
    })

    // Create path for line
    const linePath = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ')

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(value => {
            const y = padding.top + plotHeight * (1 - value / 100)
            return (
              <G key={value}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={value === 0 || value === 100 ? "0" : "4,4"}
                />
                <SvgText
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize="11"
                  fill="#64748b"
                  textAnchor="end"
                >
                  {value}%
                </SvgText>
              </G>
            )
          })}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <SvgText
              key={index}
              x={point.x}
              y={chartHeight - 10}
              fontSize="10"
              fill="#64748b"
              textAnchor="middle"
            >
              {formatMonth(point.month).split(' ')[0]}
            </SvgText>
          ))}

          {/* Line path */}
          <Path
            d={linePath}
            stroke="#0284c7"
            strokeWidth="3"
            fill="none"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <G key={index}>
              <Circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={getRateColor(point.rate)}
                stroke="#fff"
                strokeWidth="2"
              />
            </G>
          ))}
        </Svg>

        {/* Stats below chart */}
        <View style={styles.statsRow}>
          {points.map((point, index) => (
            <View key={index} style={styles.statColumn}>
              {point.monthData && (
                <>
                  <Text style={styles.statLabel}>{formatMonth(point.month)}</Text>
                  <Text style={styles.statValue}>✓ {point.monthData.present_count}</Text>
                  <Text style={styles.statValue}>✗ {point.monthData.absent_count}</Text>
                </>
              )}
            </View>
          ))}
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading attendance trends...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Trends</Text>
        <Text style={styles.subtitle}>
          {selectedSeason?.season_name || 'Select a season'}
        </Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        {/* Group Filter */}
        <Text style={styles.filterLabel}>Group:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {groups.map(group => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.filterButton,
                filterGroup === group.id && styles.filterButtonActive
              ]}
              onPress={() => setFilterGroup(group.id)}
            >
              <Text style={[
                styles.filterButtonText,
                filterGroup === group.id && styles.filterButtonTextActive
              ]}>
                {group.group_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Athlete Filter */}
        <Text style={[styles.filterLabel, { marginTop: 16 }]}>Athlete:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {athletes.map(athlete => (
            <TouchableOpacity
              key={athlete.fincode}
              style={[
                styles.filterButton,
                filterAthlete === athlete.fincode && styles.filterButtonActive
              ]}
              onPress={() => setFilterAthlete(athlete.fincode)}
            >
              <Text style={[
                styles.filterButtonText,
                filterAthlete === athlete.fincode && styles.filterButtonTextActive
              ]}>
                {athlete.firstname} {athlete.lastname}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Session Type Filter */}
        <Text style={[styles.filterLabel, { marginTop: 16 }]}>Session Type:</Text>
        <View style={styles.filterRow}>
          {[
            { value: 'all', label: 'All' },
            { value: 'Swim', label: 'Swim' },
            { value: 'Gym', label: 'Gym' }
          ].map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.filterButton,
                filterTrainingType === type.value && styles.filterButtonActive
              ]}
              onPress={() => setFilterTrainingType(type.value)}
            >
              <Text style={[
                styles.filterButtonText,
                filterTrainingType === type.value && styles.filterButtonTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.content}>
        {!filterAthlete ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Please select an athlete to view attendance trends</Text>
          </View>
        ) : athletesByMonth.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No attendance data available</Text>
          </View>
        ) : (
          <View style={styles.athleteCard}>
            <Text style={styles.athleteName}>
              {athletesByMonth[0]?.athlete || 'Selected Athlete'}
            </Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {renderLineChart(athletesByMonth[0])}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
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
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  chartContainer: {
    paddingVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statColumn: {
    minWidth: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 11,
    color: '#64748b',
  },
})