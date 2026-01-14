import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { User, Vehicle, ServiceRecord, Appointment, Language, Theme } from '@/constants/types';

type DefaultStartScreen = 'home' | 'vehicles';

interface AppState {
  user: User | null;
  vehicles: Vehicle[];
  serviceRecords: ServiceRecord[];
  appointments: Appointment[];
  language: Language;
  theme: Theme;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  defaultStartScreen: DefaultStartScreen;
}

interface AppActions {
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addServiceRecord: (record: Omit<ServiceRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateServiceRecord: (id: string, updates: Partial<ServiceRecord>) => Promise<void>;
  deleteServiceRecord: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setDefaultStartScreen: (screen: DefaultStartScreen) => Promise<void>;
}

const STORAGE_KEYS = {
  USER: '@qaraj_user',
  VEHICLES: '@qaraj_vehicles',
  SERVICE_RECORDS: '@qaraj_service_records',
  APPOINTMENTS: '@qaraj_appointments',
  LANGUAGE: '@qaraj_language',
  THEME: '@qaraj_theme',
  ONBOARDING: '@qaraj_onboarding',
  DEFAULT_START_SCREEN: '@qaraj_default_start_screen',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const { i18n } = useTranslation();
  const [state, setState] = useState<AppState>({
    user: null,
    vehicles: [],
    serviceRecords: [],
    appointments: [],
    language: 'en',
    theme: 'dark',
    isLoading: true,
    hasCompletedOnboarding: false,
    defaultStartScreen: 'home',
  });

  const loadDataCallback = useCallback(async () => {
    try {
      const [user, vehicles, serviceRecords, appointments, language, theme, onboarding, defaultStartScreen] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.VEHICLES),
        AsyncStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS),
        AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_START_SCREEN),
      ]);

      const selectedLanguage = (language as Language) || 'en';
      
      setState({
        user: user ? JSON.parse(user) : null,
        vehicles: vehicles ? JSON.parse(vehicles) : [],
        serviceRecords: serviceRecords ? JSON.parse(serviceRecords) : [],
        appointments: appointments ? JSON.parse(appointments) : [],
        language: selectedLanguage,
        theme: (theme as Theme) || 'dark',
        isLoading: false,
        hasCompletedOnboarding: onboarding === 'true',
        defaultStartScreen: (defaultStartScreen as DefaultStartScreen) || 'home',
      });
      
      i18n.changeLanguage(selectedLanguage);
    } catch (error) {
      console.error('Failed to load data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [i18n]);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);



  const signIn = useCallback(async (user: User) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    setState(prev => ({ ...prev, user: null }));
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return;
    const updatedUser = { ...state.user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
  }, [state.user]);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => {
    if (!state.user) return;
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      userId: state.user.id,
      createdAt: new Date().toISOString(),
    };
    const updatedVehicles = [...state.vehicles, newVehicle];
    await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedVehicles));
    setState(prev => ({ ...prev, vehicles: updatedVehicles }));
  }, [state.user, state.vehicles]);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    const updatedVehicles = state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v);
    await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedVehicles));
    setState(prev => ({ ...prev, vehicles: updatedVehicles }));
  }, [state.vehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    const updatedVehicles = state.vehicles.filter(v => v.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedVehicles));
    setState(prev => ({ ...prev, vehicles: updatedVehicles }));
  }, [state.vehicles]);

  const addServiceRecord = useCallback(async (record: Omit<ServiceRecord, 'id' | 'createdAt'>) => {
    const newRecord: ServiceRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedRecords = [...state.serviceRecords, newRecord];
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(updatedRecords));
    setState(prev => ({ ...prev, serviceRecords: updatedRecords }));
  }, [state.serviceRecords]);

  const updateServiceRecord = useCallback(async (id: string, updates: Partial<ServiceRecord>) => {
    const updatedRecords = state.serviceRecords.map(r => r.id === id ? { ...r, ...updates } : r);
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(updatedRecords));
    setState(prev => ({ ...prev, serviceRecords: updatedRecords }));
  }, [state.serviceRecords]);

  const deleteServiceRecord = useCallback(async (id: string) => {
    const updatedRecords = state.serviceRecords.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(updatedRecords));
    setState(prev => ({ ...prev, serviceRecords: updatedRecords }));
  }, [state.serviceRecords]);

  const addAppointment = useCallback(async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updatedAppointments = [...state.appointments, newAppointment];
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
    setState(prev => ({ ...prev, appointments: updatedAppointments }));
  }, [state.appointments]);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    const updatedAppointments = state.appointments.map(a => a.id === id ? { ...a, ...updates } : a);
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
    setState(prev => ({ ...prev, appointments: updatedAppointments }));
  }, [state.appointments]);

  const deleteAppointment = useCallback(async (id: string) => {
    const updatedAppointments = state.appointments.filter(a => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
    setState(prev => ({ ...prev, appointments: updatedAppointments }));
  }, [state.appointments]);

  const setLanguage = useCallback(async (language: Language) => {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    await i18n.changeLanguage(language);
    setState(prev => ({ ...prev, language }));
  }, [i18n]);

  const setTheme = useCallback(async (theme: Theme) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    setState(prev => ({ ...prev, theme }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    setState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  }, []);

  const setDefaultStartScreen = useCallback(async (screen: DefaultStartScreen) => {
    await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_START_SCREEN, screen);
    setState(prev => ({ ...prev, defaultStartScreen: screen }));
  }, []);

  const actions: AppActions = useMemo(() => ({
    signIn,
    signOut,
    updateUser,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setLanguage,
    setTheme,
    completeOnboarding,
    setDefaultStartScreen,
  }), [
    signIn,
    signOut,
    updateUser,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setLanguage,
    setTheme,
    completeOnboarding,
    setDefaultStartScreen,
  ]);

  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
});
