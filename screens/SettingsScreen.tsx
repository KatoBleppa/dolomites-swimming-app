import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useSeason } from '../contexts/SeasonContext'

export function SettingsScreen() {
  const { selectedSeason, setSelectedSeason, seasons } = useSeason()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your preferences</Text>
      </View>

      {/* Season Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Season Settings</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Active Season</Text>
            <Text style={styles.settingDescription}>Select the season for all data displays</Text>
          </View>
        </View>
        <View style={styles.seasonSelector}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {seasons.map((season) => (
              <TouchableOpacity
                key={season.season_id}
                style={[styles.seasonButton, selectedSeason?.season_id === season.season_id && styles.seasonButtonActive]}
                onPress={() => setSelectedSeason(season)}
              >
                <Text style={[styles.seasonButtonText, selectedSeason?.season_id === season.season_id && styles.seasonButtonTextActive]}>
                  {season.season_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  settingCard: {
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
  settingInfo: {
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  seasonSelector: {
    paddingVertical: 8,
  },
  seasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  seasonButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  seasonButtonText: {
    fontSize: 14,
    color: '#475569',
  },
  seasonButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
})
