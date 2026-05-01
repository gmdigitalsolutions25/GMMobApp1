import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, Platform, TextInput, Animated } from 'react-native';
import { useAlert } from '@/components/CustomAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Plus,
  Car,
  Calendar as CalendarIcon,
  Gauge,
  ChevronDown,
  Clock,
  Wrench,
  ChevronUp,
  ClipboardList,
  Trash2,
  Calculator,
  X,
  Edit2,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { mockServiceRecords } from '@/constants/mockData';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useTranslation } from 'react-i18next';

export default function VehiclesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { vehicles, theme, deleteVehicle, appointments, user, addVehicle } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [currentMileage, setCurrentMileage] = useState<string>('');
  const [runAmount, setRunAmount] = useState<string>('');
  const [runPeriod, setRunPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [predictedDate, setPredictedDate] = useState<string | null>(null);
  const shineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [hasFetchedVehicles, setHasFetchedVehicles] = useState(false);

  const vehiclesByPhoneQuery = trpc.vehicles.getByPhone.useQuery(
    { phone: user?.phone || '' },
    { 
      enabled: !!user?.phone && !hasFetchedVehicles && vehicles.length === 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (vehiclesByPhoneQuery.data && !hasFetchedVehicles) {
      console.log('Fetched vehicles from backend:', vehiclesByPhoneQuery.data);
      
      if (vehiclesByPhoneQuery.data.vehicles && vehiclesByPhoneQuery.data.vehicles.length > 0) {
        vehiclesByPhoneQuery.data.vehicles.forEach((vehicle: any) => {
          addVehicle({
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin,
            licensePlate: vehicle.licensePlate,
            photos: vehicle.photos || [],
            mileage: vehicle.mileage,
            color: vehicle.color,
          });
        });
      }
      
      setHasFetchedVehicles(true);
    }
  }, [vehiclesByPhoneQuery.data, hasFetchedVehicles, addVehicle]);

  const selectedVehicle = selectedVehicleId
    ? vehicles.find((v) => v.id === selectedVehicleId)
    : vehicles[0];

  const recommendedServices = useMemo(() => [
    t('vehicles.oilChange'), 
    t('vehicles.filterReplacement'), 
    t('vehicles.multiPointInspection')
  ], [t]);

  const hasScheduledService = useMemo(() => {
    if (!selectedVehicle) return false;
    
    return appointments.some(apt => {
      if (apt.vehicleId !== selectedVehicle.id) return false;
      if (apt.status === 'cancelled' || apt.status === 'completed') return false;
      
      const aptServices = Array.isArray(apt.serviceTypes) ? apt.serviceTypes : [apt.serviceTypes];
      return recommendedServices.some(rs => aptServices.includes(rs));
    });
  }, [appointments, selectedVehicle, recommendedServices]);



  const toggleRecord = (id: string) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const calculatePredictedDate = () => {
    if (!currentMileage || !runAmount) {
      alert(t('vehicles.enterCurrentAndRunAmount'));
      return;
    }

    const current = parseFloat(currentMileage);
    const run = parseFloat(runAmount);
    const nextService = 50200;
    
    if (isNaN(current) || isNaN(run) || run <= 0) {
      alert(t('vehicles.enterValidNumbers'));
      return;
    }

    if (current >= nextService) {
      alert(t('vehicles.mileageAlreadyPastService'));
      return;
    }

    const remainingKm = nextService - current;
    
    const weeksToService = runPeriod === 'weekly' 
      ? remainingKm / run 
      : (remainingKm / run) * (30 / 7);
    
    const daysToService = weeksToService * 7;
    
    const serviceDate = new Date();
    serviceDate.setDate(serviceDate.getDate() + Math.ceil(daysToService));
    
    const formattedDate = serviceDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    setPredictedDate(formattedDate);
    setShowPredictionModal(false);
    
    fadeAnim.setValue(0);
    shineAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const { showConfirm } = useAlert();

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;

    showConfirm(
      t('vehicles.deleteVehicle'),
      `${t('vehicles.deleteVehicleConfirm')} ${selectedVehicle.brand} ${selectedVehicle.model}?`,
      () => {
        deleteVehicle(selectedVehicle.id);
        setSelectedVehicleId(null);
      },
      undefined,
      t('common.delete'),
      t('common.cancel')
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('vehicles.myGarage')}</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-vehicle')}
        >
          <Plus size={24} color="#000000" />
          <Text style={[styles.addButtonText, { color: '#000000' }]}>{t('vehicles.addVehicle')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 1000);
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={64} color={colors.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {hasFetchedVehicles ? t('vehicles.noVehicles') : t('common.loading')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {hasFetchedVehicles ? t('vehicles.noVehiclesLinked') : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {vehicles.length > 1 && (
              <View
                style={[
                  styles.selectCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.selectLabel, { color: colors.text }]}>
                  {t('vehicles.selectVehicle')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  onPress={() => setIsDropdownOpen(true)}
                >
                  <Text style={[styles.selectText, { color: colors.text }]}>
                    {selectedVehicle
                      ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year}) - ${selectedVehicle.licensePlate}`
                      : t('vehicles.selectAVehicle')}
                  </Text>
                  <ChevronDown size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[
                styles.vehicleCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.vehicleCardHeader}>
                <View style={styles.vehicleCardHeaderLeft}>
                  <Car size={20} color={colors.text} />
                  <Text style={[styles.vehicleCardTitle, { color: colors.text }]}>
                    {t('vehicles.vehicleInformation')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={() => router.push(`/edit-vehicle?vehicleId=${selectedVehicle?.id}`)}>
                    <Edit2 size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteVehicle}>
                    <Trash2 size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.vehicleContent}>
                <TouchableOpacity
                  onPress={() => router.push(`/vehicle-photo?vehicleId=${selectedVehicle?.id}`)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={
                      (selectedVehicle?.photos?.find(p => p.isPrimary)?.uri ||
                        selectedVehicle?.photos?.[0]?.uri ||
                        (selectedVehicle as any)?.libraryImageUri)
                        ? { uri: selectedVehicle?.photos?.find(p => p.isPrimary)?.uri ||
                              selectedVehicle?.photos?.[0]?.uri ||
                              (selectedVehicle as any)?.libraryImageUri }
                        : require('@/assets/images/car-placeholder.png')
                    }
                    style={styles.vehicleImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>

                <View style={styles.vehicleDetails}>
                  <View>
                    <Text style={[styles.vehicleBrand, { color: colors.text }]}>
                      {selectedVehicle?.brand || 'N/A'}
                    </Text>
                    <Text style={[styles.vehicleBrand, { color: colors.text }]}>
                      {selectedVehicle?.model || 'N/A'}
                    </Text>
                  </View>

                  <View>
                    <Text style={[styles.vehicleYear, { color: colors.text }]}>
                      {selectedVehicle?.year || 'N/A'}
                    </Text>
                  </View>

                  <View>
                    <Text style={[styles.vehiclePlate, { color: colors.text }]}>
                      {selectedVehicle?.licensePlate || 'N/A'}
                    </Text>
                  </View>

                  {selectedVehicle?.mileage ? (
                    <View>
                      <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
                        {selectedVehicle.mileage.toLocaleString()} km
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View
              style={[
                styles.serviceReminderCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.serviceReminderHeader}>
                <View style={styles.serviceReminderHeaderLeft}>
                  <Clock size={18} color={colors.primary} />
                  <Text style={[styles.serviceReminderTitle, { color: colors.text }]}>
                    {t('vehicles.nextServiceReminder')}
                  </Text>
                </View>
                <View style={styles.serviceReminderActions}>
                  <TouchableOpacity
                    style={styles.calculatorButton}
                    onPress={() => setShowPredictionModal(true)}
                  >
                    <Calculator size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.scheduleButton,
                      { 
                        borderColor: hasScheduledService ? colors.primary : colors.border, 
                        backgroundColor: hasScheduledService ? `${colors.primary}20` : colors.background,
                      },
                    ]}
                    onPress={() => {
                      router.push({
                        pathname: '/appointments',
                        params: {
                          serviceTypes: hasScheduledService ? '' : JSON.stringify(recommendedServices),
                          date: hasScheduledService ? '' : (predictedDate || ''),
                          vehicleId: hasScheduledService ? '' : (selectedVehicle?.id || ''),
                        },
                      });
                    }}
                  >
                    <Text style={[styles.scheduleButtonText, { color: hasScheduledService ? colors.primary : colors.text }]}>
                      {hasScheduledService ? t('vehicles.scheduled') : t('vehicles.schedule')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.serviceReminderContent}>
                <View style={styles.serviceReminderRow}>
                  <Gauge size={18} color={colors.primary} />
                  <Text style={[styles.serviceReminderLabel, { color: colors.text }]}>
                    {t('vehicles.nextServiceAt')}
                  </Text>
                </View>

                <Text style={[styles.nextServiceKm, { color: colors.primary }]}>
                  50,200 km
                </Text>
                <Text style={[styles.remainingKm, { color: colors.textSecondary }]}>
                  2,400 {t('vehicles.kmRemaining')}
                </Text>
                {predictedDate && (
                  <Animated.View 
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <View style={styles.predictedDateContainer}>
                      <Animated.View
                        style={[
                          styles.shineOverlay,
                          {
                            opacity: shineAnim.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0.4, 0],
                            }),
                            transform: [
                              {
                                translateX: shineAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-100, 400],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Text style={[styles.predictedDate, { color: colors.primary }]}>
                        {t('vehicles.predictedServiceDate')} {predictedDate}
                      </Text>
                    </View>
                  </Animated.View>
                )}

                <View style={styles.recommendedServices}>
                  <View style={styles.recommendedServicesHeader}>
                    <Wrench size={16} color={colors.primary} />
                    <Text
                      style={[styles.recommendedServicesTitle, { color: colors.text }]}
                    >
                      {t('vehicles.recommendedServices')}
                    </Text>
                  </View>
                  <View style={styles.servicesList}>
                    <View style={styles.serviceItem}>
                      <View
                        style={[styles.serviceDot, { backgroundColor: colors.primary }]}
                      />
                      <Text style={[styles.serviceText, { color: colors.text }]}>
                        {t('vehicles.oilChange')}
                      </Text>
                    </View>
                    <View style={styles.serviceItem}>
                      <View
                        style={[styles.serviceDot, { backgroundColor: colors.primary }]}
                      />
                      <Text style={[styles.serviceText, { color: colors.text }]}>
                        {t('vehicles.filterReplacement')}
                      </Text>
                    </View>
                    <View style={styles.serviceItem}>
                      <View
                        style={[styles.serviceDot, { backgroundColor: colors.primary }]}
                      />
                      <Text style={[styles.serviceText, { color: colors.text }]}>
                        {t('vehicles.multiPointInspection')}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.bookServiceButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    router.push({
                      pathname: '/appointments',
                      params: {
                        serviceTypes: hasScheduledService ? '' : JSON.stringify(recommendedServices),
                        date: hasScheduledService ? '' : (predictedDate || ''),
                        vehicleId: hasScheduledService ? '' : (selectedVehicle?.id || ''),
                      },
                    });
                  }}
                >
                  <CalendarIcon size={18} color="#000000" />
                  <Text style={[styles.bookServiceButtonText, { color: '#000000' }]}>
                    {hasScheduledService ? t('vehicles.viewAppointment') : t('vehicles.bookServiceNow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[
                styles.historyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.historyHeader}>
                <View style={styles.historyHeaderLeft}>
                  <ClipboardList size={20} color={colors.text} />
                  <Text style={[styles.historyTitle, { color: colors.text }]}>
                    {t('vehicles.serviceHistoryFromCRM')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.verifiedBadge,
                    { borderColor: colors.primary, backgroundColor: `${colors.primary}20` },
                  ]}
                >
                  <Text style={[styles.verifiedText, { color: colors.primary }]}>
                    {t('vehicles.verifiedRecords')}
                  </Text>
                </View>
              </View>

              <Text style={[styles.historyDescription, { color: colors.textSecondary }]}>
                {t('vehicles.previousServiceRecords')}
              </Text>

              <View style={styles.historyList}>
                {mockServiceRecords.map((record) => {
                  const isExpanded = expandedRecords[record.id];

                  return (
                    <View
                      key={record.id}
                      style={[
                        styles.historyItem,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.historyItemHeader}
                        onPress={() => toggleRecord(record.id)}
                      >
                        <View style={styles.historyItemLeft}>
                          <Text style={[styles.historyItemTitle, { color: colors.text }]}>
                            {record.serviceName}
                          </Text>
                          <View style={styles.historyItemMeta}>
                            <View style={styles.historyMetaItem}>
                              <CalendarIcon size={14} color={colors.textSecondary} />
                              <Text
                                style={[styles.historyMetaText, { color: colors.textSecondary }]}
                              >
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </Text>
                            </View>
                            <View style={styles.historyMetaItem}>
                              <Gauge size={14} color={colors.textSecondary} />
                              <Text
                                style={[styles.historyMetaText, { color: colors.textSecondary }]}
                              >
                                {record.mileage.toLocaleString()} km
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.historyItemRight}>
                          <Text style={[styles.historyItemPrice, { color: colors.text }]}>
                            ₼{record.cost?.toFixed(0)}
                          </Text>
                          {isExpanded ? (
                            <ChevronUp size={20} color={colors.textSecondary} />
                          ) : (
                            <ChevronDown size={20} color={colors.textSecondary} />
                          )}
                        </View>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.historyItemDetails}>
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                              {t('vehicles.serviceCenter')}
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                              {record.serviceCenter}
                            </Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                              {t('vehicles.technician')}
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                              {record.technician}
                            </Text>
                          </View>

                          {record.partsUsed && record.partsUsed.length > 0 && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                {t('vehicles.partsUsed')}
                              </Text>
                              <View style={styles.partsList}>
                                {record.partsUsed.map((part, index) => (
                                  <View
                                    key={index}
                                    style={[
                                      styles.partBadge,
                                      { backgroundColor: colors.surface },
                                    ]}
                                  >
                                    <Text style={[styles.partText, { color: colors.text }]}>
                                      {part}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {record.notes && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                {t('vehicles.notes')}
                              </Text>
                              <Text style={[styles.detailValue, { color: colors.text }]}>
                                {record.notes}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('vehicles.selectVehicle')}</Text>
            <ScrollView style={styles.dropdownList}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        selectedVehicleId === vehicle.id
                          ? `${colors.primary}15`
                          : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedVehicleId(vehicle.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <Car
                      size={20}
                      color={selectedVehicleId === vehicle.id ? colors.primary : colors.text}
                    />
                    <View style={styles.dropdownItemText}>
                      <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>
                        {vehicle.brand} {vehicle.model}
                      </Text>
                      <Text style={[styles.dropdownItemSubtitle, { color: colors.textSecondary }]}>
                        {vehicle.year} • {vehicle.licensePlate}
                      </Text>
                    </View>
                  </View>
                  {selectedVehicleId === vehicle.id && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showPredictionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPredictionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPredictionModal(false)}
        >
          <View 
            style={[styles.predictionModal, { backgroundColor: colors.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.predictionHeader}>
              <Text style={[styles.predictionTitle, { color: colors.text }]}>
                {t('vehicles.serviceDatePrediction')}
              </Text>
              <TouchableOpacity onPress={() => setShowPredictionModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.predictionDescription, { color: colors.textSecondary }]}>
              {t('vehicles.enterCurrentMileage')}
            </Text>

            <View style={styles.predictionForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.predictionLabel, { color: colors.text }]}>
                  {t('vehicles.currentMileageKm')}
                </Text>
                <View style={[styles.predictionInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Gauge size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.predictionInputField, { color: colors.text }]}
                    placeholder="e.g., 47800"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={currentMileage}
                    onChangeText={setCurrentMileage}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.predictionLabel, { color: colors.text }]}>
                  {t('vehicles.averageRun')}
                </Text>
                <View style={[styles.predictionInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Gauge size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.predictionInputField, { color: colors.text }]}
                    placeholder={runPeriod === 'weekly' ? t('vehicles.kmPerWeek') : t('vehicles.kmPerMonth')}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={runAmount}
                    onChangeText={setRunAmount}
                  />
                </View>
              </View>

              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: runPeriod === 'weekly' ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setRunPeriod('weekly')}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      { color: runPeriod === 'weekly' ? '#000000' : colors.text },
                    ]}
                  >
                    {t('vehicles.weekly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: runPeriod === 'monthly' ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setRunPeriod('monthly')}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      { color: runPeriod === 'monthly' ? '#000000' : colors.text },
                    ]}
                  >
                    {t('vehicles.monthly')}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: colors.primary }]}
                onPress={calculatePredictedDate}
              >
                <Calculator size={18} color="#000000" />
                <Text style={[styles.calculateButtonText, { color: '#000000' }]}>
                  {t('vehicles.calculatePrediction')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    gap: 20,
  },
  selectCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 15,
  },
  vehicleCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  vehicleContent: {
    flexDirection: 'row',
    gap: 16,
  },
  vehicleImage: {
    width: 203,
    height: 130,
    borderRadius: 12,
  },
  vehicleDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  vehicleBrand: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  vehicleYear: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  serviceReminderCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  serviceReminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceReminderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceReminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculatorButton: {
    padding: 8,
  },
  serviceReminderTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  scheduleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  scheduleButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  serviceReminderContent: {
    gap: 8,
  },
  serviceReminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceReminderLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  nextServiceKm: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  remainingKm: {
    fontSize: 14,
  },
  predictedDateContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 8,
  },
  predictedDate: {
    fontSize: 13,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    height: '100%',
    backgroundColor: '#ffffff',
  },
  recommendedServices: {
    marginTop: 12,
  },
  recommendedServicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  recommendedServicesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  servicesList: {
    gap: 6,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  serviceText: {
    fontSize: 14,
  },
  bookServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  bookServiceButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  historyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    flex: 1,
  },
  verifiedBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  historyDescription: {
    fontSize: 13,
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  historyItemLeft: {
    flex: 1,
    gap: 8,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  historyItemMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  historyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyMetaText: {
    fontSize: 13,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 12,
  },
  historyItemPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  historyItemDetails: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  partsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  partBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  partText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dropdownItemText: {
    flex: 1,
    gap: 4,
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  dropdownItemSubtitle: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  predictionModal: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  predictionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  predictionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  predictionForm: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  predictionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  predictionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  predictionInputField: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
