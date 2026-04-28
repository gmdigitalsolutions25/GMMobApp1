import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, ChevronDown, Image as ImageIcon, BookImage } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import { carYears } from '@/constants/mockData';
import { useBrandsModels } from '@/hooks/useBrandsModels';
import type { VehiclePhoto } from '@/constants/types';
import {
  getBrandImages,
  FALLBACK_CAR_IMAGE,
  type CarImageEntry,
} from '@/constants/carImages';

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMB_SIZE = (SCREEN_WIDTH - 40 - 20 * 2 - 12) / 3; // 3 columns inside modal with padding

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

// Library image picker modal — shows a 3-column grid of brand images
type LibraryModalProps = {
  visible: boolean;
  onClose: () => void;
  brand: string;
  onSelect: (uri: string) => void;
  selectedUri: string | null;
  colors: typeof Colors.dark;
  t: (key: string) => string;
};
function LibraryModal({ visible, onClose, brand, onSelect, selectedUri, colors, t }: LibraryModalProps) {
  const images = brand ? getBrandImages(brand) : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.libraryOverlay}>
        <View style={[styles.librarySheet, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {brand ? `${brand} — ${t('vehiclePhoto.library')}` : t('vehiclePhoto.library')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {images.length === 0 ? (
            <View style={styles.libraryEmpty}>
              <BookImage size={48} color={colors.textSecondary} />
              <Text style={[styles.libraryEmptyTitle, { color: colors.text }]}>
                {t('vehiclePhoto.noLibraryImages')}
              </Text>
              <Text style={[styles.libraryEmptyDesc, { color: colors.textSecondary }]}>
                {brand
                  ? t('vehiclePhoto.noLibraryImagesDesc')
                  : t('addVehicle.selectBrandFirst')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={images}
              keyExtractor={(item) => item.model}
              numColumns={3}
              contentContainerStyle={styles.libraryGrid}
              renderItem={({ item }) => {
                const isSelected = selectedUri === item.uri;
                return (
                  <TouchableOpacity
                    style={[
                      styles.libraryThumb,
                      { borderColor: isSelected ? colors.primary : colors.border },
                    ]}
                    onPress={() => {
                      onSelect(item.uri);
                      onClose();
                    }}
                    activeOpacity={0.75}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.libraryThumbImage}
                      contentFit="cover"
                      placeholder={{ uri: FALLBACK_CAR_IMAGE }}
                    />
                    {isSelected && (
                      <View style={styles.libraryThumbCheck}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                      </View>
                    )}
                    <View style={[styles.libraryThumbLabel, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                      <Text style={styles.libraryThumbLabelText} numberOfLines={1}>
                        {item.model}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
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

  const formatVin = (value: string) => {
    // VIN: only uppercase A-Z (excluding I, O, Q) and 0-9, max 17 characters
    return value
      .toUpperCase()
      .replace(/[^A-HJ-NPR-Z0-9]/g, '')
      .slice(0, 17);
  };

  const handleVinChange = (text: string) => {
    const formatted = formatVin(text);
    setVin(formatted);
    if (errors.vin) {
      setErrors((prev) => ({ ...prev, vin: '' }));
    }
  };

  const formatLicensePlate = (value: string) => {
    // Azerbaijan plate format: NN-CC-NNN
    // N = digit (0-9), C = letter (A-Z)
    const raw = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    let result = '';
    let pos = 0;
    // Position 0-1: digits only
    for (let i = 0; i < 2 && pos < raw.length; pos++) {
      if (/[0-9]/.test(raw[pos])) { result += raw[pos]; i++; }
    }
    // Position 2-3: letters only
    for (let i = 0; i < 2 && pos < raw.length; pos++) {
      if (/[A-Z]/.test(raw[pos])) { result += raw[pos]; i++; }
    }
    // Position 4-6: digits only
    for (let i = 0; i < 3 && pos < raw.length; pos++) {
      if (/[0-9]/.test(raw[pos])) { result += raw[pos]; i++; }
    }
    // Insert dashes: NN-CC-NNN
    if (result.length <= 2) return result;
    if (result.length <= 4) return `${result.slice(0, 2)}-${result.slice(2)}`;
    return `${result.slice(0, 2)}-${result.slice(2, 4)}-${result.slice(4, 7)}`;
  };

  const handleLicensePlateChange = (text: string) => {
    const formatted = formatLicensePlate(text);
    setLicensePlate(formatted);
    if (errors.licensePlate) {
      setErrors((prev) => ({ ...prev, licensePlate: '' }));
    }
  };

  const [carImage, setCarImage] = useState<string | null>(null);
  const [showBrandPicker, setShowBrandPicker] = useState<boolean>(false);
  const [showModelPicker, setShowModelPicker] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { brands: carBrands, getModels } = useBrandsModels();
  const availableModels = brand ? getModels(brand) : [];

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
    if (vin && vin.length !== 17) {
      newErrors.vin = t('addVehicle.vinMustBe17', { defaultValue: 'VIN must be exactly 17 characters' });
    }
    if (licensePlate && licensePlate.replace(/-/g, '').length !== 7) {
      newErrors.licensePlate = t('addVehicle.plateFormat', { defaultValue: 'Plate must be NN-CC-NNN format (e.g., 10-AB-123)' });
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
            onChangeText={handleVinChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={17}
          />
          {vin.length > 0 && (
            <Text style={{ color: vin.length === 17 ? '#22c55e' : colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              {vin.length}/17
            </Text>
          )}
          {errors.vin ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.vin}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('vehicles.licensePlate')}</Text>
          <TextInput
            style={[
              styles.input,
              styles.textInput,
              { backgroundColor: colors.surface, color: colors.text, borderColor: licensePlate ? colors.primary : colors.border },
            ]}
            placeholder="e.g., 10-AB-123"
            placeholderTextColor={colors.textSecondary}
            value={licensePlate}
            onChangeText={handleLicensePlateChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('addVehicle.formatLicensePlate', { defaultValue: 'Format: NN-CC-NNN (e.g., 10-AB-123)' })}
          </Text>
          {errors.licensePlate ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.licensePlate}</Text> : null}
        </View>

        {/* Car Image section */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('addVehicle.carImageOptional')}</Text>

          {/* Image preview */}
          {carImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: carImage }} style={styles.imagePreview} contentFit="cover" />
              <View style={styles.changeImageOverlay}>
                <ImageIcon size={24} color="#FFFFFF" />
                <Text style={styles.changeImageText}>{t('addVehicle.changeImage')}</Text>
              </View>
            </View>
          ) : null}

          {/* Two buttons side by side */}
          <View style={styles.imageButtonRow}>
            {/* Upload from gallery */}
            <TouchableOpacity
              style={[
                styles.imageButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={pickImage}
            >
              <ImageIcon size={22} color={colors.primary} />
              <Text style={[styles.imageButtonText, { color: colors.text }]}>
                {t('addVehicle.chooseFile')}
              </Text>
            </TouchableOpacity>

            {/* Choose from library */}
            <TouchableOpacity
              style={[
                styles.imageButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                !brand && { opacity: 0.45 },
              ]}
              onPress={() => {
                if (!brand) {
                  alert(t('addVehicle.selectBrandFirst'));
                  return;
                }
                setShowLibrary(true);
              }}
            >
              <BookImage size={22} color={colors.primary} />
              <Text style={[styles.imageButtonText, { color: colors.text }]}>
                {t('vehiclePhoto.chooseFromLibrary')}
              </Text>
            </TouchableOpacity>
          </View>

          {!brand && (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('addVehicle.selectBrandFirst')}
            </Text>
          )}
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
      <LibraryModal
        visible={showLibrary}
        onClose={() => setShowLibrary(false)}
        brand={brand}
        onSelect={(uri) => setCarImage(uri)}
        selectedUri={carImage}
        colors={colors}
        t={t}
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
  imagePreviewContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
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
  // Two-button row for image selection
  imageButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 90,
  },
  imageButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
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
  // Picker modal styles
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
  },
  modalOptionText: {
    fontSize: 16,
  },
  // Library modal styles
  libraryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  librarySheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  libraryGrid: {
    padding: 12,
    gap: 6,
  },
  libraryThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 0.7,
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  libraryThumbImage: {
    width: '100%',
    height: '100%',
  },
  libraryThumbCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryThumbLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  libraryThumbLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  libraryEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  libraryEmptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  libraryEmptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
