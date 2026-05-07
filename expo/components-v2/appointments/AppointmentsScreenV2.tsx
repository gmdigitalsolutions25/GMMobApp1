/**
 * AppointmentsScreenV2 — "Showroom Floor" Appointments
 *
 * Inline booking form (same as v1) with v2 premium styling.
 * Upcoming/Past tabs, appointment cards with status badges.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import { trpc } from '@/lib/trpc';
import { scheduleAppointmentReminders } from '@/lib/notifications';
import type { Appointment } from '@/constants/types';

type Tab = 'upcoming' | 'past';

export default function AppointmentsScreenV2() {
  const params = useLocalSearchParams<{ serviceTypes?: string; date?: string; vehicleId?: string }>();
  const { t } = useTranslation();
  const { appointments, theme, vehicles, addAppointment, updateAppointment } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // Booking form state
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

  // Pre-fill from params
  useEffect(() => {
    if (params.serviceTypes) {
      try {
        const parsed = JSON.parse(params.serviceTypes);
        setSelectedServiceTypes(parsed);
      } catch {}
    }
    if (params.date) {
      const d = new Date(params.date);
      if (!isNaN(d.getTime())) setSelectedDate(d);
    }
    if (params.vehicleId) setSelectedVehicleId(params.vehicleId);
  }, [params.serviceTypes, params.date, params.vehicleId]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const serviceCenters = [
    'Toyota Abşeron Mərkəzi - Bakı-Sumqayıt şossesi 6-cı km',
    'Mitsubishi Motors - Bakı-Sumqayıt şossesi 6-cı km, Babək pr. 33',
    'Mazda Azərbaycan - Bakı-Sumqayıt şossesi 6-cı km, Babək pr. 33',
    'Toyota Gəncə Mərkəzi - Gəncə-Şəmkir şossesi 1-ci km',
    'BYD Abşeron Mərkəzi - Bakı-Sumqayıt şossesi 6-cı km',
  ];

  const serviceTypes = [
    { name: t('home.oilChangeName'), duration: t('appointments.duration', { time: '30-45' }), description: t('home.oilChangeDesc') },
    { name: t('home.fullInspectionName'), duration: t('appointments.duration', { time: '60-90' }), description: t('home.fullInspectionDesc') },
    { name: t('home.brakeServiceName'), duration: t('appointments.duration', { time: '90-120' }), description: t('home.brakeServiceDesc') },
    { name: t('home.tireServiceName'), duration: t('appointments.duration', { time: '45-60' }), description: t('home.tireServiceDesc') },
    { name: t('appointments.filterReplacement'), duration: t('appointments.duration', { time: '25' }), description: t('appointments.filterReplacementDesc') },
  ];

  // Time slots: 09:00 – 17:00
  const WORK_START_HOUR = 9;
  const WORK_END_HOUR = 17;
  const timeSlots = (() => {
    const slots: string[] = [];
    for (let h = WORK_START_HOUR; h <= WORK_END_HOUR; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < WORK_END_HOUR) slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  })();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay(), year, month };
  };

  const isDatePast = (day: number, month: number, year: number) => {
    const today = new Date();
    const check = new Date(year, month, day);
    return check < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isDateSelected = (day: number, month: number, year: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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

  const handleCancelAppointment = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
  };

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.date) >= now
  );
  const past = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || new Date(a.date) < now
  );
  const list = activeTab === 'upcoming' ? upcoming : past;
  const sortedList = [...list].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('appointments.title') || 'Randevular'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'upcoming' ? colors.primary : colors.textTertiary }]}>
            {t('appointments.upcoming') || 'Gələcək'} ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'past' ? colors.primary : colors.textTertiary }]}>
            {t('appointments.past') || 'Keçmiş'} ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Existing appointments */}
        {sortedList.length > 0 && (
          <View style={styles.section}>
            {sortedList.map((apt) => {
              const vehicle = vehicles.find((v) => v.id === apt.vehicleId);
              const isExpanded = expandedAppointmentId === apt.id;
              return (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  vehicle={vehicle}
                  colors={colors}
                  t={t}
                  isExpanded={isExpanded}
                  onPress={() => setExpandedAppointmentId(isExpanded ? null : apt.id)}
                  onCancel={() => handleCancelAppointment(apt.id)}
                />
              );
            })}
          </View>
        )}

        {/* Booking form — always visible */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('appointments.bookYourService')}
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            {t('appointments.expertService')}
          </Text>

          <View style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.bookingCardTitle, { color: colors.text }]}>
              {t('appointments.scheduleAppointment')}
            </Text>

            {/* Vehicle selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('appointments.selectVehicle')}</Text>
              <TouchableOpacity
                style={[styles.select, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowVehiclePicker(true)}
              >
                <Text style={[styles.selectText, { color: selectedVehicle ? colors.text : colors.textSecondary }]}>
                  {selectedVehicle
                    ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.licensePlate}`
                    : t('vehicles.selectAVehicle')}
                </Text>
                <ChevronDown size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <View style={[styles.vehiclePreview, { backgroundColor: colors.background, borderColor: colors.border }]}>
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

            {/* Date & Time row */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  <Calendar size={14} color={colors.text} /> {t('appointments.selectDate')}
                </Text>
                <TouchableOpacity
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}
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
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.inputText, { color: selectedTime ? colors.text : colors.textSecondary }]}>
                    {selectedTime || t('appointments.selectDots')}
                  </Text>
                  <ChevronDown size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Service center */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('appointments.selectServiceCenterTitle')}</Text>
              <TouchableOpacity
                style={[styles.select, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowServiceCenterPicker(true)}
              >
                <Text style={[styles.selectText, { color: selectedServiceCenter ? colors.text : colors.textSecondary }]}>
                  {selectedServiceCenter || t('appointments.chooseServiceCenter')}
                </Text>
                <ChevronDown size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Service types */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('services.serviceType')}</Text>
              <TouchableOpacity
                style={[styles.select, { backgroundColor: colors.background, borderColor: colors.border }]}
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

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('appointments.addNotes')}</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
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

            {/* Book button */}
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={handleBookAppointment}
            >
              <Calendar size={20} color="#FFF" />
              <Text style={styles.bookButtonText}>{t('appointments.bookAppointment')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty state when no appointments at all */}
        {sortedList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {activeTab === 'upcoming'
                ? t('appointments.noUpcoming') || 'Gələcək randevunuz yoxdur'
                : t('appointments.noPast') || 'Keçmiş randevu yoxdur'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── MODALS ─── */}

      {/* Vehicle Picker */}
      <Modal visible={showVehiclePicker} transparent animationType="fade" onRequestClose={() => setShowVehiclePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowVehiclePicker(false)}>
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectVehicle')}</Text>
            <ScrollView style={styles.dropdownList}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[styles.dropdownItem, {
                    backgroundColor: selectedVehicleId === vehicle.id ? `${colors.primary}15` : colors.background,
                    borderColor: colors.border,
                  }]}
                  onPress={() => { setSelectedVehicleId(vehicle.id); setShowVehiclePicker(false); }}
                >
                  <View style={styles.dropdownItemContent}>
                    <Car size={20} color={selectedVehicleId === vehicle.id ? colors.primary : colors.text} />
                    <View style={styles.dropdownItemText}>
                      <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>{vehicle.brand} {vehicle.model}</Text>
                      <Text style={[styles.dropdownItemSubtitle, { color: colors.textSecondary }]}>{vehicle.year} • {vehicle.licensePlate}</Text>
                    </View>
                  </View>
                  {selectedVehicleId === vehicle.id && <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Service Center Picker */}
      <Modal visible={showServiceCenterPicker} transparent animationType="fade" onRequestClose={() => setShowServiceCenterPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowServiceCenterPicker(false)}>
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectServiceCenterTitle')}</Text>
            <ScrollView style={styles.dropdownList}>
              {serviceCenters.map((center) => (
                <TouchableOpacity
                  key={center}
                  style={[styles.dropdownItem, {
                    backgroundColor: selectedServiceCenter === center ? `${colors.primary}15` : colors.background,
                    borderColor: colors.border,
                  }]}
                  onPress={() => { setSelectedServiceCenter(center); setShowServiceCenterPicker(false); }}
                >
                  <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>{center}</Text>
                  {selectedServiceCenter === center && <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Service Type Picker (multi-select) */}
      <Modal visible={showServiceTypePicker} transparent animationType="fade" onRequestClose={() => setShowServiceTypePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowServiceTypePicker(false)}>
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectServicesTitle')}</Text>
              {selectedServiceTypes.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedServiceTypes([])} style={styles.clearButton}>
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
                    style={[styles.checkboxItem, {
                      backgroundColor: isSelected ? `${colors.primary}15` : colors.background,
                      borderColor: colors.border,
                    }]}
                    onPress={() => {
                      if (isSelected) setSelectedServiceTypes(selectedServiceTypes.filter((s) => s !== service.name));
                      else setSelectedServiceTypes([...selectedServiceTypes, service.name]);
                    }}
                  >
                    <View style={[styles.checkbox, {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    }]}>
                      {isSelected && <Check size={16} color="#FFF" strokeWidth={3} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>{service.name}</Text>
                      <Text style={[styles.dropdownItemSubtitle, { color: colors.textSecondary }]}>{service.duration}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowServiceTypePicker(false)}
            >
              <Text style={styles.doneButtonText}>{t('appointments.done') || 'Tamam'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker (Calendar) */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
          <View style={[styles.calendarModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectDate')}</Text>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={styles.monthNavBtn}>
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: colors.text }]}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={styles.monthNavBtn}>
                <ChevronRight size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.weekDaysRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={[styles.weekDayText, { color: colors.textSecondary }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {(() => {
                const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                const days: React.ReactNode[] = [];
                for (let i = 0; i < startingDayOfWeek; i++) days.push(<View key={`e-${i}`} style={styles.dayCell} />);
                for (let day = 1; day <= daysInMonth; day++) {
                  const isPast = isDatePast(day, month, year);
                  const isSel = isDateSelected(day, month, year);
                  const d = day;
                  days.push(
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayCell, isSel && { backgroundColor: colors.primary }, isPast && styles.dayCellDisabled]}
                      disabled={isPast}
                      onPress={() => { setSelectedDate(new Date(year, month, d)); setShowDatePicker(false); }}
                    >
                      <Text style={[styles.dayText, { color: colors.text }, isSel && { color: '#FFF' }, isPast && { color: colors.textTertiary }]}>{day}</Text>
                    </TouchableOpacity>
                  );
                }
                return days;
              })()}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker */}
      <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>{t('appointments.selectTimeTitle')}</Text>
            <Text style={[styles.workingHoursNote, { color: colors.textSecondary }]}>{t('appointments.workingHours')}</Text>
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlotItem, {
                    backgroundColor: selectedTime === time ? `${colors.primary}15` : colors.background,
                    borderColor: colors.border,
                  }]}
                  onPress={() => { setSelectedTime(time); setShowTimePicker(false); }}
                >
                  <Clock size={18} color={selectedTime === time ? colors.primary : colors.text} />
                  <Text style={[styles.timeSlotText, { color: colors.text }]}>{time}</Text>
                  {selectedTime === time && <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSuccessModal(false)}>
          <View style={[styles.successModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.successIcon, { backgroundColor: `${colors.success}20` }]}>
              <CheckCircle size={48} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>{t('appointments.appointmentBooked')}</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>{t('appointments.appointmentBookedDesc')}</Text>
            <Text style={[styles.successDetails, { color: colors.textTertiary }]}>{t('appointments.appointmentBookedDetails')}</Text>
            <TouchableOpacity style={[styles.successButton, { backgroundColor: colors.primary }]} onPress={() => setShowSuccessModal(false)}>
              <Text style={styles.successButtonText}>{t('appointments.gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ─── APPOINTMENT CARD ─── */

function AppointmentCard({
  appointment, vehicle, colors, t, isExpanded, onPress, onCancel,
}: {
  appointment: Appointment; vehicle: any; colors: any; t: any;
  isExpanded: boolean; onPress: () => void; onCancel: () => void;
}) {
  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pending: { icon: AlertCircle, color: colors.warning, label: t('appointments.pending') || 'Gözləyir' },
    confirmed: { icon: CheckCircle, color: colors.success, label: t('appointments.confirmed') || 'Təsdiqlənib' },
    completed: { icon: CheckCircle, color: colors.success, label: t('appointments.completed') || 'Tamamlanıb' },
    cancelled: { icon: XCircle, color: colors.error, label: t('appointments.cancelled') || 'Ləğv edilib' },
  };
  const status = statusConfig[appointment.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const services = Array.isArray(appointment.serviceTypes) ? appointment.serviceTypes : [appointment.serviceTypes];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
        <StatusIcon size={14} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      <View style={styles.dateRow}>
        <Calendar size={16} color={colors.primary} />
        <Text style={[styles.dateText, { color: colors.text }]}>
          {new Date(appointment.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        {appointment.time && (
          <>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{appointment.time}</Text>
          </>
        )}
      </View>

      {vehicle && (
        <View style={styles.vehicleRow}>
          <Car size={14} color={colors.textSecondary} />
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>{vehicle.brand} {vehicle.model}</Text>
        </View>
      )}

      {appointment.serviceCenter && (
        <View style={styles.vehicleRow}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]} numberOfLines={1}>{appointment.serviceCenter}</Text>
        </View>
      )}

      <View style={styles.servicesRow}>
        {services.map((s: string, i: number) => (
          <View key={i} style={[styles.serviceChip, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={[styles.serviceChipText, { color: colors.primary }]}>{s}</Text>
          </View>
        ))}
      </View>

      {isExpanded && (
        <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
          {appointment.notes && (
            <View style={styles.expandedRow}>
              <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.notes')}</Text>
              <Text style={[styles.expandedValue, { color: colors.text }]}>{appointment.notes}</Text>
            </View>
          )}
          <View style={styles.expandedRow}>
            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>{t('appointments.bookedOn')}</Text>
            <Text style={[styles.expandedValue, { color: colors.text }]}>{new Date(appointment.createdAt).toLocaleString()}</Text>
          </View>
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.error }]}
              onPress={onCancel}
            >
              <Trash2 size={14} color={colors.error} />
              <Text style={[styles.cancelButtonText, { color: colors.error }]}>{t('appointments.cancel')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ─── STYLES ─── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },

  tabRow: { flexDirection: 'row', borderBottomWidth: 0.5 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sectionDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },

  // Booking card
  bookingCard: { padding: 18, borderRadius: 16, borderWidth: 1 },
  bookingCardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  formGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  selectText: { fontSize: 14, flex: 1 },
  formRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  input: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  inputText: { fontSize: 14 },
  textArea: { padding: 14, borderRadius: 12, borderWidth: 1, minHeight: 90, textAlignVertical: 'top', fontSize: 14 },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  vehiclePreview: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  vehiclePreviewLabel: { fontSize: 11, marginBottom: 2 },
  vehiclePreviewTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  vehiclePreviewPlate: { fontSize: 13, fontWeight: '600' },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, marginTop: 6 },
  bookButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  // Appointment card
  card: { borderRadius: 14, borderWidth: 0.5, padding: 14, marginBottom: 12, gap: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 15, fontWeight: '600' },
  timeText: { fontSize: 13 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleText: { fontSize: 13, flex: 1 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  serviceChipText: { fontSize: 12, fontWeight: '500' },

  // Expanded card details
  expandedDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, gap: 10 },
  expandedRow: { gap: 2 },
  expandedLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  expandedValue: { fontSize: 13, lineHeight: 18 },
  cancelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginTop: 4, gap: 6 },
  cancelButtonText: { fontSize: 13, fontWeight: '600' },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dropdownModal: { width: '100%', maxHeight: '70%', borderRadius: 20, padding: 20 },
  dropdownTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  dropdownList: { maxHeight: 400 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  dropdownItemContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dropdownItemText: { flex: 1, gap: 2 },
  dropdownItemTitle: { fontSize: 15, fontWeight: '600' },
  dropdownItemSubtitle: { fontSize: 13 },
  selectedDot: { width: 8, height: 8, borderRadius: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  clearButton: { paddingHorizontal: 12, paddingVertical: 6 },
  clearButtonText: { fontSize: 13, fontWeight: '600' },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  doneButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  doneButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  workingHoursNote: { fontSize: 11, textAlign: 'center', marginTop: -6, marginBottom: 10 },
  timeSlotItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, gap: 12 },
  timeSlotText: { fontSize: 15, fontWeight: '500', flex: 1 },

  // Calendar
  calendarModal: { width: '100%', borderRadius: 20, padding: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthNavBtn: { padding: 8 },
  monthTitle: { fontSize: 16, fontWeight: '600' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekDayText: { fontSize: 11, fontWeight: '600', width: 40, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  dayCellDisabled: { opacity: 0.3 },
  dayText: { fontSize: 13, fontWeight: '500' },

  // Success
  successModal: { width: '90%', maxWidth: 400, borderRadius: 24, padding: 28, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  successMessage: { fontSize: 15, textAlign: 'center', marginBottom: 6, lineHeight: 22 },
  successDetails: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  successButton: { paddingVertical: 12, paddingHorizontal: 36, borderRadius: 12 },
  successButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF', textAlign: 'center' },
});
