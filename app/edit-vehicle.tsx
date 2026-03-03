import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, ChevronDown } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import { carBrands, carModels, carYears } from '@/constants/mockData';

type PickerModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  selectedValue: string;
  colors: typeof Colors.dark;
};

function PickerModal({ visible, onClose, title, options, onSelect, selectedValue, colors }: PickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                  selectedValue === option.value && { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: selectedValue === option.value ? colors.primary : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function EditVehicleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { vehicles, updateVehicle, theme } = useApp();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  const [brand, setBrand] = useState<string>(vehicle?.brand || '');
  const [model, setModel] = useState<string>(vehicle?.model || '');
  const [year, setYear] = useState<string>(vehicle?.year?.toString() || '');
  const [vin, setVin] = useState<string>(vehicle?.vin || '');
  const [licensePlate, setLicensePlate] = useState<string>(vehicle?.licensePlate || '');
  const [mileage, setMileage] = useState<string>(vehicle?.mileage?.toString() || '');

  const [showBrandPicker, setShowBrandPicker] = useState<boolean>(false);
  const [showModelPicker, setShowModelPicker] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableModels = brand ? carModels[brand] || [] : [];

  const formatLicensePlate = (value: string) => {
    const cleaned = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 7)}`;
  };

  const handleLicensePlateChange = (text: string) => {
    setLicensePlate(formatLicensePlate(text));
  };

  const handleSelectBrand = (value: string) => {
    setBrand(value);
    if (value !== brand) setModel('');
    if (errors.brand) setErrors(prev => ({ ...prev, brand: '' }));
  };

  const handleSelectModel = (value: string) => {
    setModel(value);
    if (errors.model) setErrors(prev => ({ ...prev, model: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!brand) newErrors.brand = t('addVehicle.brandRequired');
    if (!model) newErrors.model = t('addVehicle.modelRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !vehicleId) return;

    await updateVehicle(vehicleId, {
      brand,
      model,
      year: year ? parseInt(year, 10) : vehicle?.year,
      vin: vin || '',
      licensePlate: licensePlate || '',
      mileage: mileage ? parseInt(mileage, 10) : vehicle?.mileage,
    });
    router.back();
  };

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.text, padding: 20 }]}>{t('serviceDetails.serviceNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('editVehicle.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.brand')}</Text>
          <TouchableOpacity
            style={[styles.input, { borderColor: errors.brand ? '#EF4444' : colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowBrandPicker(true)}
          >
            <View style={styles.picker}>
              <Text style={[styles.inputText, { color: brand ? colors.text : colors.textTertiary }]}>
                {brand || t('addVehicle.selectBrand')}
              </Text>
              <ChevronDown size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
          {errors.brand ? <Text style={styles.errorText}>{errors.brand}</Text> : null}
        </View>

        {/* Model */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.model')}</Text>
          <TouchableOpacity
            style={[styles.input, { borderColor: errors.model ? '#EF4444' : colors.border, backgroundColor: colors.surface }]}
            onPress={() => brand ? setShowModelPicker(true) : null}
            activeOpacity={brand ? 0.7 : 1}
          >
            <View style={styles.picker}>
              <Text style={[styles.inputText, { color: model ? colors.text : colors.textTertiary }]}>
                {model || (brand ? t('addVehicle.selectModel') : t('addVehicle.selectBrandFirst'))}
              </Text>
              <ChevronDown size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
          {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
        </View>

        {/* Year */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.year')}</Text>
          <TouchableOpacity
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowYearPicker(true)}
          >
            <View style={styles.picker}>
              <Text style={[styles.inputText, { color: year ? colors.text : colors.textTertiary }]}>
                {year || t('addVehicle.selectYear')}
              </Text>
              <ChevronDown size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* License Plate */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.licensePlate')}</Text>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={licensePlate}
              onChangeText={handleLicensePlateChange}
              placeholder="10-AA-123"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              maxLength={9}
            />
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('addVehicle.licensePlateHint')}</Text>
        </View>

        {/* VIN */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.vin')}</Text>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={vin}
              onChangeText={setVin}
              placeholder={t('addVehicle.vinPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              maxLength={17}
            />
          </View>
        </View>

        {/* Mileage */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('editVehicle.mileage')}</Text>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={mileage}
              onChangeText={setMileage}
              placeholder={t('editVehicle.mileagePlaceholder')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>{t('editVehicle.save')}</Text>
        </TouchableOpacity>
      </View>

      <PickerModal
        visible={showBrandPicker}
        onClose={() => setShowBrandPicker(false)}
        title={t('addVehicle.selectBrand')}
        options={carBrands}
        onSelect={handleSelectBrand}
        selectedValue={brand}
        colors={colors}
      />
      <PickerModal
        visible={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        title={t('addVehicle.selectModel')}
        options={availableModels}
        onSelect={handleSelectModel}
        selectedValue={model}
        colors={colors}
      />
      <PickerModal
        visible={showYearPicker}
        onClose={() => setShowYearPicker(false)}
        title={t('addVehicle.selectYear')}
        options={carYears}
        onSelect={setYear}
        selectedValue={year}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700' as const },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600' as const, marginBottom: 12 },
  input: { borderRadius: 12, borderWidth: 2, paddingHorizontal: 16 },
  textInput: { paddingVertical: 16, fontSize: 15 },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  inputText: { fontSize: 15 },
  hint: { fontSize: 12, marginTop: 8 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 8 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600' as const },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '700' as const, color: '#000000' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' as const },
  modalScroll: { maxHeight: 400 },
  modalOption: { padding: 16, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 16 },
});
