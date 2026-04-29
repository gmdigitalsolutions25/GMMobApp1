import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, Car, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@/constants/types';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { scheduleAppointmentReminders } from '@/lib/notifications';

export default function AppointmentsScreen() {
  const params = useLocalSearchParams<{ serviceTypes?: string; date?: string; vehicleId?: string }>();
  const { appointments, theme, vehicles, addAppointment, updateAppointment } = useApp();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [showServiceCenterPicker, setShowServiceCenterPicker] = useState(false);
  const [showServiceTypePicker, setShowServiceTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicles[0]?.id || null);
  const [selectedServiceCenter, setSelectedServiceCenter] = useState<string | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Appointments screen params:', params);
    
    if (params.serviceTypes) {
      try {
        const parsedServices = JSON.parse(params.serviceTypes);
        console.log('Parsed service types:', parsedServices);
        setSelectedServiceTypes(parsedServices);
      } catch (error) {
        console.error('Failed to parse service types:', error);
      }
    }
    
    if (params.date && params.date !== '') {
      try {
        const parsedDate = new Date(params.date);
        if (!isNaN(parsedDate.getTime())) {
          console.log('Setting predicted date:', parsedDate);
          setSelectedDate(parsedDate);
        }
      } catch (error) {
        console.error('Failed to parse date:', error);
      }
    }
    
    if (params.vehicleId && params.vehicleId !== '') {
      console.log('Setting vehicle ID:', params.vehicleId);
      setSelectedVehicleId(params.vehicleId);
    }
  }, [params.serviceTypes, params.date, params.vehicleId]);
  
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const serviceCenters = [
    'Groupmotors - Babək pr. 78, Bakı',
  ];

  const serviceTypes = [
    { name: t('home.oilChangeName'), duration: '~30-45 min', description: t('home.oilChangeDesc') },
    { name: t('home.fullInspectionName'), duration: '~60-90 min', description: t('home.fullInspectionDesc') },
    { name: t('home.brakeServiceName'), duration: '~90-120 min', description: t('home.brakeServiceDesc') },
    { name: t('home.tireServiceName'), duration: '~45-60 min', description: t('home.tireServiceDesc') },
    { name: t('appointments.filterReplacement'), duration: '~25 min', description: t('appointments.filterReplacementDesc') },
  ];

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'completed':
        return colors.textSecondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const activeAppointments = appointments.filter(a => a.status !== 'cancelled');
  const sortedAppointments = [...activeAppointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Working hours: 09:00 – 17:00 (last slot 17:00, no 17:30 since closing is 17:00)
  const WORK_START_HOUR = 9;
  const WORK_END_HOUR = 17; // inclusive: last slot is 17:00

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = WORK_START_HOUR; hour <= WORK_END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      // Don't add :30 for the last hour (17:30 is outside working hours)
      if (hour < WORK_END_HOUR) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const isDateSelected = (day: number, month: number, year: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year;
  };

  const isDatePast = (day: number, month: number, year: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      t('appointments.cancelAppointment'),
      t('appointments.cancelAppointmentConfirm'),
      [
        {
          text: t('appointments.no'),
          style: 'cancel',
        },
        {
          text: t('appointments.yesCancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              await updateAppointment(appointmentId, { status: 'cancelled' });
              setExpandedAppointmentId(null);
            } catch (error) {
              console.error('Failed to cancel appointment:', error);
              Alert.alert(t('common.error'), t('appointments.failedToCancel'));
            }
          },
        },
      ],
    );
  };

  const handleBookAppointment = async () => {
    if (!selectedVehicleId || !selectedDate || !selectedTime || !selectedServiceCenter || selectedServiceTypes.length === 0) {
      alert(t('appointments.fillRequiredFields'));
      return;
    }

    try {
      await addAppointment({
        vehicleId: selectedVehicleId,
        serviceType: selectedServiceTypes.join(', '),
        date: selectedDate.toISOString(),
        time: selectedTime,
        serviceCenter: selectedServiceCenter,
        notes: additionalNotes || undefined,
      });

      // Schedule push notification reminders
      await scheduleAppointmentReminders({
        id: Date.now().toString(),
        serviceType: selectedServiceTypes.join(', '),
        serviceCenter: selectedServiceCenter,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
      });

      setShowSuccessModal(true);

      setSelectedServiceTypes([]);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedServiceCenter(null);
      setAdditionalNotes('');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert(t('appointments.failedToBook'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('appointments.myAppointments')}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.appointmentsList}>
              {sortedAppointments.map((appointment) => {
                const StatusIcon = getStatusIcon(appointment.status);
                const statusColor = getStatusColor(appointment.status);
                const isExpanded = expandedAppointmentId === appointment.id;
                const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
                
                return (
                  <TouchableOpacity
                    key={appointment.id}
                    style={[styles.appointmentCard, { 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }]}
                    onPress={() => setExpandedAppointmentId(isExpanded ? null : appointment.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.appointmentHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                        <StatusIcon size={16} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {t(`appointments.status.${appointment.status}`)}
                        </Text>
                      </View>
                      <ChevronDown 
                        size={20} 
                        color={colors.textTertiary} 
                        style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                      />
                    </View>

                    <Text style={[styles.serviceType, { color: colors.text }]}>
                      {appointment.serviceType}
                    </Text>

                    <View style={styles.appointmentDetails}>
                      <View style={styles.detailRow}>
                        <Calendar size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                          {new Date(appointment.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Clock size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                          {appointment.time}
                        </Text>
                      </View>
                    </View>

                    {isExpanded && (
                      <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
                        <View style={styles.expandedRow}>
                          <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.serviceCenter')}</Text>
                          <Text style={[styles.expandedValue, { color: colors.text }]}>
                            {appointment.serviceCenter}
                          </Text>
                        </View>

                        {vehicle && (
                          <View style={styles.expandedRow}>
                            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.vehicle')}</Text>
                            <Text style={[styles.expandedValue, { color: colors.text }]}>
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </Text>
                          </View>
                        )}

                        {vehicle?.licensePlate && (
                          <View style={styles.expandedRow}>
                            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.licensePlate')}</Text>
                            <Text style={[styles.expandedValue, { color: colors.text }]}>
                              {vehicle.licensePlate}
                            </Text>
                          </View>
                        )}

                        {appointment.notes && (
                          <View style={styles.expandedRow}>
                            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.notes')}</Text>
                            <Text style={[styles.expandedValue, { color: colors.text }]}>
                              {appointment.notes}
                            </Text>
                          </View>
                        )}

                        <View style={styles.expandedRow}>
                          <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.bookedOn')}</Text>
                          <Text style={[styles.expandedValue, { color: colors.text }]}>
                            {new Date(appointment.createdAt).toLocaleString()}
                          </Text>
                        </View>

                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: `${colors.error}15`, borderColor: colors.error }]}
                            onPress={() => handleCancelAppointment(appointment.id)}
                          >
                            <Trash2 size={18} color={colors.error} />
                            <Text style={[styles.cancelButtonText, { color: colors.error }]}>{t('appointments.cancelVisit')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('appointments.bookYourService')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('appointments.expertService')}
          </Text>

          <View
            style={[
              styles.bookingCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.bookingCardTitle, { color: colors.text }]}>
              {t('appointments.scheduleAppointment')}
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('appointments.selectVehicle')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.select,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() => setShowVehiclePicker(true)}
              >
                <Text style={[styles.selectText, { color: selectedVehicle ? colors.text : colors.textSecondary }]}>
                  {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.licensePlate}` : t('vehicles.selectAVehicle')}
                </Text>
                <ChevronDown size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <View
                style={[
                  styles.vehiclePreview,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.vehiclePreviewLabel, { color: colors.textSecondary }]}>
                  {t('appointments.bookingFor')}
                </Text>
                <Text style={[styles.vehiclePreviewTitle, { color: colors.text }]}>
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </Text>
                <Text style={[styles.vehiclePreviewPlate, { color: colors.primary }]}>
                  {t('appointments.plate')} {selectedVehicle.licensePlate}
                </Text>
              </View>
            )}

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  <Calendar size={14} color={colors.text} /> {t('appointments.selectDate')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.inputText, { color: selectedDate ? colors.text : colors.textSecondary }]}>
                    {selectedDate ? formatDate(selectedDate) : t('appointments.pickDate')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>{t('appointments.selectTime')}</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.inputText, { color: selectedTime ? colors.text : colors.textSecondary }]}>
                    {selectedTime || t('appointments.selectDots')}
                  </Text>
                  <ChevronDown size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('appointments.selectServiceCenterTitle')}</Text>
              <TouchableOpacity
                style={[
                  styles.select,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() => setShowServiceCenterPicker(true)}
              >
                <Text style={[styles.selectText, { color: selectedServiceCenter ? colors.text : colors.textSecondary }]}>
                  {selectedServiceCenter || t('appointments.chooseServiceCenter')}
                </Text>
                <ChevronDown size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('services.serviceType')}</Text>
              <TouchableOpacity
                style={[
                  styles.select,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() => setShowServiceTypePicker(true)}
              >
                <Text style={[styles.selectText, { color: selectedServiceTypes.length > 0 ? colors.text : colors.textSecondary }]}>
                  {selectedServiceTypes.length > 0 
                    ? `${selectedServiceTypes.length} ${t('appointments.servicesSelected')}`
                    : t('appointments.selectServices')}
                </Text>
                <ChevronDown size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('appointments.addNotes')}
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={t('appointments.anySpecificConcerns')}
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                maxLength={1000}
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {additionalNotes.length}/1000 {t('appointments.characters')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={handleBookAppointment}
            >
              <Calendar size={20} color="#000000" />
              <Text style={[styles.bookButtonText, { color: '#000000' }]}>
                {t('appointments.bookAppointment')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {sortedAppointments.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={64} color={colors.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('appointments.noAppointments')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('appointments.noAppointmentsDesc')}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showVehiclePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVehiclePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVehiclePicker(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectVehicle')}</Text>
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
                    setShowVehiclePicker(false);
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
        visible={showServiceCenterPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowServiceCenterPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowServiceCenterPicker(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectServiceCenterTitle')}</Text>
            <ScrollView style={styles.dropdownList}>
              {serviceCenters.map((center) => (
                <TouchableOpacity
                  key={center}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        selectedServiceCenter === center
                          ? `${colors.primary}15`
                          : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedServiceCenter(center);
                    setShowServiceCenterPicker(false);
                  }}
                >
                  <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>
                    {center}
                  </Text>
                  {selectedServiceCenter === center && (
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
        visible={showServiceTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowServiceTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowServiceTypePicker(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectServicesTitle')}</Text>
              {selectedServiceTypes.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSelectedServiceTypes([])}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearButtonText, { color: colors.primary }]}>{t('appointments.clearAll')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.dropdownList}>
              {serviceTypes.map((service) => {
                const isSelected = selectedServiceTypes.includes(service.name);
                return (
                  <TouchableOpacity
                    key={service.name}
                    style={[
                      styles.checkboxItem,
                      {
                        backgroundColor:
                          isSelected
                            ? `${colors.primary}15`
                            : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedServiceTypes(selectedServiceTypes.filter(s => s !== service.name));
                      } else {
                        setSelectedServiceTypes([...selectedServiceTypes, service.name]);
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <Check size={16} color="#000000" strokeWidth={3} />}
                    </View>
                    <View style={styles.dropdownItemText}>
                      <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>
                        {service.name} {service.duration}
                      </Text>
                      <Text style={[styles.dropdownItemSubtitle, { color: colors.textSecondary }]}>
                        {service.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowServiceTypePicker(false)}
            >
              <Text style={[styles.doneButtonText, { color: '#000000' }]}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={[styles.calendarModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectDate')}</Text>
            
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthNavButton}>
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: colors.text }]}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
                <ChevronRight size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={[styles.weekDayText, { color: colors.textSecondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {(() => {
                const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                const days: React.ReactNode[] = [];

                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(
                    <View key={`empty-${i}`} style={styles.dayCell} />
                  );
                }

                for (let day = 1; day <= daysInMonth; day++) {
                  const isPast = isDatePast(day, month, year);
                  const isSelected = isDateSelected(day, month, year);
                  const currentDay = day;

                  days.push(
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: colors.primary },
                        isPast && styles.dayCellDisabled,
                      ]}
                      disabled={isPast}
                      onPress={() => {
                        setSelectedDate(new Date(year, month, currentDay));
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: colors.text },
                          isSelected && { color: '#000000' },
                          isPast && { color: colors.textTertiary },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                }

                return days;
              })()}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectTimeTitle')}</Text>
            <Text style={[styles.workingHoursNote, { color: colors.textSecondary }]}>
              {t('appointments.workingHours')}
            </Text>
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlotItem,
                    {
                      backgroundColor:
                        selectedTime === time
                          ? `${colors.primary}15`
                          : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Clock size={18} color={selectedTime === time ? colors.primary : colors.text} />
                  <Text style={[styles.timeSlotText, { color: colors.text }]}>
                    {time}
                  </Text>
                  {selectedTime === time && (
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
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuccessModal(false)}
        >
          <View style={[styles.successModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.successIcon, { backgroundColor: `${colors.success}20` }]}>
              <CheckCircle size={48} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>{t('appointments.appointmentBooked')}</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              {t('appointments.appointmentBookedDesc')}
            </Text>
            <Text style={[styles.successDetails, { color: colors.textTertiary }]}>
              {t('appointments.appointmentBookedDetails')}
            </Text>
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={[styles.successButtonText, { color: '#000000' }]}>{t('appointments.gotIt')}</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
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
  appointmentsList: {
    gap: 16,
  },
  appointmentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  serviceCenter: {
    fontSize: 14,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic' as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  bookingCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  bookingCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  select: {
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
  vehiclePreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  vehiclePreviewLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  vehiclePreviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  vehiclePreviewPlate: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 15,
  },
  textArea: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
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
  workingHoursNote: {
    fontSize: 12,
    textAlign: 'center' as const,
    marginTop: -8,
    marginBottom: 12,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  calendarModal: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '500' as const,
    flex: 1,
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  expandedRow: {
    gap: 4,
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  expandedValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  successModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  successDetails: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 120,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
