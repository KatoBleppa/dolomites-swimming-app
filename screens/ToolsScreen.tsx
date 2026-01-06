import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AttTrendScreen } from './AttTrendScreen'

const Stack = createStackNavigator()

function ToolsMenuScreen({ navigation }: any) {
  const tools = [
    {
      id: 'attendance',
      title: 'Attendance Trends',
      description: 'View athlete attendance patterns over time',
      icon: 'chart-line',
      color: '#0284c7',
      screen: 'AttendanceTrends'
    },
    {
      id: 'performance',
      title: 'Performance Analysis',
      description: 'Analyze athlete performance metrics',
      icon: 'podium',
      color: '#7c3aed',
      screen: null
    },
    {
      id: 'comparison',
      title: 'Group Comparison',
      description: 'Compare statistics across groups',
      icon: 'compare',
      color: '#ea580c',
      screen: null
    },
    {
      id: 'reports',
      title: 'Reports Generator',
      description: 'Generate custom reports and exports',
      icon: 'file-document',
      color: '#16a34a',
      screen: null
    }
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analysis Tools</Text>
        <Text style={styles.subtitle}>Select a tool to get started</Text>
      </View>

      <View style={styles.toolsGrid}>
        {tools.map(tool => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            onPress={() => tool.screen && navigation.navigate(tool.screen)}
            disabled={!tool.screen}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${tool.color}15` }]}>
              <MaterialCommunityIcons name={tool.icon as any} size={32} color={tool.color} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
              {!tool.screen && (
                <Text style={styles.comingSoon}>Coming Soon</Text>
              )}
            </View>
            {tool.screen && (
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export function ToolsScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0284c7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen 
        name="ToolsMenu" 
        component={ToolsMenuScreen}
        options={{ title: 'Tools' }}
      />
      <Stack.Screen 
        name="AttendanceTrends" 
        component={AttTrendScreen}
        options={{ title: 'Attendance Trends' }}
      />
    </Stack.Navigator>
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
  toolsGrid: {
    padding: 16,
  },
  toolCard: {
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  comingSoon: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600',
    marginTop: 4,
  },
})
