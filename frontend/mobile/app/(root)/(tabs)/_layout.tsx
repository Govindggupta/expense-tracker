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
        bottom: 10,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: 'black',
        borderRadius: 40,
        height: 56,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: {
          width: 10,
          height: 10,
        },
        paddingHorizontal: 18,
        marginHorizontal: 8,
      },
      tabBarItemStyle: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      tabBarShowLabel: true,
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'gray',
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
      name="Split"
      options={{
        tabBarIcon: ({ color, size }) => <Entypo name="slideshare" size={size} color={color} />,
        tabBarLabel: 'Split',
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
        tabBarLabel: 'Categories',
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
          headerRight: () => <SearchButton className="mr-5" onClick={handleSearchButtonClick} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export default Layout;
