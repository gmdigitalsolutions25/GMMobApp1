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
import { useRouter } from 'expo-router';
import { X, ChevronDown, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import { carBrands, carModels, carYears } from '@/constants/mockData';
import type { VehiclePhoto } from '@/constants/types';

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

export default function AddVehicleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addVehicle, theme } = useApp();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [vin, setVin] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');

  const formatLicensePlate = (value: string) => {
    const cleaned = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 7)}`;
    }
  };

  const handleLicensePlateChange = (text: string) => {
    const formatted = formatLicensePlate(text);
    setLicensePlate(formatted);
  };
  const [carImage, setCarImage] = useState<string | null>(null);

  const [showBrandPicker, setShowBrandPicker] = useState<boolean>(false);
  const [showModelPicker, setShowModelPicker] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableModels = brand ? carModels[brand] || [] : [];

  const handleSelectBrand = (value: string) => {
    setBrand(value);
    setModel('');
    if (errors.brand) {
      setErrors((prev) => ({ ...prev, brand: '' }));
    }
  };

  const handleSelectModel = (value: string) => {
    setModel(value);
    if (errors.model) {
      setErrors((prev) => ({ ...prev, model: '' }));
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert(t('vehiclePhoto.permissionGallery'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCarImage(result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!brand) {
      newErrors.brand = t('addVehicle.brandRequired');
    }
    if (!model) {
      newErrors.model = t('addVehicle.modelRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCar = async () => {
    if (!validateForm()) {
      return;
    }

    const photos: VehiclePhoto[] = carImage
      ? [
          {
            id: Date.now().toString(),
            uri: carImage,
            isPrimary: true,
          },
        ]
      : [];

    await addVehicle({
      brand,
      model,
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      vin: vin || '',
      licensePlate: licensePlate || '',
      photos,
      primaryPhotoId: photos[0]?.id,
    });

    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.title, { color: colors.text }]}>{t('addVehicle.addYourCar')}</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('vehicles.brand')} <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.picker,
              { backgroundColor: colors.surface, borderColor: brand ? colors.primary : colors.border },
              errors.brand && { borderColor: '#EF4444' },
            ]}
            onPress={() => setShowBrandPicker(true)}
          >
            <Text style={[styles.inputText, { color: brand ? colors.text : colors.textSecondary }]}>
              {brand || 'e.g., Toyota'}
            </Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('vehicles.model')} <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.picker,
              { backgroundColor: colors.surface, borderColor: model ? colors.primary : colors.border },
              !brand && { opacity: 0.5 },
              errors.model && { borderColor: '#EF4444' },
            ]}
            onPress={() => brand && setShowModelPicker(true)}
            disabled={!brand}
          >
            <Text style={[styles.inputText, { color: model ? colors.text : colors.textSecondary }]}>
              {!brand ? t('addVehicle.selectBrandFirst') : model || t('addVehicle.selectModel')}
            </Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('vehicles.year')}</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.picker,
              { backgroundColor: colors.surface, borderColor: year ? colors.primary : colors.border },
            ]}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={[styles.inputText, { color: year ? colors.text : colors.textSecondary }]}>
              {year || 'e.g., 2020'}
            </Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('vehicles.vin')}</Text>
          <TextInput
            style={[
              styles.input,
              styles.textInput,
              { backgroundColor: colors.surface, color: colors.text, borderColor: vin ? colors.primary : colors.border },
            ]}
            placeholder="e.g., 1HGBH41JXMN109186"
            placeholderTextColor={colors.textSecondary}
            value={vin}
            onChangeText={setVin}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('vehicles.licensePlate')}</Text>
          <TextInput
            style={[
              styles.input,
              styles.textInput,
              { backgroundColor: colors.surface, color: colors.text, borderColor: licensePlate ? colors.primary : colors.border },
            ]}
            placeholder="e.g., 12-AB-345"
            placeholderTextColor={colors.textSecondary}
            value={licensePlate}
            onChangeText={handleLicensePlateChange}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('addVehicle.formatLicensePlate')}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.carImageOptional')}</Text>
          <TouchableOpacity
            style={[
              styles.imagePickerButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={pickImage}
          >
            {carImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: carImage }} style={styles.imagePreview} contentFit="cover" />
                <View style={styles.changeImageOverlay}>
                  <ImageIcon size={24} color="#FFFFFF" />
                  <Text style={styles.changeImageText}>{t('addVehicle.changeImage')}</Text>
                </View>
              </View>
            ) : (
              <>
                <ImageIcon size={24} color={colors.textSecondary} />
                <Text style={[styles.imagePickerText, { color: colors.text }]}>{t('addVehicle.chooseFile')}</Text>
                <Text style={[styles.imagePickerSubtext, { color: colors.textSecondary }]}>
                  {t('addVehicle.noFileChosen')}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCar}
        >
          <Text style={styles.addButtonText}>{t('addVehicle.addCar')}</Text>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
  },
  textInput: {
    paddingVertical: 16,
    fontSize: 15,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  inputText: {
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  imagePickerButton: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginTop: 12,
  },
  imagePickerSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalOptionText: {
    fontSize: 16,
  },
});
