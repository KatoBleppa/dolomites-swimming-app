import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  Alert,
  FlatList,
  SectionList,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSeason } from '../contexts/SeasonContext'
import { supabase } from '../lib/supabase'

interface Group {
  id: number
  group_name: string
}

interface Meet {
  meet_id: number
  meet_name: string
  pool_name?: string
  place?: string
  nation?: string
  min_date: string
  max_date: string
  meet_course: number
}

interface Race {
  race_id: number
  race_id_fin?: number
  distance: number
  stroke_short_en?: string
  stroke_long_en?: string
  stroke_long_it?: string
  relay_count: number
}

interface Event {
  ms_id: number
  meet_id: number
  event_numb: number
  ms_race_id: number
  gender?: string
  ms_group_id?: number
  created_at?: string
}

interface EventWithRace extends Event {
  race?: Race
  group?: Group
  group_ids?: number[]
  group_names?: string[]
}

interface Athlete {
  fincode: number
  firstname: string
  lastname: string
  gender?: string
  group_id?: number
}

interface Result {
  res_id: number
  fincode: number
  meet_id: number
  event_numb: number
  res_time_decimal: number
  entry_time_decimal?: number
  entry_time_res_id?: number
  status?: number | null
}

interface ResultWithAthlete extends Result {
  athlete?: Athlete
  event?: EventWithRace
  race?: Race
  formattedTime?: string
  result_status?: ResultStatus
}

interface Split {
  splits_id?: number
  splits_res_id?: number
  distance: number
  split_time: number
}

interface RelaySplit {
  relay_splits_id?: number
  splits_relay_res_id?: number
  distance: number
  split_time: number
}

interface RelayResultWithEvent {
  relay_result_id: number
  meet_id: number
  event_numb: number
  relay_name: string
  leg1_fincode: number
  leg1_entry_time: number
  leg1_res_time: number
  leg2_fincode: number
  leg2_entry_time: number
  leg2_res_time: number
  leg3_fincode: number
  leg3_entry_time: number
  leg3_res_time: number
  leg4_fincode: number
  leg4_entry_time: number
  leg4_res_time: number
  status?: number | null
  result_status?: string
  created_at?: string
  updated_at?: string
  event?: EventWithRace
  race?: Race
  formattedTime?: string
  totalTime?: number
}

interface SplitData {
  result: ResultWithAthlete
  splits: (Split & { formattedTime?: string })[]
}

type ResultStatus = 'FINISHED' | 'DSQ' | 'DNF' | 'DNS'

export function RacesScreen() {
  const { selectedSeason } = useSeason()
  const [meets, setMeets] = useState<Meet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null)
  const [viewingResults, setViewingResults] = useState(false)
  const [viewingEntries, setViewingEntries] = useState(false)
  const [events, setEvents] = useState<EventWithRace[]>([])
  const [results, setResults] = useState<ResultWithAthlete[]>([])
  const [relayResults, setRelayResults] = useState<RelayResultWithEvent[]>([])
  const [entryEvents, setEntryEvents] = useState<EventWithRace[]>([])
  const [entryResults, setEntryResults] = useState<ResultWithAthlete[]>([])
  const [entryRelayResults, setEntryRelayResults] = useState<RelayResultWithEvent[]>([])
  const [meetStats, setMeetStats] = useState({ eventsCount: 0, entriesCount: 0, resultsCount: 0 })
  const [selectedResult, setSelectedResult] = useState<SplitData | null>(null)
  const [selectedRelayResult, setSelectedRelayResult] = useState<RelayResultWithEvent | null>(null)
  const [relayAthletes, setRelayAthletes] = useState<Map<number, Athlete>>(new Map())
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [creatingMeet, setCreatingMeet] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<Meet>>({})
  const [viewingEvents, setViewingEvents] = useState(false)
  const [meetEvents, setMeetEvents] = useState<EventWithRace[]>([])
  const [eventEntryCounts, setEventEntryCounts] = useState<Map<number, number>>(new Map())
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [availableRaces, setAvailableRaces] = useState<Race[]>([])
  const [editingEvent, setEditingEvent] = useState<EventWithRace | null>(null)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [eventForm, setEventForm] = useState<Partial<Event>>({})
  const [loadingRaces, setLoadingRaces] = useState(false)
  const [raceTypeFilter, setRaceTypeFilter] = useState<'IND' | 'REL'>('IND')
  const [addingEntriesForEvent, setAddingEntriesForEvent] = useState<EventWithRace | null>(null)
  const [eventAthletes, setEventAthletes] = useState<(
    Athlete & {
      group_id?: number
      personalBest?: number
      formattedPersonalBest?: string
      personalBestResId?: number
    }
  )[]>([])
  const [selectedAthletes, setSelectedAthletes] = useState<Set<number>>(new Set())
  const [originalEntries, setOriginalEntries] = useState<Set<number>>(new Set())
  const [loadingEventAthletes, setLoadingEventAthletes] = useState(false)
  const [savingEventEntries, setSavingEventEntries] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [editingResult, setEditingResult] = useState<ResultWithAthlete | null>(null)
  const [resultTimeInput, setResultTimeInput] = useState('')
  const [splitInputs, setSplitInputs] = useState<{ distance: number; timeInput: string; splits_id?: number }[]>([])
  const [savingSplits, setSavingSplits] = useState(false)
  const [editingSplits, setEditingSplits] = useState(false)
  const [resultSplitInputs, setResultSplitInputs] = useState<{ distance: number; timeInput: string; splits_id?: number }[]>([])
  const [relaySplitInputs, setRelaySplitInputs] = useState<{ distance: number; timeInput: string; relay_splits_id?: number }[]>([])
  const [savingRelaySplits, setSavingRelaySplits] = useState(false)
  const [editingRelaySplits, setEditingRelaySplits] = useState(false)
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(new Set())
  const [selectedEventGroupIds, setSelectedEventGroupIds] = useState<Set<number>>(new Set())
  const [meetGroupNames, setMeetGroupNames] = useState<string[]>([])
  const [editingRelayResult, setEditingRelayResult] = useState<RelayResultWithEvent | null>(null)
  const [relayLegInputs, setRelayLegInputs] = useState({
    leg1: '',
    leg2: '',
    leg3: '',
    leg4: '',
  })

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.event_numb - b.event_numb),
    [events]
  )

  const sortedMeetEvents = useMemo(
    () => [...meetEvents].sort((a, b) => a.event_numb - b.event_numb),
    [meetEvents]
  )

  const sortedEntryEvents = useMemo(
    () => [...entryEvents].sort((a, b) => a.event_numb - b.event_numb),
    [entryEvents]
  )

  const resultsByEvent = useMemo(() => {
    const map = new Map<number, ResultWithAthlete[]>()
    results.forEach((result) => {
      const list = map.get(result.event_numb) || []
      list.push(result)
      map.set(result.event_numb, list)
    })

    map.forEach((list, key) => {
      map.set(
        key,
        [...list].sort((a, b) => {
          const statusDiff = (b.status ?? 0) - (a.status ?? 0)
          if (statusDiff !== 0) return statusDiff
          return (a.res_time_decimal || 0) - (b.res_time_decimal || 0)
        })
      )
    })

    return map
  }, [results])

  const entryResultsByEvent = useMemo(() => {
    const map = new Map<number, ResultWithAthlete[]>()
    entryResults.forEach((result) => {
      const list = map.get(result.event_numb) || []
      list.push(result)
      map.set(result.event_numb, list)
    })

    map.forEach((list, key) => {
      map.set(key, [...list].sort((a, b) => (a.entry_time_decimal || 0) - (b.entry_time_decimal || 0)))
    })

    return map
  }, [entryResults])

  const relayResultsByEvent = useMemo(() => {
    const map = new Map<number, RelayResultWithEvent[]>()
    relayResults.forEach((result) => {
      const list = map.get(result.event_numb) || []
      list.push(result)
      map.set(result.event_numb, list)
    })

    map.forEach((list, key) => {
      map.set(
        key,
        [...list].sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0))
      )
    })

    return map
  }, [relayResults])

  const entryRelayResultsByEvent = useMemo(() => {
    const map = new Map<number, RelayResultWithEvent[]>()
    entryRelayResults.forEach((result) => {
      const list = map.get(result.event_numb) || []
      list.push(result)
      map.set(result.event_numb, list)
    })

    map.forEach((list, key) => {
      map.set(key, [...list].sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0)))
    })

    return map
  }, [entryRelayResults])

  const eventsWithResults = useMemo(
    () =>
      sortedEvents.filter((event) => {
        const eventResults = resultsByEvent.get(event.event_numb)
        const eventRelayResults = relayResultsByEvent.get(event.event_numb)
        return (eventResults?.length || 0) + (eventRelayResults?.length || 0) > 0
      }),
    [sortedEvents, resultsByEvent, relayResultsByEvent]
  )

  const entryEventsWithResults = useMemo(
    () =>
      sortedEntryEvents.filter((event) => {
        const eventResults = entryResultsByEvent.get(event.event_numb)
        const eventRelayResults = entryRelayResultsByEvent.get(event.event_numb)
        return (eventResults?.length || 0) + (eventRelayResults?.length || 0) > 0
      }),
    [sortedEntryEvents, entryResultsByEvent, entryRelayResultsByEvent]
  )

  type ResultSectionItem =
    | { type: 'relay'; relayResult: RelayResultWithEvent; rank: number }
    | { type: 'result'; result: ResultWithAthlete; rank: number }

  const resultsSections = useMemo(
    () =>
      eventsWithResults.map((event) => {
        const isRelayEvent = event.race && event.race.relay_count > 1
        const eventResults = resultsByEvent.get(event.event_numb) || []
        const eventRelayResults = relayResultsByEvent.get(event.event_numb) || []
        let data: ResultSectionItem[] = []
        if (isRelayEvent) {
          data = eventRelayResults.map((relayResult, index) => ({
            type: 'relay' as const,
            relayResult,
            rank: index + 1,
          }))
        } else {
          data = eventResults.map((result, index) => ({
            type: 'result' as const,
            result,
            rank: index + 1,
          }))
        }
        return {
          event,
          isRelayEvent,
          data,
        }
      }),
    [eventsWithResults, resultsByEvent, relayResultsByEvent]
  )

  const entrySections = useMemo(
    () =>
      entryEventsWithResults.map((event) => {
        const isRelayEvent = event.race && event.race.relay_count > 1
        const eventResults = entryResultsByEvent.get(event.event_numb) || []
        const eventRelayResults = entryRelayResultsByEvent.get(event.event_numb) || []
        let data: ResultSectionItem[] = []
        if (isRelayEvent) {
          data = eventRelayResults.map((relayResult, index) => ({
            type: 'relay' as const,
            relayResult,
            rank: index + 1,
          }))
        } else {
          data = eventResults.map((result, index) => ({
            type: 'result' as const,
            result,
            rank: index + 1,
          }))
        }
        return {
          event,
          isRelayEvent,
          data,
        }
      }),
    [entryEventsWithResults, entryResultsByEvent, entryRelayResultsByEvent]
  )

  useEffect(() => {
    if (selectedSeason) {
      fetchMeets()
    }
  }, [selectedSeason])

  useEffect(() => {
    loadAllGroups()
  }, [])

  useEffect(() => {
    if (selectedMeet) {
      fetchMeetGroups(selectedMeet.meet_id)
    } else {
      setMeetGroupNames([])
    }
  }, [selectedMeet])

  async function loadAllGroups() {
    try {
      const { data, error } = await supabase.from('_groups').select('*').order('id', { ascending: true })
      if (error) throw error
      setAllGroups(data || [])
    } catch {
      setAllGroups([])
    }
  }

  async function fetchMeetGroups(meetId: number) {
    try {
      const { data: meetGroupsData, error } = await supabase.from('meet_groups').select('group_id').eq('meet_id', meetId)
      if (error) throw error

      const meetGroupIds = meetGroupsData?.map((mg: any) => mg.group_id) || []
      if (meetGroupIds.length === 0) {
        setMeetGroupNames([])
        return
      }

      const { data: groupsData, error: groupsError } = await supabase
        .from('_groups')
        .select('id, group_name')
        .in('id', meetGroupIds)
        .order('id', { ascending: true })

      if (groupsError) throw groupsError

      setMeetGroupNames((groupsData || []).map((group: any) => group.group_name))
    } catch {
      setMeetGroupNames([])
    }
  }

  const confirmAction = (title: string, message: string) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', style: 'destructive', onPress: () => resolve(true) },
      ])
    })

  function timeStringToMilliseconds(timeStr: string): number {
    const cleaned = timeStr.replace(/\D/g, '')
    if (cleaned.length !== 6) return 0

    const minutes = parseInt(cleaned.substring(0, 2), 10)
    const seconds = parseInt(cleaned.substring(2, 4), 10)
    const centiseconds = parseInt(cleaned.substring(4, 6), 10)

    return minutes * 60 * 1000 + seconds * 1000 + centiseconds * 10
  }

  function millisecondsToTimeString(ms: number): string {
    const totalSeconds = ms / 1000.0
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const centiseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100)

    return `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}${centiseconds
      .toString()
      .padStart(2, '0')}`
  }

  function generateSplitDistances(raceDistance: number): number[] {
    const distances: number[] = []
    for (let d = 50; d <= raceDistance; d += 50) distances.push(d)
    return distances
  }

  function formattedTimeToMilliseconds(timeStr: string): number {
    const parts = timeStr.match(/(\d{1,2}):(\d{2})\.(\d{2})/)
    if (!parts) return 0
    const minutes = parseInt(parts[1], 10)
    const seconds = parseInt(parts[2], 10)
    const centiseconds = parseInt(parts[3], 10)
    return minutes * 60 * 1000 + seconds * 1000 + centiseconds * 10
  }

  function millisecondsToFormattedTime(ms: number): string {
    if (ms === 0) return ''
    const totalSeconds = ms / 1000.0
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const centiseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100)
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  async function fetchMeets() {
    if (!selectedSeason) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('meets')
        .select('*')
        .gte('min_date', selectedSeason.season_start)
        .lte('max_date', selectedSeason.season_end)
        .order('min_date', { ascending: false })

      if (error) throw error
      setMeets(data || [])
    } catch {
      setMeets([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMeets = meets.filter((meet) =>
    [meet.meet_name, meet.place || '', meet.nation || '']
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  async function fetchMeetStats(meet: Meet) {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .rpc('get_meet_events_with_details', { p_meet_id: meet.meet_id })

      if (eventsError) {
        setMeetStats({ eventsCount: 0, entriesCount: 0, resultsCount: 0 })
        return
      }

      const eventsCount = eventsData?.length || 0

      const { count: entriesCount } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('meet_id', meet.meet_id)
        .eq('status', 0)

      const { count: relayEntriesCount } = await supabase
        .from('relay_results')
        .select('*', { count: 'exact', head: true })
        .eq('meet_id', meet.meet_id)
        .eq('status', 0)

      const totalEntriesCount = (entriesCount || 0) + (relayEntriesCount || 0)

      const { count: resultsCount } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('meet_id', meet.meet_id)
        .not('status', 'is', null)
        .neq('status', 0)

      const { count: relayResultsCount } = await supabase
        .from('relay_results')
        .select('*', { count: 'exact', head: true })
        .eq('meet_id', meet.meet_id)
        .not('status', 'is', null)
        .neq('status', 0)

      const totalResultsCount = (resultsCount || 0) + (relayResultsCount || 0)

      setMeetStats({ eventsCount, entriesCount: totalEntriesCount, resultsCount: totalResultsCount })
    } catch {
      setMeetStats({ eventsCount: 0, entriesCount: 0, resultsCount: 0 })
    }
  }

  async function handleViewResults(meet: Meet) {
    setSelectedMeet(meet)
    setViewingResults(true)
    setLoadingResults(true)

    try {
      const { data: eventsData, error: eventsError } = await supabase
        .rpc('get_meet_events_with_details', { p_meet_id: meet.meet_id })

      if (eventsError) throw eventsError

      const eventsWithRaces: EventWithRace[] = (eventsData || []).map((e: any) => ({
        ms_id: e.ms_id,
        meet_id: e.meet_id,
        event_numb: e.event_numb,
        ms_race_id: e.ms_race_id,
        gender: e.gender,
        ms_group_id: e.ms_group_id,
        created_at: e.created_at,
        race: e.race_id
          ? {
              race_id: e.race_id,
              race_id_fin: e.race_id_fin,
              distance: e.distance,
              stroke_short_en: e.stroke_short_en,
              stroke_long_en: e.stroke_long_en,
              stroke_long_it: e.stroke_long_it,
              relay_count: e.relay_count,
            }
          : undefined,
        group: e.group_id
          ? {
              id: e.group_id,
              group_name: e.group_name,
            }
          : undefined,
      }))

      setEvents(eventsWithRaces)

      const { count: entriesCount } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('meet_id', meet.meet_id)

      const { count: relayEntriesCount } = await supabase
        .from('relay_entries')
        .select('*', { count: 'exact', head: true })
        .eq('meet_id', meet.meet_id)

      const totalEntriesCount = (entriesCount || 0) + (relayEntriesCount || 0)

      const { data: resultsData } = await supabase
        .from('results')
        .select('*')
        .eq('meet_id', meet.meet_id)
        .neq('status', 0)
        .order('event_numb', { ascending: true })
        .order('res_time_decimal', { ascending: true })

      const fincodes = [...new Set(resultsData?.map((r: any) => r.fincode) || [])]
      const { data: athletesData } = await supabase.from('athletes').select('*').in('fincode', fincodes)

      const athleteMap = new Map(athletesData?.map((a: any) => [a.fincode, a]) || [])
      const eventMap = new Map(eventsWithRaces?.map((e) => [`${e.meet_id}-${e.event_numb}`, e]) || [])

      const transformedResults: ResultWithAthlete[] = (resultsData || []).map((r: any) => {
        const eventKey = `${r.meet_id}-${r.event_numb}`
        const event = eventMap.get(eventKey)
        return {
          ...r,
          athlete: athleteMap.get(r.fincode),
          event,
          race: event?.race,
          result_status: getResultStatusString(r.status),
        }
      })

      const resultsWithFormattedTimes = await formatTimesInResults(transformedResults)
      setResults(resultsWithFormattedTimes)

      const { data: relayResultsData } = await supabase
        .from('relay_results')
        .select('*')
        .eq('meet_id', meet.meet_id)
        .neq('status', 0)
        .order('event_numb', { ascending: true })

      const transformedRelayResults: RelayResultWithEvent[] = (relayResultsData || []).map((r: any) => {
        const eventKey = `${r.meet_id}-${r.event_numb}`
        const event = eventMap.get(eventKey)
        const totalTime = (r.leg1_res_time || 0) + (r.leg2_res_time || 0) + (r.leg3_res_time || 0) + (r.leg4_res_time || 0)
        let result_status = 'FINISHED'
        if (r.status === 1) result_status = 'DSQ'
        else if (r.status === 2) result_status = 'DNF'
        else if (r.status === 3) result_status = 'DNS'
        return {
          ...r,
          event,
          race: event?.race,
          totalTime,
          result_status,
        }
      })

      transformedRelayResults.sort((a, b) => {
        if (a.event_numb !== b.event_numb) return a.event_numb - b.event_numb
        return (a.totalTime || 0) - (b.totalTime || 0)
      })

      const relayResultsWithFormattedTimes = await formatTimesInRelayResults(transformedRelayResults)
      setRelayResults(relayResultsWithFormattedTimes)

      const totalResultsCount = (resultsData?.length || 0) + (relayResultsData?.length || 0)
      setMeetStats({ eventsCount: eventsWithRaces.length, entriesCount: totalEntriesCount, resultsCount: totalResultsCount })
    } catch {
      setResults([])
      setRelayResults([])
    } finally {
      setLoadingResults(false)
    }
  }

  async function handleViewEntries(meet: Meet) {
    setSelectedMeet(meet)
    setViewingEntries(true)
    setLoadingEntries(true)

    try {
      const { data: eventsData, error: eventsError } = await supabase
        .rpc('get_meet_events_with_details', { p_meet_id: meet.meet_id })

      if (eventsError) throw eventsError

      const eventsWithRaces: EventWithRace[] = (eventsData || []).map((e: any) => ({
        ms_id: e.ms_id,
        meet_id: e.meet_id,
        event_numb: e.event_numb,
        ms_race_id: e.ms_race_id,
        gender: e.gender,
        ms_group_id: e.ms_group_id,
        created_at: e.created_at,
        race: e.race_id
          ? {
              race_id: e.race_id,
              race_id_fin: e.race_id_fin,
              distance: e.distance,
              stroke_short_en: e.stroke_short_en,
              stroke_long_en: e.stroke_long_en,
              stroke_long_it: e.stroke_long_it,
              relay_count: e.relay_count,
            }
          : undefined,
        group: e.group_id
          ? {
              id: e.group_id,
              group_name: e.group_name,
            }
          : undefined,
      }))

      setEntryEvents(eventsWithRaces)

      const { data: entriesData } = await supabase
        .from('results')
        .select('*')
        .eq('meet_id', meet.meet_id)
        .eq('status', 0)
        .order('event_numb', { ascending: true })
        .order('entry_time_decimal', { ascending: true })

      const fincodes = [...new Set(entriesData?.map((r: any) => r.fincode) || [])]
      const { data: athletesData } = await supabase.from('athletes').select('*').in('fincode', fincodes)

      const athleteMap = new Map(athletesData?.map((a: any) => [a.fincode, a]) || [])
      const eventMap = new Map(eventsWithRaces?.map((e) => [`${e.meet_id}-${e.event_numb}`, e]) || [])

      const transformedEntries: ResultWithAthlete[] = (entriesData || []).map((r: any) => {
        const eventKey = `${r.meet_id}-${r.event_numb}`
        const event = eventMap.get(eventKey)
        return {
          ...r,
          athlete: athleteMap.get(r.fincode),
          event,
          race: event?.race,
        }
      })

      const entriesWithFormattedTimes = await formatTimesInEntries(transformedEntries)
      setEntryResults(entriesWithFormattedTimes)

      const { data: relayEntriesData } = await supabase
        .from('relay_results')
        .select('*')
        .eq('meet_id', meet.meet_id)
        .eq('status', 0)
        .order('event_numb', { ascending: true })

      const transformedRelayEntries: RelayResultWithEvent[] = (relayEntriesData || []).map((r: any) => {
        const eventKey = `${r.meet_id}-${r.event_numb}`
        const event = eventMap.get(eventKey)
        const totalTime = (r.leg1_entry_time || 0) + (r.leg2_entry_time || 0) + (r.leg3_entry_time || 0) + (r.leg4_entry_time || 0)
        return {
          ...r,
          event,
          race: event?.race,
          totalTime,
        }
      })

      transformedRelayEntries.sort((a, b) => {
        if (a.event_numb !== b.event_numb) return a.event_numb - b.event_numb
        return (a.totalTime || 0) - (b.totalTime || 0)
      })

      const relayEntriesWithFormattedTimes = await formatTimesInRelayResults(transformedRelayEntries)
      setEntryRelayResults(relayEntriesWithFormattedTimes)
    } catch {
      setEntryResults([])
      setEntryRelayResults([])
    } finally {
      setLoadingEntries(false)
    }
  }

  async function handleViewRelaySplits(relayResult: RelayResultWithEvent) {
    try {
      const fincodes = [
        relayResult.leg1_fincode,
        relayResult.leg2_fincode,
        relayResult.leg3_fincode,
        relayResult.leg4_fincode,
      ].filter((fc) => fc && fc > 0)

      if (fincodes.length > 0) {
        const { data: athletesData } = await supabase.from('athletes').select('*').in('fincode', fincodes)
        if (athletesData) {
          const athleteMap = new Map(athletesData.map((a: any) => [a.fincode, a]))
          setRelayAthletes(athleteMap)
        }
      }

      const { data: relaySplitsData, error: relaySplitsError } = await supabase
        .from('relay_splits')
        .select('*')
        .eq('splits_relay_res_id', relayResult.relay_result_id)
        .order('distance', { ascending: true })

      if (relaySplitsError) throw relaySplitsError

      const legDistance = relayResult.race?.distance || 0
      const relayCount = relayResult.race?.relay_count || 4

      if (legDistance > 0) {
        const splitInterval = legDistance === 800 || legDistance === 1500 ? 100 : 50
        const splitsPerLeg = legDistance / splitInterval

        const allSplitInputs: { distance: number; timeInput: string; relay_splits_id?: number }[] = []

        for (let leg = 1; leg <= relayCount; leg++) {
          const legStartDistance = (leg - 1) * legDistance
          for (let i = 1; i <= splitsPerLeg; i++) {
            const distance = legStartDistance + i * splitInterval
            const existingSplit = relaySplitsData?.find((s: RelaySplit) => s.distance === distance)
            allSplitInputs.push({
              distance,
              timeInput: existingSplit ? formatTime(existingSplit.split_time || 0) : '',
              relay_splits_id: existingSplit?.relay_splits_id,
            })
          }
        }
        setRelaySplitInputs(allSplitInputs)
      } else {
        setRelaySplitInputs([])
      }

      setEditingRelaySplits(false)
      setSelectedRelayResult(relayResult)
    } catch {
      setSelectedRelayResult(relayResult)
    }
  }

  async function handleViewSplits(result: ResultWithAthlete) {
    try {
      if (result.res_time_decimal === 0) {
        Alert.alert('Info', 'Please enter the final result time before adding splits.')
        return
      }

      const distance = result.race?.distance || 0

      const { data: splitsData, error: splitsError } = await supabase
        .from('splits')
        .select('*')
        .eq('splits_res_id', result.res_id)
        .order('distance', { ascending: true })

      if (splitsError) throw splitsError

      const splitsWithFormattedTimes = await formatTimesInSplits(splitsData || [])

      setSelectedResult({
        result,
        splits: splitsWithFormattedTimes,
      })

      setEditingSplits(false)

      if (splitsData && splitsData.length > 0) {
        const inputs = splitsData.map((split) => ({
          distance: split.distance,
          timeInput: formatTime(split.split_time),
          splits_id: split.splits_id,
        }))

        const finalSplit = inputs.find((input) => input.distance === distance)
        if (finalSplit) {
          finalSplit.timeInput = formatTime(result.res_time_decimal)
        } else if (distance > 0) {
          inputs.push({
            distance,
            timeInput: formatTime(result.res_time_decimal),
            splits_id: undefined,
          })
        }

        setSplitInputs(inputs.sort((a, b) => a.distance - b.distance))
      } else {
        const emptySplits = generateEmptySplits(distance)
        if (emptySplits.length > 0 && distance > 0) {
          emptySplits[emptySplits.length - 1].timeInput = formatTime(result.res_time_decimal)
        }
        setSplitInputs(emptySplits)
      }
    } catch {
      setSelectedResult(null)
    }
  }

  function getCourseLength(courseCode: number): string {
    return courseCode === 1 ? '50m' : '25m'
  }

  function getResultStatusString(status: number | null | undefined): ResultStatus {
    if (status === 1) return 'DSQ'
    if (status === 2) return 'DNF'
    if (status === 3) return 'DNS'
    return 'FINISHED'
  }

  function formatResultDisplay(result: ResultWithAthlete): string {
    if (!result.result_status || result.result_status === 'FINISHED') {
      return result.formattedTime || formatTime(result.res_time_decimal)
    }
    return result.result_status
  }

  function getSplitIntervals(distance: number): number[] {
    if (distance === 800 || distance === 1500) {
      const intervals: number[] = []
      for (let i = 100; i <= distance; i += 100) intervals.push(i)
      return intervals
    }
    const intervals: number[] = []
    for (let i = 50; i <= distance; i += 50) intervals.push(i)
    return intervals
  }

  function generateEmptySplits(distance: number): { distance: number; timeInput: string }[] {
    const intervals = getSplitIntervals(distance)
    return intervals.map((dist) => ({ distance: dist, timeInput: '' }))
  }

  function formatTime(decimalTime: number): string {
    const totalSeconds = decimalTime / 1000.0
    const minutes = Math.floor(totalSeconds / 60)
    const secondsWhole = Math.floor(totalSeconds % 60)
    const centiseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100)

    return `${minutes.toString().padStart(2, '0')}:${secondsWhole
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  function formattedTimeToDisplay(timeStr: string): string {
    return timeStr.replace(/_/g, '0')
  }

  async function formatTimeWithSupabase(decimalTime: number): Promise<string> {
    try {
      const { data } = await supabase.rpc('totaltime_to_timestr', { totaltime: decimalTime })
      return data || formatTime(decimalTime)
    } catch {
      return formatTime(decimalTime)
    }
  }

  async function formatTimesInResults(resultsData: ResultWithAthlete[]) {
    const formattedResults = await Promise.all(
      resultsData.map(async (result) => ({
        ...result,
        formattedTime: await formatTimeWithSupabase(result.res_time_decimal),
      }))
    )
    return formattedResults
  }

  async function formatTimesInEntries(resultsData: ResultWithAthlete[]) {
    const formattedResults = await Promise.all(
      resultsData.map(async (result) => ({
        ...result,
        formattedTime:
          result.entry_time_decimal && result.entry_time_decimal > 0
            ? await formatTimeWithSupabase(result.entry_time_decimal)
            : '',
      }))
    )
    return formattedResults
  }

  async function formatTimesInRelayResults(relayResultsData: RelayResultWithEvent[]) {
    if (relayResultsData.length === 0) return relayResultsData

    const timesToFormat = relayResultsData.filter((r) => r.totalTime && r.totalTime > 0).map((r) => r.totalTime!)
    if (timesToFormat.length === 0) return relayResultsData

    try {
      const { data: formattedData } = await supabase.rpc('format_times_batch', { times_array: timesToFormat })
      const timeMap = new Map<number, string>()
      formattedData?.forEach((item: { time_decimal: number; formatted_time: string }) => {
        timeMap.set(item.time_decimal, item.formatted_time)
      })

      return relayResultsData.map((r) => ({
        ...r,
        formattedTime: r.totalTime && r.totalTime > 0 ? timeMap.get(r.totalTime) : undefined,
      }))
    } catch {
      return relayResultsData
    }
  }

  async function formatTimesInSplits(splitsData: Split[]) {
    const formattedSplits = await Promise.all(
      splitsData.map(async (split) => ({
        ...split,
        formattedTime: await formatTimeWithSupabase(split.split_time),
      }))
    )
    return formattedSplits
  }

  async function handleSaveSplits() {
    if (!selectedResult) return

    try {
      setSavingSplits(true)

      const splitsToSave = splitInputs
        .filter((input) => input.timeInput.trim() !== '')
        .map((input) => {
          const timeParts = input.timeInput.match(/(\d{2}):(\d{2})\.(\d{2})/)
          if (!timeParts) throw new Error(`Invalid time format: ${input.timeInput}`)
          const minutes = parseInt(timeParts[1], 10)
          const seconds = parseInt(timeParts[2], 10)
          const centiseconds = parseInt(timeParts[3], 10)
          const milliseconds = minutes * 60 * 1000 + seconds * 1000 + centiseconds * 10

          return {
            splits_res_id: selectedResult.result.res_id,
            distance: input.distance,
            split_time: milliseconds,
            splits_id: input.splits_id,
          }
        })

      const existingSplitIds = splitInputs.filter((input) => input.splits_id).map((input) => input.splits_id!)

      const { data: currentSplits } = await supabase
        .from('splits')
        .select('splits_id')
        .eq('splits_res_id', selectedResult.result.res_id)

      if (currentSplits) {
        const splitsToDelete = currentSplits
          .filter((split: any) => !existingSplitIds.includes(split.splits_id))
          .map((split: any) => split.splits_id)

        if (splitsToDelete.length > 0) {
          await supabase.from('splits').delete().in('splits_id', splitsToDelete)
        }
      }

      for (const split of splitsToSave) {
        if (split.splits_id) {
          await supabase
            .from('splits')
            .update({ distance: split.distance, split_time: split.split_time, updated_at: new Date().toISOString() })
            .eq('splits_id', split.splits_id)
        } else {
          await supabase.from('splits').insert({ splits_res_id: split.splits_res_id, distance: split.distance, split_time: split.split_time })
        }
      }

      setSelectedResult(null)
      setSplitInputs([])
      setEditingSplits(false)
    } catch {
      Alert.alert('Error', 'Error saving splits. Please try again.')
    } finally {
      setSavingSplits(false)
    }
  }

  async function handleSaveRelaySplits() {
    if (!selectedRelayResult) return

    try {
      setSavingRelaySplits(true)

      const splitsToSave = relaySplitInputs
        .filter((input) => input.timeInput.trim() !== '')
        .map((input) => {
          const timeParts = input.timeInput.match(/(\d{2}):(\d{2})\.(\d{2})/)
          if (!timeParts) throw new Error(`Invalid time format: ${input.timeInput}`)
          const minutes = parseInt(timeParts[1], 10)
          const seconds = parseInt(timeParts[2], 10)
          const centiseconds = parseInt(timeParts[3], 10)
          const milliseconds = minutes * 60 * 1000 + seconds * 1000 + centiseconds * 10

          return {
            splits_relay_res_id: selectedRelayResult.relay_result_id,
            distance: input.distance,
            split_time: milliseconds,
            relay_splits_id: input.relay_splits_id,
          }
        })

      const { data: currentSplits } = await supabase
        .from('relay_splits')
        .select('relay_splits_id, distance')
        .eq('splits_relay_res_id', selectedRelayResult.relay_result_id)

      const existingSplitsMap = new Map((currentSplits || []).map((s: any) => [s.distance, s.relay_splits_id]))

      const splitsToUpdate: typeof splitsToSave = []
      const splitsToInsert: typeof splitsToSave = []

      for (const split of splitsToSave) {
        const existingId = existingSplitsMap.get(split.distance)
        if (existingId) {
          splitsToUpdate.push({ ...split, relay_splits_id: existingId })
        } else {
          splitsToInsert.push(split)
        }
      }

      const distancesToKeep = new Set(splitsToSave.map((s) => s.distance))
      const splitsToDelete = (currentSplits || [])
        .filter((s: any) => !distancesToKeep.has(s.distance))
        .map((s: any) => s.relay_splits_id)

      if (splitsToDelete.length > 0) {
        await supabase.from('relay_splits').delete().in('relay_splits_id', splitsToDelete)
      }

      for (const split of splitsToUpdate) {
        await supabase.from('relay_splits').update({ split_time: split.split_time }).eq('relay_splits_id', split.relay_splits_id)
      }

      if (splitsToInsert.length > 0) {
        await supabase.from('relay_splits').insert(
          splitsToInsert.map((s) => ({
            splits_relay_res_id: s.splits_relay_res_id,
            distance: s.distance,
            split_time: s.split_time,
          }))
        )
      }

      setSelectedRelayResult(null)
      setRelaySplitInputs([])
      setEditingRelaySplits(false)
    } catch {
      Alert.alert('Error', 'Error saving relay splits. Please try again.')
    } finally {
      setSavingRelaySplits(false)
    }
  }

  function closeResultsView() {
    setViewingResults(false)
    setEvents([])
    setResults([])
    setRelayResults([])
    setSelectedResult(null)
    setEditingResult(null)
    setResultTimeInput('')
    setResultSplitInputs([])
  }

  function closeEntriesView() {
    setViewingEntries(false)
    setEntryEvents([])
    setEntryResults([])
    setEntryRelayResults([])
  }


  function handleAddNewMeet() {
    setCreateForm({ meet_name: '', pool_name: '', place: '', nation: '', min_date: '', max_date: '', meet_course: 1 })
    setSelectedGroupIds(new Set())
    setCreatingMeet(true)
  }

  async function handleCreateMeet() {
    if (!createForm.meet_name || !createForm.min_date || !createForm.max_date) {
      Alert.alert('Validation', 'Please fill in all required fields')
      return
    }

    try {
      const { data: meetData, error: meetError } = await supabase
        .from('meets')
        .insert([
          {
            meet_name: createForm.meet_name,
            pool_name: createForm.pool_name || '',
            place: createForm.place || '',
            nation: createForm.nation || '',
            min_date: createForm.min_date,
            max_date: createForm.max_date,
            meet_course: createForm.meet_course || 1,
          },
        ])
        .select()
        .single()

      if (meetError) throw meetError

      if (selectedGroupIds.size > 0 && meetData) {
        const groupInserts = Array.from(selectedGroupIds).map((group_id) => ({ meet_id: meetData.meet_id, group_id }))
        const { error: groupError } = await supabase.from('meet_groups').insert(groupInserts)
        if (groupError) throw groupError
      }

      await fetchMeets()
      setCreatingMeet(false)
      setCreateForm({})
      setSelectedGroupIds(new Set())
    } catch {
      Alert.alert('Error', 'Failed to create meet')
    }
  }

  async function handleViewEvents(meet: Meet) {
    setSelectedMeet(meet)
    setViewingEvents(true)
    setLoadingEvents(true)
    setLoadingRaces(true)

    try {
      const { data: meetGroupsData } = await supabase.from('meet_groups').select('group_id').eq('meet_id', meet.meet_id)
      const meetGroupIds = meetGroupsData?.map((mg: any) => mg.group_id) || []

      if (meetGroupIds.length > 0) {
        const { data: groupsData } = await supabase.from('_groups').select('*').in('id', meetGroupIds).order('id', { ascending: true })
        setAvailableGroups(groupsData || [])
      } else {
        setAvailableGroups([])
      }

      const { data: eventsData } = await supabase.rpc('get_meet_events_with_details', { p_meet_id: meet.meet_id })

      const eventsWithRaces: EventWithRace[] = (eventsData || []).map((e: any) => ({
        ms_id: e.ms_id,
        meet_id: e.meet_id,
        event_numb: e.event_numb,
        ms_race_id: e.ms_race_id,
        gender: e.gender,
        ms_group_id: e.ms_group_id,
        created_at: e.created_at,
        race: e.race_id
          ? {
              race_id: e.race_id,
              race_id_fin: e.race_id_fin,
              distance: e.distance,
              stroke_short_en: e.stroke_short_en,
              stroke_long_en: e.stroke_long_en,
              stroke_long_it: e.stroke_long_it,
              relay_count: e.relay_count,
            }
          : undefined,
        group: e.group_id ? { id: e.group_id, group_name: e.group_name } : undefined,
        group_ids: e.group_ids || [],
        group_names: e.group_names || [],
      }))

      setMeetEvents(eventsWithRaces)
      await fetchEventEntryCounts(meet.meet_id)

      const relayCount = raceTypeFilter === 'IND' ? 1 : 4
      const { data: filteredRacesData } = await supabase
        .from('_races')
        .select('*')
        .eq('relay_count', relayCount)
        .order('race_id_fin', { ascending: true })

      setAvailableRaces(filteredRacesData || [])
      setLoadingRaces(false)
    } catch {
      setAvailableGroups([])
      setMeetEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  async function handleAddEvent() {
    if (!selectedMeet) return

    if (availableGroups.length === 0) {
      const { data: groupsData } = await supabase.from('_groups').select('*').order('id', { ascending: true })
      setAvailableGroups(groupsData || [])
    }

    const previousRaceId = eventForm.ms_race_id || availableRaces[0]?.race_id || 0
    const previousGender = eventForm.gender || 'M'
    const newGender = previousGender === 'M' ? 'W' : 'M'

    setEventForm({
      meet_id: selectedMeet.meet_id,
      event_numb: meetEvents.length > 0 ? Math.max(...meetEvents.map((e) => e.event_numb)) + 1 : 1,
      ms_race_id: previousRaceId,
      gender: newGender,
    })
    setSelectedEventGroupIds(new Set())
    setCreatingEvent(true)
  }

  function handleEditEvent(event: EventWithRace) {
    setEditingEvent(event)
    setEventForm({
      meet_id: event.meet_id,
      event_numb: event.event_numb,
      ms_race_id: event.ms_race_id,
      gender: event.gender,
      ms_group_id: event.ms_group_id,
    })

    if (event.group_ids && event.group_ids.length > 0) {
      setSelectedEventGroupIds(new Set(event.group_ids))
    } else {
      setSelectedEventGroupIds(new Set())
    }
  }

  async function handleSaveEvent() {
    if (!eventForm.meet_id || !eventForm.event_numb || !eventForm.ms_race_id) {
      Alert.alert('Validation', 'Please fill in all required fields')
      return
    }

    if (selectedEventGroupIds.size === 0) {
      Alert.alert('Validation', 'Please select at least one group')
      return
    }

    try {
      let eventMsId: number
      const firstGroupId = Array.from(selectedEventGroupIds)[0]

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            ms_race_id: eventForm.ms_race_id,
            gender: eventForm.gender,
            ms_group_id: firstGroupId,
            event_numb: eventForm.event_numb,
          })
          .eq('ms_id', editingEvent.ms_id)

        if (error) throw error
        eventMsId = editingEvent.ms_id
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([
            {
              meet_id: eventForm.meet_id,
              event_numb: eventForm.event_numb,
              ms_race_id: eventForm.ms_race_id,
              gender: eventForm.gender,
              ms_group_id: firstGroupId,
            },
          ])
          .select()
          .single()

        if (error) throw error
        eventMsId = data.ms_id
      }

      await supabase.from('event_groups').delete().eq('ms_id', eventMsId)

      if (selectedEventGroupIds.size > 0) {
        const groupInserts = Array.from(selectedEventGroupIds).map((group_id) => ({ ms_id: eventMsId, group_id }))
        await supabase.from('event_groups').insert(groupInserts)
      }

      if (selectedMeet) {
        await handleViewEvents(selectedMeet)
      }

      setEditingEvent(null)
      setCreatingEvent(false)
      setSelectedEventGroupIds(new Set())
    } catch {
      Alert.alert('Error', 'Failed to save event')
    }
  }

  async function handleDeleteEvent(event: EventWithRace) {
    const confirmed = await confirmAction('Delete Event', `Are you sure you want to delete Event #${event.event_numb}?`)
    if (!confirmed) return

    try {
      const { error } = await supabase.from('events').delete().eq('ms_id', event.ms_id)
      if (error) throw error

      if (selectedMeet) {
        await handleViewEvents(selectedMeet)
      }
    } catch {
      Alert.alert('Error', 'Failed to delete event')
    }
  }

  function closeEventsView() {
    setViewingEvents(false)
    setMeetEvents([])
    setAvailableRaces([])
    setEditingEvent(null)
    setCreatingEvent(false)
    setEventForm({})
    setRaceTypeFilter('IND')
    setSelectedMeet(null)
  }

  async function handleAddEntriesForEvent(event: EventWithRace) {
    if (event.race && event.race.relay_count > 1) {
      Alert.alert('Info', 'Relay entries are not supported in this screen yet.')
      return
    }

    setAddingEntriesForEvent(event)
    setLoadingEventAthletes(true)
    setSelectedAthletes(new Set())

    try {
      if (!selectedSeason || !selectedMeet) return

      const { data: existingResults } = await supabase
        .from('results')
        .select('fincode')
        .eq('meet_id', selectedMeet.meet_id)
        .eq('event_numb', event.event_numb)

      const { data: athletesData, error: athletesError } = await supabase.rpc('eligible_athletes', {
        p_season_id: selectedSeason.season_id,
        p_event_gender: event.gender,
        p_event_ms_id: event.ms_id,
        p_race_id: event.ms_race_id,
        p_meet_course: selectedMeet.meet_course,
      })

      if (athletesError) throw athletesError

      const athletesWithPB = (athletesData || []).map((athlete: any) => ({
        fincode: athlete.fincode,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        gender: athlete.gender,
        group_id: athlete.group_id,
        personalBest: athlete.personal_best,
        formattedPersonalBest: athlete.pb_string,
        personalBestResId: athlete.pb_res_id,
      }))

      setEventAthletes(athletesWithPB)

      if (existingResults && existingResults.length > 0) {
        const existingFincodes = new Set(existingResults.map((r: any) => r.fincode))
        setSelectedAthletes(existingFincodes)
        setOriginalEntries(existingFincodes)
      } else {
        setOriginalEntries(new Set())
      }
    } catch {
      setEventAthletes([])
    } finally {
      setLoadingEventAthletes(false)
    }
  }

  function toggleAthleteSelection(fincode: number) {
    const newSelected = new Set(selectedAthletes)
    if (newSelected.has(fincode)) newSelected.delete(fincode)
    else newSelected.add(fincode)
    setSelectedAthletes(newSelected)
  }

  async function handleSaveEventEntries() {
    if (!selectedMeet || !addingEntriesForEvent) return

    setSavingEventEntries(true)
    try {
      const toAdd = [...selectedAthletes].filter((fc) => !originalEntries.has(fc))
      const toRemove = [...originalEntries].filter((fc) => !selectedAthletes.has(fc))

      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('results')
          .delete()
          .eq('meet_id', selectedMeet.meet_id)
          .eq('event_numb', addingEntriesForEvent.event_numb)
          .in('fincode', toRemove)

        if (deleteError) throw deleteError
      }

      if (toAdd.length > 0) {
        const entriesToInsert = toAdd.map((fincode) => {
          const athlete = eventAthletes.find((a) => a.fincode === fincode)
          return {
            fincode,
            meet_id: selectedMeet.meet_id,
            event_numb: addingEntriesForEvent.event_numb,
            res_time_decimal: 0,
            entry_time_decimal: athlete?.personalBest || 0,
            entry_time_res_id: athlete?.personalBestResId || null,
          }
        })

        const { error: insertError } = await supabase.from('results').insert(entriesToInsert)
        if (insertError) throw insertError
      }

      await fetchEventEntryCounts(selectedMeet.meet_id)

      setAddingEntriesForEvent(null)
      setSelectedAthletes(new Set())
      setOriginalEntries(new Set())
      setEventAthletes([])
      Alert.alert('Success', 'Entries updated')
    } catch {
      Alert.alert('Error', 'Failed to save entries')
    } finally {
      setSavingEventEntries(false)
    }
  }

  function closeEventEntriesModal() {
    setAddingEntriesForEvent(null)
    setSelectedAthletes(new Set())
    setEventAthletes([])
  }

  async function fetchEventEntryCounts(meetId: number) {
    try {
      const { data: entriesData } = await supabase.from('results').select('event_numb').eq('meet_id', meetId)

      const counts = new Map<number, number>()
      entriesData?.forEach((entry: any) => {
        counts.set(entry.event_numb, (counts.get(entry.event_numb) || 0) + 1)
      })

      const { data: relayData } = await supabase.from('relay_results').select('event_numb').eq('meet_id', meetId)
      relayData?.forEach((entry: any) => {
        counts.set(entry.event_numb, (counts.get(entry.event_numb) || 0) + 1)
      })

      setEventEntryCounts(counts)
    } catch {
      setEventEntryCounts(new Map())
    }
  }

  async function handleEditResult(result: ResultWithAthlete) {
    setEditingResult(result)
    setResultTimeInput(result.res_time_decimal === 0 ? '' : millisecondsToTimeString(result.res_time_decimal))

    if (result.event?.race?.distance) {
      const splitDistances = generateSplitDistances(result.event.race.distance)

      try {
        const { data: existingSplits } = await supabase
          .from('splits')
          .select('*')
          .eq('splits_res_id', result.res_id)
          .order('distance', { ascending: true })

        const inputs = splitDistances.map((distance) => {
          const existingSplit = existingSplits?.find((s: any) => s.distance === distance)
          return {
            distance,
            timeInput: existingSplit ? millisecondsToFormattedTime(existingSplit.split_time) : '',
            splits_id: existingSplit?.splits_id,
          }
        })

        setResultSplitInputs(inputs)
      } catch {
        setResultSplitInputs(splitDistances.map((distance) => ({ distance, timeInput: '' })))
      }
    } else {
      setResultSplitInputs([])
    }
  }

  async function handleSaveResultTime(timeOverride?: string, statusOverride?: ResultStatus) {
    if (!editingResult) return

    const timeToUse = timeOverride ?? resultTimeInput
    const statusToUse = statusOverride ?? 'FINISHED'
    const milliseconds = statusToUse !== 'FINISHED' ? 0 : timeStringToMilliseconds(timeToUse)

    if (statusToUse === 'FINISHED' && milliseconds === 0 && timeToUse !== '000000') {
      Alert.alert('Validation', 'Invalid time format. Please use mmsshh (e.g., 012345 for 1:23.45)')
      return
    }

    let statusNumeric: number
    switch (statusToUse) {
      case 'DSQ':
        statusNumeric = 1
        break
      case 'DNF':
        statusNumeric = 2
        break
      case 'DNS':
        statusNumeric = 3
        break
      case 'FINISHED':
      default:
        statusNumeric = 4
        break
    }

    try {
      const { error } = await supabase
        .from('results')
        .update({ res_time_decimal: milliseconds, status: statusNumeric })
        .eq('res_id', editingResult.res_id)

      if (error) throw error

      if (statusToUse === 'FINISHED' && resultSplitInputs.length > 0) {
        const splitsToSave = resultSplitInputs
          .filter((input) => input.timeInput.trim() !== '')
          .map((input) => ({
            splits_res_id: editingResult.res_id,
            distance: input.distance,
            split_time: formattedTimeToMilliseconds(input.timeInput),
            splits_id: input.splits_id,
          }))

        const existingSplitIds = splitsToSave.filter((split) => split.splits_id).map((split) => split.splits_id!)

        const { data: currentSplits } = await supabase
          .from('splits')
          .select('splits_id')
          .eq('splits_res_id', editingResult.res_id)

        if (currentSplits) {
          const splitsToDelete = currentSplits
            .filter((split: any) => !existingSplitIds.includes(split.splits_id))
            .map((split: any) => split.splits_id)

          if (splitsToDelete.length > 0) {
            await supabase.from('splits').delete().in('splits_id', splitsToDelete)
          }
        }

        for (const split of splitsToSave) {
          if (split.splits_id) {
            await supabase
              .from('splits')
              .update({ distance: split.distance, split_time: split.split_time, updated_at: new Date().toISOString() })
              .eq('splits_id', split.splits_id)
          } else {
            await supabase
              .from('splits')
              .insert({ splits_res_id: split.splits_res_id, distance: split.distance, split_time: split.split_time })
          }
        }
      }

      const formattedTime = milliseconds > 0 ? await formatTimeWithSupabase(milliseconds) : ''
      setResults((prevResults) =>
        prevResults.map((r) =>
          r.res_id === editingResult.res_id
            ? { ...r, res_time_decimal: milliseconds, status: statusNumeric, result_status: statusToUse, formattedTime }
            : r
        )
      )

      setEditingResult(null)
      setResultTimeInput('')
      setResultSplitInputs([])
    } catch {
      Alert.alert('Error', 'Failed to update result')
    }
  }

  async function handleDeleteResult(result: ResultWithAthlete) {
    const confirmed = await confirmAction(
      'Delete Result',
      `Delete result for ${result.athlete?.firstname || ''} ${result.athlete?.lastname || ''}?`
    )
    if (!confirmed) return

    try {
      const { error } = await supabase.from('results').delete().eq('res_id', result.res_id)
      if (error) throw error

      setResults((prevResults) => prevResults.filter((r) => r.res_id !== result.res_id))
    } catch {
      Alert.alert('Error', 'Failed to delete result')
    }
  }

  async function handleEditRelayResult(relayResult: RelayResultWithEvent) {
    setEditingRelayResult(relayResult)
    setRelayLegInputs({
      leg1: relayResult.leg1_res_time === 0 ? '' : millisecondsToTimeString(relayResult.leg1_res_time),
      leg2: relayResult.leg2_res_time === 0 ? '' : millisecondsToTimeString(relayResult.leg2_res_time),
      leg3: relayResult.leg3_res_time === 0 ? '' : millisecondsToTimeString(relayResult.leg3_res_time),
      leg4: relayResult.leg4_res_time === 0 ? '' : millisecondsToTimeString(relayResult.leg4_res_time),
    })
  }

  async function handleSaveRelayResult(statusOverride?: ResultStatus) {
    if (!editingRelayResult) return

    const statusToUse = statusOverride || 'FINISHED'

    let leg1Time = 0
    let leg2Time = 0
    let leg3Time = 0
    let leg4Time = 0

    if (statusToUse === 'FINISHED') {
      leg1Time = timeStringToMilliseconds(relayLegInputs.leg1)
      leg2Time = timeStringToMilliseconds(relayLegInputs.leg2)
      leg3Time = timeStringToMilliseconds(relayLegInputs.leg3)
      leg4Time = timeStringToMilliseconds(relayLegInputs.leg4)

      if (leg1Time === 0 && relayLegInputs.leg1 !== '000000') {
        Alert.alert('Validation', 'Invalid time format for Leg 1')
        return
      }
      if (leg2Time === 0 && relayLegInputs.leg2 !== '000000') {
        Alert.alert('Validation', 'Invalid time format for Leg 2')
        return
      }
      if (leg3Time === 0 && relayLegInputs.leg3 !== '000000') {
        Alert.alert('Validation', 'Invalid time format for Leg 3')
        return
      }
      if (leg4Time === 0 && relayLegInputs.leg4 !== '000000') {
        Alert.alert('Validation', 'Invalid time format for Leg 4')
        return
      }
    }

    let statusNumeric: number
    switch (statusToUse) {
      case 'DSQ':
        statusNumeric = 1
        break
      case 'DNF':
        statusNumeric = 2
        break
      case 'DNS':
        statusNumeric = 3
        break
      case 'FINISHED':
      default:
        statusNumeric = 4
        break
    }

    try {
      const { error } = await supabase
        .from('relay_results')
        .update({
          leg1_res_time: leg1Time,
          leg2_res_time: leg2Time,
          leg3_res_time: leg3Time,
          leg4_res_time: leg4Time,
          status: statusNumeric,
        })
        .eq('relay_result_id', editingRelayResult.relay_result_id)

      if (error) throw error

      const totalTime = leg1Time + leg2Time + leg3Time + leg4Time
      const formattedTime = totalTime > 0 ? await formatTimeWithSupabase(totalTime) : ''

      setRelayResults((prevResults) =>
        prevResults.map((r) =>
          r.relay_result_id === editingRelayResult.relay_result_id
            ? {
                ...r,
                leg1_res_time: leg1Time,
                leg2_res_time: leg2Time,
                leg3_res_time: leg3Time,
                leg4_res_time: leg4Time,
                status: statusNumeric,
                totalTime,
                formattedTime,
              }
            : r
        )
      )

      setEditingRelayResult(null)
      setRelayLegInputs({ leg1: '', leg2: '', leg3: '', leg4: '' })
    } catch {
      Alert.alert('Error', 'Failed to update relay result')
    }
  }

  async function handleDeleteRelayResult(relayResult: RelayResultWithEvent) {
    const confirmed = await confirmAction('Delete Relay Result', `Delete relay result for ${relayResult.relay_name}?`)
    if (!confirmed) return

    try {
      const { error } = await supabase.from('relay_results').delete().eq('relay_result_id', relayResult.relay_result_id)
      if (error) throw error

      setRelayResults((prevResults) => prevResults.filter((r) => r.relay_result_id !== relayResult.relay_result_id))
    } catch {
      Alert.alert('Error', 'Failed to delete relay result')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading meets...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{selectedSeason?.season_name || 'Select a season in Settings'}</Text>
      </View>

      <ScrollView style={styles.content}>
        {filteredMeets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meets found</Text>
          </View>
        ) : (
          filteredMeets.map((meet) => (
            <TouchableOpacity
              key={meet.meet_id}
              style={styles.meetCard}
              onPress={() => {
                setSelectedMeet(meet)
                fetchMeetStats(meet)
              }}
              activeOpacity={0.85}
            >
              <View style={styles.meetHeader}>
                <Text style={styles.meetTitle}>{meet.meet_name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getCourseLength(meet.meet_course)}</Text>
                </View>
              </View>
              <View style={styles.meetRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#a31616" />
                <Text style={styles.meetSubText}>{meet.place || 'Unknown'}{meet.nation ? `, ${meet.nation}` : ''}</Text>
              </View>
              <View style={styles.meetRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="#c7ba02" />
                <Text style={styles.meetSubText}>
                  {new Date(meet.min_date).toLocaleDateString()} - {new Date(meet.max_date).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNewMeet}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Meet Detail Modal */}
      <Modal visible={!!selectedMeet} transparent animationType="fade" onRequestClose={() => setSelectedMeet(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedMeet(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedMeet && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMeet.meet_name}</Text>
                  <TouchableOpacity onPress={() => setSelectedMeet(null)}>
                    <MaterialCommunityIcons name="close" size={22} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Meet ID: {selectedMeet.meet_id}</Text>

                <View style={styles.modalGrid}>
                  <View style={styles.modalRowBlock}>
                    <Text style={styles.modalLabel}>Date Range</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedMeet.min_date).toLocaleDateString()} - {new Date(selectedMeet.max_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.modalRowBlock}>
                    <Text style={styles.modalLabel}>Location</Text>
                    <Text style={styles.modalValue}>
                      {selectedMeet.place || 'Unknown'}{selectedMeet.nation ? `, ${selectedMeet.nation}` : ''}
                    </Text>
                  </View>
                  <View style={styles.modalRowBlock}>
                    <Text style={styles.modalLabel}>Pool</Text>
                    <Text style={styles.modalValue}>{selectedMeet.pool_name || 'Unknown'}</Text>
                  </View>
                  <View style={styles.modalRowBlock}>
                    <Text style={styles.modalLabel}>Course</Text>
                    <Text style={styles.modalValue}>{getCourseLength(selectedMeet.meet_course)}</Text>
                  </View>
                  <View style={styles.modalRowBlock}>
                    <Text style={styles.modalLabel}>Groups</Text>
                    <Text style={styles.modalValue}>
                      {meetGroupNames.length > 0 ? meetGroupNames.join(', ') : 'All groups'}
                    </Text>
                  </View>

                  <View style={styles.modalStatsRow}>
                    <View style={styles.modalStatBlock}>
                      <Text style={styles.modalStatLabel}>Events</Text>
                      <Text style={styles.modalStatValue}>{meetStats.eventsCount}</Text>
                    </View>
                    <View style={styles.modalStatBlock}>
                      <Text style={styles.modalStatLabel}>Entries</Text>
                      <Text style={styles.modalStatValue}>{meetStats.entriesCount}</Text>
                    </View>
                    <View style={styles.modalStatBlock}>
                      <Text style={styles.modalStatLabel}>Results</Text>
                      <Text style={styles.modalStatValue}>{meetStats.resultsCount}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.modalActionsRowCentered}>
                  <TouchableOpacity style={[styles.modalActionButton, styles.modalActionEntries]} onPress={() => handleViewEntries(selectedMeet)}>
                    <Text style={styles.modalActionButtonText}>Entries</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalActionButton, styles.modalActionResults]} onPress={() => handleViewResults(selectedMeet)}>
                    <Text style={styles.modalActionButtonText}>Results</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Entries Modal */}
      <Modal visible={viewingEntries} transparent animationType="fade" onRequestClose={closeEntriesView}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeEntriesView} />
          <View style={styles.modalLargeCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Entries {selectedMeet ? `- ${selectedMeet.meet_name}` : ''}</Text>
              <TouchableOpacity onPress={closeEntriesView}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Events: {entryEvents.length || meetStats.eventsCount} • Entries: {entryResults.length + entryRelayResults.length}
            </Text>

            {loadingEntries ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.loadingText}>Loading entries...</Text>
              </View>
            ) : entryResults.length === 0 && entryRelayResults.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No entries found for this meet</Text>
              </View>
            ) : (
              <SectionList
                sections={entrySections as Array<{
                  event: EventWithRace
                  isRelayEvent: boolean | undefined
                  data: ResultSectionItem[]
                }>}
                keyExtractor={(item) =>
                  item.type === 'relay'
                    ? `relay-entry-${item.relayResult.relay_result_id}`
                    : `entry-${item.result.res_id}`
                }
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                initialNumToRender={12}
                windowSize={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section }) => {
                  const event = section.event
                  const race = event.race
                  const raceName = race
                    ? race.relay_count > 1
                      ? `${race.relay_count}x${race.distance}m ${race.stroke_long_en}`
                      : `${race.distance}m ${race.stroke_long_en}`
                    : `Event ${event.event_numb}`
                  const categoryLabel = event.group_names?.length
                    ? event.group_names.join(', ')
                    : (event.group?.group_name || 'Unknown')
                  const strokeLabel = race?.stroke_short_en || race?.stroke_long_en || 'Unknown'
                  const distanceLabel = race?.distance ? `${race.distance}m` : 'Unknown'

                  return (
                    <View style={[styles.sectionCard, styles.sectionHeaderCard]}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Event #{event.event_numb} - {raceName}</Text>
                        <View style={styles.sectionMetaRow}>
                          <Text style={styles.sectionMetaText}>{distanceLabel}</Text>
                          <Text style={styles.sectionMetaText}>{strokeLabel}</Text>
                          <Text style={styles.sectionMetaText}>{event.gender || 'N/A'}</Text>
                          <Text style={styles.sectionMetaText}>{categoryLabel}</Text>
                        </View>
                      </View>
                    </View>
                  )
                }}
                renderItem={({ item }) =>
                  item.type === 'relay' ? (
                    <View style={[styles.listRow, styles.listRowStacked, styles.sectionRow]}>
                      <View style={styles.resultTopRow}>
                        <Text style={styles.rankText}>{item.rank}</Text>
                        <Text style={[styles.itemTitle, styles.relayNameText]} numberOfLines={1}>
                          {item.relayResult.relay_name}
                        </Text>
                      </View>
                      <View style={styles.resultTimeRow}>
                        <Text style={styles.timeText}>
                          {item.relayResult.formattedTime || (item.relayResult.totalTime ? formatTime(item.relayResult.totalTime) : '--:--.--')}
                        </Text>
                      </View>
                      <View style={[styles.rowActions, styles.rowActionsStacked]}>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleEditRelayResult(item.relayResult)}>
                          <Text style={styles.linkButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleDeleteRelayResult(item.relayResult)}>
                          <Text style={[styles.linkButtonText, styles.linkDanger]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.listRow, styles.listRowStacked, styles.sectionRow]}>
                      <View style={styles.resultTopRow}>
                        <Text style={styles.rankText}>{item.rank}</Text>
                        <Text style={[styles.itemTitle, styles.resultName]}>
                          {item.result.athlete?.firstname} {item.result.athlete?.lastname}
                        </Text>
                      </View>
                      <View style={styles.resultTimeRow}>
                        <Text style={styles.timeText}>
                          {item.result.formattedTime || (item.result.entry_time_decimal ? formatTime(item.result.entry_time_decimal) : '--:--.--')}
                        </Text>
                      </View>
                      <View style={[styles.rowActions, styles.rowActionsStacked]}>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleEditResult(item.result)}>
                          <Text style={styles.linkButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleDeleteResult(item.result)}>
                          <Text style={[styles.linkButtonText, styles.linkDanger]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Results Modal */}
      <Modal visible={viewingResults} transparent animationType="fade" onRequestClose={closeResultsView}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeResultsView} />
          <View style={styles.modalLargeCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Results {selectedMeet ? `- ${selectedMeet.meet_name}` : ''}</Text>
              <TouchableOpacity onPress={closeResultsView}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Events: {meetStats.eventsCount} • Entries: {meetStats.entriesCount} • Results: {meetStats.resultsCount}</Text>

            {loadingResults ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.loadingText}>Loading results...</Text>
              </View>
            ) : results.length === 0 && relayResults.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No results found for this meet</Text>
              </View>
            ) : (
              <SectionList
                sections={resultsSections as Array<{
                  event: EventWithRace
                  isRelayEvent: boolean | undefined
                  data: ResultSectionItem[]
                }>}
                keyExtractor={(item) =>
                  item.type === 'relay'
                    ? `relay-${item.relayResult.relay_result_id}`
                    : `res-${item.result.res_id}`
                }
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                initialNumToRender={12}
                windowSize={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section }) => {
                  const event = section.event
                  const race = event.race
                  const raceName = race
                    ? race.relay_count > 1
                      ? `${race.relay_count}x${race.distance}m ${race.stroke_long_en}`
                      : `${race.distance}m ${race.stroke_long_en}`
                    : `Event ${event.event_numb}`
                  const categoryLabel = event.group_names?.length
                    ? event.group_names.join(', ')
                    : (event.group?.group_name || 'Unknown')
                  const strokeLabel = race?.stroke_short_en || race?.stroke_long_en || 'Unknown'
                  const distanceLabel = race?.distance ? `${race.distance}m` : 'Unknown'

                  return (
                    <View style={[styles.sectionCard, styles.sectionHeaderCard]}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Event #{event.event_numb} - {raceName}</Text>
                        <View style={styles.sectionMetaRow}>
                          <Text style={styles.sectionMetaText}>{event.gender || 'N/A'}</Text>
                          <Text style={styles.sectionMetaText}>{categoryLabel}</Text>
                        </View>
                      </View>
                    </View>
                  )
                }}
                renderItem={({ item }) =>
                  item.type === 'relay' ? (
                    <View style={[styles.listRow, styles.listRowStacked, styles.sectionRow]}>
                      <TouchableOpacity style={styles.resultTopRow} onPress={() => handleViewRelaySplits(item.relayResult)}>
                        <Text style={styles.rankText}>{item.rank}</Text>
                        <Text style={[styles.itemTitle, styles.relayNameText]} numberOfLines={1}>
                          {item.relayResult.relay_name}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.resultTimeRow}>
                        <Text style={styles.timeText}>
                          {item.relayResult.result_status === 'FINISHED'
                            ? item.relayResult.formattedTime || formatTime(item.relayResult.totalTime || 0)
                            : item.relayResult.result_status}
                        </Text>
                      </View>
                      <View style={[styles.rowActions, styles.rowActionsStacked]}>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleEditRelayResult(item.relayResult)}>
                          <Text style={styles.linkButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleDeleteRelayResult(item.relayResult)}>
                          <Text style={[styles.linkButtonText, styles.linkDanger]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.listRow, styles.listRowStacked, styles.sectionRow]}>
                      <TouchableOpacity style={styles.resultTopRow} onPress={() => handleViewSplits(item.result)}>
                        <Text style={styles.rankText}>{item.rank}</Text>
                        <Text style={[styles.itemTitle, styles.resultName]}>
                          {item.result.athlete?.firstname} {item.result.athlete?.lastname}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.resultTimeRow}>
                        <Text style={styles.timeText}>{formatResultDisplay(item.result)}</Text>
                      </View>
                      <View style={[styles.rowActions, styles.rowActionsStacked]}>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleEditResult(item.result)}>
                          <Text style={styles.linkButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleDeleteResult(item.result)}>
                          <Text style={[styles.linkButtonText, styles.linkDanger]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Events Modal */}
      <Modal visible={viewingEvents} transparent animationType="fade" onRequestClose={closeEventsView}>
        <Pressable style={styles.modalOverlay} onPress={closeEventsView}>
          <Pressable style={styles.modalLargeCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Events {selectedMeet ? `- ${selectedMeet.meet_name}` : ''}</Text>
              <TouchableOpacity onPress={closeEventsView}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {loadingEvents ? (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color="#0284c7" />
                  <Text style={styles.loadingText}>Loading events...</Text>
                </View>
              ) : meetEvents.length === 0 ? (
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No events scheduled for this meet</Text>
                </View>
              ) : (
                <FlatList
                  data={sortedMeetEvents}
                  keyExtractor={(event) => event.ms_id.toString()}
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  initialNumToRender={8}
                  windowSize={8}
                  removeClippedSubviews
                  renderItem={({ item: event }) => {
                    const race = event.race
                    const raceName = race
                      ? race.relay_count > 1
                        ? `${race.relay_count}x${race.distance}m ${race.stroke_long_en}`
                        : `${race.distance}m ${race.stroke_long_en}`
                      : 'Unknown Race'
                    const entryCount = eventEntryCounts.get(event.event_numb) || 0
                    const categoryLabel = event.group_names?.length
                      ? event.group_names.join(', ')
                      : (event.group?.group_name || 'Unknown')

                    return (
                      <View style={styles.eventCard}>
                        <View style={styles.eventTopRow}>
                          <View style={styles.eventHeaderRow}>
                            <Text style={styles.rankText} numberOfLines={1}>#{event.event_numb}</Text>
                            <Text style={styles.itemTitle}>{raceName}</Text>
                          </View>
                          <View style={styles.eventMetaRow}>
                            <Text style={styles.eventMetaText}>{event.gender || 'N/A'}</Text>
                            <Text style={styles.eventMetaText}>{categoryLabel}</Text>
                            <Text style={styles.eventMetaText}>{entryCount} entries</Text>
                          </View>
                        </View>
                        <View style={styles.rowActions}>
                          <TouchableOpacity style={styles.linkButton} onPress={() => handleAddEntriesForEvent(event)}>
                            <Text style={styles.linkButtonText}>Entries</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.linkButton} onPress={() => handleEditEvent(event)}>
                            <Text style={styles.linkButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.linkButton} onPress={() => handleDeleteEvent(event)}>
                            <Text style={[styles.linkButtonText, styles.linkDanger]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )
                  }}
                />
              )}
            </View>
            <TouchableOpacity style={styles.modalFab} onPress={handleAddEvent}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Create Meet Modal */}
      <Modal visible={creatingMeet} transparent animationType="fade" onRequestClose={() => {
        setCreatingMeet(false)
      }}>
        <Pressable style={styles.modalOverlay} onPress={() => {
          setCreatingMeet(false)
        }}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Meet</Text>
              <TouchableOpacity onPress={() => {
                setCreatingMeet(false)
              }}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator persistentScrollbar>
              <Text style={styles.inputLabel}>Meet Name *</Text>
              <TextInput
                style={styles.input}
                value={createForm.meet_name || ''}
                onChangeText={(text) => setCreateForm({ ...createForm, meet_name: text })}
                placeholder="Meet name"
              />

              <View style={styles.inputRow}>
                <View style={styles.inputColumnLarge}>
                  <Text style={styles.inputLabel}>Place</Text>
                  <TextInput
                    style={styles.input}
                    value={createForm.place || ''}
                    onChangeText={(text) => setCreateForm({ ...createForm, place: text })}
                    placeholder="City"
                  />
                </View>
                <View style={styles.inputColumnSmall}>
                  <Text style={styles.inputLabel}>Nation</Text>
                  <TextInput
                    style={styles.input}
                    value={createForm.nation || ''}
                    onChangeText={(text) => setCreateForm({ ...createForm, nation: text })}
                    placeholder="Country"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Pool Name</Text>
              <TextInput
                style={styles.input}
                value={createForm.pool_name || ''}
                onChangeText={(text) => setCreateForm({ ...createForm, pool_name: text })}
                placeholder="Pool name"
              />

              <Text style={styles.inputLabel}>Course</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, createForm.meet_course === 1 && styles.filterButtonActive]}
                  onPress={() => setCreateForm({ ...createForm, meet_course: 1 })}
                >
                  <Text style={[styles.filterButtonText, createForm.meet_course === 1 && styles.filterButtonTextActive]}>
                    50m
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, createForm.meet_course === 2 && styles.filterButtonActive]}
                  onPress={() => setCreateForm({ ...createForm, meet_course: 2 })}
                >
                  <Text style={[styles.filterButtonText, createForm.meet_course === 2 && styles.filterButtonTextActive]}>
                    25m
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Start Date *</Text>
              <TextInput
                style={styles.input}
                value={createForm.min_date || ''}
                onChangeText={(text) => setCreateForm({ ...createForm, min_date: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>End Date *</Text>
              <TextInput
                style={styles.input}
                value={createForm.max_date || ''}
                onChangeText={(text) => setCreateForm({ ...createForm, max_date: text })}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.modalActionsRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleCreateMeet}>
                  <Text style={styles.primaryButtonText}>Create Meet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setCreatingMeet(false)
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Entries Modal */}
      <Modal visible={!!addingEntriesForEvent} transparent animationType="fade" onRequestClose={closeEventEntriesModal}>
        <Pressable style={styles.modalOverlay} onPress={closeEventEntriesModal}>
          <Pressable style={styles.modalLargeCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Entries</Text>
              <TouchableOpacity onPress={closeEventEntriesModal}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {loadingEventAthletes ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.loadingText}>Loading athletes...</Text>
              </View>
            ) : eventAthletes.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No eligible athletes found</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {eventAthletes.map((athlete) => {
                  const isSelected = selectedAthletes.has(athlete.fincode)
                  return (
                    <TouchableOpacity
                      key={athlete.fincode}
                      style={[styles.selectRow, isSelected && styles.selectRowActive]}
                      onPress={() => toggleAthleteSelection(athlete.fincode)}
                    >
                      <View style={styles.flexRow}>
                        <MaterialCommunityIcons name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={isSelected ? '#0284c7' : '#94a3b8'} />
                        <View>
                          <Text style={styles.itemTitle}>{athlete.firstname} {athlete.lastname}</Text>
                          <Text style={styles.itemSubText}>FIN: {athlete.fincode}</Text>
                        </View>
                      </View>
                      <Text style={styles.timeText}>{athlete.formattedPersonalBest || (athlete.personalBest ? formatTime(athlete.personalBest) : 'No PB')}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            )}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSaveEventEntries} disabled={savingEventEntries || selectedAthletes.size === 0}>
                <Text style={styles.primaryButtonText}>{savingEventEntries ? 'Saving...' : `Add ${selectedAthletes.size} Entries`}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Result Modal */}
      <Modal visible={!!editingResult} transparent animationType="fade" onRequestClose={() => setEditingResult(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditingResult(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Result Time</Text>
              <TouchableOpacity onPress={() => setEditingResult(null)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{editingResult?.athlete?.firstname} {editingResult?.athlete?.lastname}</Text>

            <Text style={styles.inputLabel}>Time (mmsshh)</Text>
            <TextInput
              style={styles.input}
              value={resultTimeInput}
              onChangeText={setResultTimeInput}
              placeholder="012345"
              maxLength={6}
              keyboardType="numeric"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => handleSaveResultTime()}>
                <Text style={styles.primaryButtonText}>Save Time</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingResult(null)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusRow}>
              <TouchableOpacity style={styles.dangerButton} onPress={() => handleSaveResultTime('', 'DSQ')}>
                <Text style={styles.dangerButtonText}>DSQ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={() => handleSaveResultTime('', 'DNF')}>
                <Text style={styles.dangerButtonText}>DNF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={() => handleSaveResultTime('', 'DNS')}>
                <Text style={styles.dangerButtonText}>DNS</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Relay Result Modal */}
      <Modal visible={!!editingRelayResult} transparent animationType="fade" onRequestClose={() => setEditingRelayResult(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditingRelayResult(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Relay Times</Text>
              <TouchableOpacity onPress={() => setEditingRelayResult(null)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{editingRelayResult?.relay_name}</Text>

            {(['leg1', 'leg2', 'leg3', 'leg4'] as const).map((leg, idx) => (
              <View key={leg}>
                <Text style={styles.inputLabel}>Leg {idx + 1} Time (mmsshh)</Text>
                <TextInput
                  style={styles.input}
                  value={relayLegInputs[leg]}
                  onChangeText={(text) => setRelayLegInputs({ ...relayLegInputs, [leg]: text })}
                  placeholder="012345"
                  maxLength={6}
                  keyboardType="numeric"
                />
              </View>
            ))}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => handleSaveRelayResult()}>
                <Text style={styles.primaryButtonText}>Save Times</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingRelayResult(null)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusRow}>
              <TouchableOpacity style={styles.dangerButton} onPress={() => handleSaveRelayResult('DSQ')}>
                <Text style={styles.dangerButtonText}>DSQ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={() => handleSaveRelayResult('DNF')}>
                <Text style={styles.dangerButtonText}>DNF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={() => handleSaveRelayResult('DNS')}>
                <Text style={styles.dangerButtonText}>DNS</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Splits View Modal */}
      <Modal visible={!!selectedResult} transparent animationType="fade" onRequestClose={() => setSelectedResult(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedResult(null)}>
          <Pressable style={styles.modalLargeCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Splits {selectedResult ? `- ${selectedResult.result.athlete?.firstname} ${selectedResult.result.athlete?.lastname}` : ''}
              </Text>
              <TouchableOpacity onPress={() => setSelectedResult(null)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.splitHeaderRow}>
                  <View style={[styles.splitCol, styles.splitColLeft]}>
                    <Text style={styles.splitHeaderText}>Distance</Text>
                  </View>
                  <View style={styles.splitCol}>
                    <Text style={styles.splitHeaderText}>Split</Text>
                  </View>
                  <View style={styles.splitCol}>
                    <Text style={styles.splitHeaderText}>Lap</Text>
                  </View>
                </View>
                {splitInputs.map((input, idx) => {
                  const existingSplit = selectedResult?.splits.find((s) => s.distance === input.distance)
                  const currentTimeRaw = existingSplit?.formattedTime || input.timeInput
                  const currentTimeStr = currentTimeRaw ? formattedTimeToDisplay(currentTimeRaw) : ''
                  const currentMs = currentTimeStr ? formattedTimeToMilliseconds(currentTimeStr) : 0
                  const prevInput = idx > 0 ? splitInputs[idx - 1] : undefined
                  const prevExistingSplit = prevInput
                    ? selectedResult?.splits.find((s) => s.distance === prevInput.distance)
                    : undefined
                  const prevTimeRaw = prevExistingSplit?.formattedTime || prevInput?.timeInput
                  const prevTimeStr = prevTimeRaw ? formattedTimeToDisplay(prevTimeRaw) : ''
                  const prevMs = prevTimeStr ? formattedTimeToMilliseconds(prevTimeStr) : 0
                  const lapMs = currentMs > 0 && (idx === 0 || prevMs > 0) ? currentMs - (idx === 0 ? 0 : prevMs) : 0
                  const lapDisplay = lapMs > 0 ? formatTime(lapMs) : '--:--.--'

                  return (
                    <View key={`${input.distance}-${idx}`} style={styles.splitRow}>
                      <View style={[styles.splitCol, styles.splitColLeft]}>
                        <Text style={styles.splitDistance}>{input.distance}m</Text>
                      </View>
                      <View style={styles.splitCol}>
                        {editingSplits ? (
                          <TextInput
                            style={styles.splitInput}
                            value={input.timeInput}
                            onChangeText={(text) => {
                              const newInputs = [...splitInputs]
                              newInputs[idx].timeInput = text
                              setSplitInputs(newInputs)
                            }}
                            placeholder="mm:ss.cc"
                            keyboardType="numeric"
                          />
                        ) : (
                          <Text style={styles.splitValue}>
                            {existingSplit?.formattedTime || (input.timeInput ? formattedTimeToDisplay(input.timeInput) : '--:--.--')}
                          </Text>
                        )}
                      </View>
                      <View style={styles.splitCol}>
                        <Text style={styles.splitLapValue}>{lapDisplay}</Text>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            </View>

            <View style={styles.modalActionsRow}>
              {!editingSplits ? (
                <>
                  <TouchableOpacity style={styles.primaryButton} onPress={() => setEditingSplits(true)}>
                    <Text style={styles.primaryButtonText}>Edit Splits</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryButton, styles.closeActionButton]} onPress={() => setSelectedResult(null)}>
                    <Text style={[styles.secondaryButtonText, styles.closeActionButtonText]}>Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleSaveSplits}>
                    <Text style={styles.primaryButtonText}>{savingSplits ? 'Saving...' : 'Save Changes'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingSplits(false)}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Relay Splits View Modal */}
      <Modal visible={!!selectedRelayResult} transparent animationType="fade" onRequestClose={() => setSelectedRelayResult(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedRelayResult(null)}>
          <Pressable style={styles.modalLargeCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Relay Splits {selectedRelayResult ? `- ${selectedRelayResult.relay_name}` : ''}</Text>
              <TouchableOpacity onPress={() => setSelectedRelayResult(null)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                {(selectedRelayResult
                  ? [
                      {
                        label: 'Leg 1',
                        fincode: selectedRelayResult.leg1_fincode,
                        time: selectedRelayResult.leg1_res_time,
                      },
                      {
                        label: 'Leg 2',
                        fincode: selectedRelayResult.leg2_fincode,
                        time: selectedRelayResult.leg2_res_time,
                      },
                      {
                        label: 'Leg 3',
                        fincode: selectedRelayResult.leg3_fincode,
                        time: selectedRelayResult.leg3_res_time,
                      },
                      {
                        label: 'Leg 4',
                        fincode: selectedRelayResult.leg4_fincode,
                        time: selectedRelayResult.leg4_res_time,
                      },
                    ]
                  : []
                ).map((leg, idx) => {
                  const athlete = relayAthletes.get(leg.fincode)
                  const athleteName = athlete
                    ? `${athlete.firstname} ${athlete.lastname}`
                    : leg.fincode
                      ? `FIN: ${leg.fincode}`
                      : 'Unknown'
                  const formattedTime = leg.time && leg.time > 0 ? formatTime(leg.time) : '--:--.--'

                  return (
                    <View key={`${leg.label}-${idx}`} style={styles.relayLegRow}>
                      <Text style={styles.relayLegLabel}>{leg.label}</Text>
                      <View style={styles.relayLegMeta}>
                        <Text style={styles.relayLegName} numberOfLines={1}>{athleteName}</Text>
                        <Text style={styles.relayLegTime}>{formattedTime}</Text>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={[styles.secondaryButton, styles.closeActionButton]} onPress={() => setSelectedRelayResult(null)}>
                <Text style={[styles.secondaryButtonText, styles.closeActionButtonText]}>Close</Text>
              </TouchableOpacity>
            </View>
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
    marginTop: 12,
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
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#0f172a',
  },
  actionsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
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
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'center',
  },
  closeActionButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  closeActionButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  meetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  meetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meetTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#0284c7',
    fontWeight: '700',
    fontSize: 12,
  },
  meetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  meetSubText: {
    color: '#64748b',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalLargeCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  modalGrid: {
    gap: 10,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalStatBlock: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalRowBlock: {
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 14,
    color: '#0f172a',
  },
  modalActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  modalActionsRowCentered: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalActionResults: {
    backgroundColor: '#7c3aed',
  },
  modalActionEntries: {
    backgroundColor: '#facc15',
  },
  modalBody: {
    flex: 1,
    minHeight: 0,
  },
  modalScroll: {
    marginTop: 8,
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 80,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  sectionHeader: {
    marginBottom: 8,
    paddingRight: 44,
  },
  sectionHeaderCard: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sectionMetaText: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionFab: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  eventMetaText: {
    fontSize: 12,
    color: '#64748b',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  listRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  sectionRow: {
    marginBottom: 8,
  },
  relayLegRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  relayLegLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  relayLegMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  relayLegName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  relayLegTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultName: {
    flex: 1,
  },
  resultTimeRow: {
    paddingLeft: 38,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    width: 28,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemSubText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  relayNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  relayNameText: {
    flexShrink: 1,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowActionsStacked: {
    alignSelf: 'flex-start',
  },
  modalFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  linkButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  linkButtonText: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 12,
  },
  linkDanger: {
    color: '#dc2626',
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputColumnLarge: {
    flex: 7,
  },
  inputColumnSmall: {
    flex: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 6,
    color: '#0f172a',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  centered: {
    padding: 20,
    alignItems: 'center',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 8,
  },
  selectRowActive: {
    backgroundColor: '#e0f2fe',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 8,
    gap: 8,
  },
  splitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingBottom: 6,
    gap: 8,
  },
  splitHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  splitCol: {
    flex: 1,
    alignItems: 'center',
  },
  splitColLeft: {
    alignItems: 'flex-start',
  },
  splitDistance: {
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'left',
  },
  splitInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    width: '100%',
    textAlign: 'center',
    color: '#0f172a',
  },
  splitValue: {
    fontWeight: '600',
    color: '#0f172a',
  },
  splitLapValue: {
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
})
