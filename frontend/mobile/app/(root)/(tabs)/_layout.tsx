import React from 'react';
import { Tabs } from 'expo-router';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import SearchButton from '@/components/SearchButton';

const Drawer = createDrawerNavigator();

const TabsComponent = () => (
  <Tabs
    screenOptions={{
      tabBarStyle: {
        position: 'absolute',
        boxShadow: '',
        left: 20,
        right: 20,
        elevation: 5,
        backgroundColor: 'white',
        height: 65,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: {
          width: 0,
          height: -5,
        },
        borderTopColor: 'rgba(0, 0, 0, 0.8)',
        borderTopWidth: 1,
        paddingHorizontal: 2,
      },
      tabBarItemStyle: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#2A7C76',
      tabBarInactiveTintColor: '#c9c9c9',
      tabBarLabelStyle: {
        fontSize: 11,
      },
    }}
  >
    <Tabs.Screen
      name="Expenses"
      options={{
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="clipboard-list" size={size} color={color} />
        ),
        tabBarLabel: 'Expenses',
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="Analysis"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="google-analytics" size={size} color={color} />
        ),
        tabBarLabel: 'Analysis',
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="Scan"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="image-filter-center-focus-weak" size={size} color={color} />
        ),
        tabBarLabel: 'Scan',
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="Wallet"
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        tabBarLabel: 'Wallet',
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="Categories"
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="pricetag" size={size} color={color} />,
        tabBarLabel: 'Category',
        headerShown: false,
      }}
    />
  </Tabs>
);

const Layout = () => {
  const handleSearchButtonClick = () => {
    console.log('Search button clicked');
  };

  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Expense Tracker"
        component={TabsComponent}
        options={{
          headerStyle: {
            backgroundColor: '#2A7C76',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '500',
          },
          headerRight: () => <SearchButton className="mr-5" onClick={handleSearchButtonClick} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export default Layout;
