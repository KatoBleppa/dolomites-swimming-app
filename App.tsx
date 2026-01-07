import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { SeasonProvider } from './contexts/SeasonContext'
import { ToolsScreen } from './screens/ToolsScreen'
import { AthletesScreen } from './screens/AthletesScreen'
import { RacesScreen } from './screens/RacesScreen'
import { TrainingsScreen } from './screens/TrainingsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { View, Text, StyleSheet } from 'react-native'

const Tab = createBottomTabNavigator()

// Placeholder screens for now
function HomeScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Home Screen</Text>
    </View>
  )
}

export default function App() {
  return (
    <SeasonProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home'

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline'
              } else if (route.name === 'Athletes') {
                iconName = focused ? 'account-group' : 'account-group-outline'
              } else if (route.name === 'Trainings') {
                iconName = focused ? 'swim' : 'swim'
              } else if (route.name === 'Races') {
                iconName = focused ? 'trophy' : 'trophy-outline'
              } else if (route.name === 'Tools') {
                iconName = focused ? 'chart-line' : 'chart-line-variant'
              } else if (route.name === 'Settings') {
                iconName = focused ? 'cog' : 'cog-outline'
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: '#0284c7',
            tabBarInactiveTintColor: '#94a3b8',
            headerStyle: {
              backgroundColor: '#0284c7',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '700',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Athletes" component={AthletesScreen} />
          <Tab.Screen name="Trainings" component={TrainingsScreen} />
          <Tab.Screen name="Races" component={RacesScreen} />
          <Tab.Screen 
            name="Tools" 
            component={ToolsScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SeasonProvider>
  )
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  placeholderText: {
    fontSize: 20,
    color: '#64748b',
  },
})
