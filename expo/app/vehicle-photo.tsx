import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { useAlert } from '@/components/CustomAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ArrowLeft, Upload, Trash2, Check, Images, Camera } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import type { VehiclePhoto } from '@/constants/types';
import {
  getCarModelImage,
  getBrandImages,
  FALLBACK_CAR_IMAGE,
  type CarImageEntry,
} from '@/constants/carImages';

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMB_SIZE = (SCREEN_WIDTH - 20 * 2 - 12) / 3;

type Tab = 'my-photos' | 'library';

export default function VehiclePhotoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { vehicles, updateVehicle, theme } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const { showError, showConfirm } = useAlert();

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const [photos, setPhotos] = useState<VehiclePhoto[]>(vehicle?.photos || []);
  const [activeTab, setActiveTab] = useState<Tab>('my-photos');
  const [libraryLoading, setLibraryLoading] = useState<string | null>(null);

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t('vehiclePhoto.vehicleNotFound')}</Text>
      </View>
    );
  }

  // Build library images: exact model match first, then all brand images
  const exactMatch = getCarModelImage(vehicle.brand, vehicle.model);
  const allBrandImages = getBrandImages(vehicle.brand);
  const libraryImages: Array<CarImageEntry & { model: string }> = exactMatch
    ? [
        { ...exactMatch, model: vehicle.model },
        ...allBrandImages.filter(img => img.model !== vehicle.model),
      ]
    : allBrandImages;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      if (Platform.OS === 'web') {
        alert(t('vehiclePhoto.permissionGallery'));
      } else {
        showError(t('vehiclePhoto.permissionRequired'), t('vehiclePhoto.permissionGallery'));
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const newPhoto: VehiclePhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        isPrimary: photos.length === 0,
      };
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      await updateVehicle(vehicleId, {
        photos: updatedPhotos,
        primaryPhotoId: newPhoto.isPrimary ? newPhoto.id : vehicle.primaryPhotoId,
      });
      setActiveTab('my-photos');
    }
  };

  const addFromLibrary = async (entry: CarImageEntry & { model: string }) => {
    setLibraryLoading(entry.uri);
    const newPhoto: VehiclePhoto = {
      id: `lib_${Date.now()}`,
      uri: entry.uri,
      isPrimary: photos.length === 0,
    };
    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    await updateVehicle(vehicleId, {
      photos: updatedPhotos,
      primaryPhotoId: newPhoto.isPrimary ? newPhoto.id : vehicle.primaryPhotoId,
    });
    setLibraryLoading(null);
    setActiveTab('my-photos');
  };

  const deletePhoto = async (photoId: string) => {
    const photoToDelete = photos.find(p => p.id === photoId);
    if (!photoToDelete) return;
    const confirmDelete = async () => {
      const updatedPhotos = photos.filter(p => p.id !== photoId);
      if (photoToDelete.isPrimary && updatedPhotos.length > 0) {
        updatedPhotos[0].isPrimary = true;
      }
      setPhotos(updatedPhotos);
      await updateVehicle(vehicleId, {
        photos: updatedPhotos,
        primaryPhotoId: updatedPhotos.length > 0 ? updatedPhotos.find(p => p.isPrimary)?.id : undefined,
      });
    };
    if (Platform.OS === 'web') {
      if (window.confirm(t('vehiclePhoto.deletePhotoConfirm'))) await confirmDelete();
    } else {
      showConfirm(
        t('vehiclePhoto.deletePhoto'),
        t('vehiclePhoto.deletePhotoConfirm'),
        confirmDelete
      );
    }
  };

  const setPrimaryPhoto = async (photoId: string) => {
    const updatedPhotos = photos.map(p => ({ ...p, isPrimary: p.id === photoId }));
    setPhotos(updatedPhotos);
    await updateVehicle(vehicleId, { photos: updatedPhotos, primaryPhotoId: photoId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('vehiclePhoto.vehiclePhotos')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Vehicle info card */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
          {vehicle.year}{vehicle.licensePlate ? ` • ${vehicle.licensePlate}` : ''}
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-photos' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('my-photos')}
        >
          <Camera size={16} color={activeTab === 'my-photos' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'my-photos' ? colors.primary : colors.textSecondary }]}>
            {t('vehiclePhoto.myPhotos')} {photos.length > 0 ? `(${photos.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'library' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('library')}
        >
          <Images size={16} color={activeTab === 'library' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'library' ? colors.primary : colors.textSecondary }]}>
            {t('vehiclePhoto.library')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* My Photos Tab */}
      {activeTab === 'my-photos' && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Upload button */}
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.primary }]}
            onPress={pickImage}
          >
            <Upload size={20} color="#000000" />
            <Text style={[styles.uploadButtonText, { color: '#000000' }]}>
              {t('vehiclePhoto.uploadPhoto')}
            </Text>
          </TouchableOpacity>

          {/* Library shortcut */}
          <TouchableOpacity
            style={[styles.libraryShortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setActiveTab('library')}
          >
            <Images size={18} color={colors.primary} />
            <Text style={[styles.libraryShortcutText, { color: colors.text }]}>
              {t('vehiclePhoto.chooseFromLibrary')}
            </Text>
            <Text style={[styles.libraryCount, { color: colors.textSecondary }]}>
              {libraryImages.length} {t('vehiclePhoto.photos')}
            </Text>
          </TouchableOpacity>

          {/* Photos grid */}
          {photos.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Upload size={48} color={colors.textTertiary} strokeWidth={1.5} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('vehiclePhoto.noPhotosYet')}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('vehiclePhoto.noPhotosDesc')}
              </Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map(photo => (
                <View
                  key={photo.id}
                  style={[
                    styles.photoCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    photo.isPrimary && { borderColor: colors.primary, borderWidth: 3 },
                  ]}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    contentFit="cover"
                    placeholder={{ uri: FALLBACK_CAR_IMAGE }}
                  />
                  {photo.isPrimary && (
                    <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
                      <Check size={12} color="#000000" />
                      <Text style={[styles.primaryText, { color: '#000000' }]}>
                        {t('vehiclePhoto.primary')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.photoActions}>
                    {!photo.isPrimary && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        onPress={() => setPrimaryPhoto(photo.id)}
                      >
                        <Check size={18} color={colors.text} />
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>
                          {t('vehiclePhoto.setAsPrimary')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: '#FF3B3020', borderColor: '#FF3B30' }]}
                      onPress={() => deletePhoto(photo.id)}
                    >
                      <Trash2 size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <View style={styles.libraryContainer}>
          {libraryImages.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, margin: 20 }]}>
              <Images size={48} color={colors.textTertiary} strokeWidth={1.5} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('vehiclePhoto.noLibraryImages')}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('vehiclePhoto.noLibraryImagesDesc')}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.libraryHeader, { color: colors.textSecondary }]}>
                {vehicle.brand} — {libraryImages.length} {t('vehiclePhoto.availablePhotos')}
              </Text>
              <FlatList
                data={libraryImages}
                keyExtractor={item => item.uri}
                numColumns={3}
                contentContainerStyle={styles.libraryGrid}
                columnWrapperStyle={styles.libraryRow}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isAdded = photos.some(p => p.uri === item.uri);
                  const isLoading = libraryLoading === item.uri;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.libraryThumb,
                        { width: THUMB_SIZE, height: THUMB_SIZE * 0.7 },
                        isAdded && { opacity: 0.5 },
                      ]}
                      onPress={() => !isAdded && !isLoading && addFromLibrary(item)}
                      disabled={isAdded || !!libraryLoading}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: item.uri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        placeholder={{ uri: FALLBACK_CAR_IMAGE }}
                      />
                      {/* Overlay: model label */}
                      <View style={styles.thumbOverlay}>
                        <Text style={styles.thumbLabel} numberOfLines={1}>
                          {item.model}
                        </Text>
                        <Text style={styles.thumbYear}>{item.year}</Text>
                      </View>
                      {/* Added badge */}
                      {isAdded && (
                        <View style={[styles.addedBadge, { backgroundColor: colors.primary }]}>
                          <Check size={14} color="#000" />
                        </View>
                      )}
                      {/* Loading indicator */}
                      {isLoading && (
                        <View style={styles.loadingOverlay}>
                          <Text style={styles.loadingText}>...</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}
        </View>
      )}
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
    paddingBottom: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 4,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  infoTitle: { fontSize: 18, fontWeight: '700' },
  infoSubtitle: { fontSize: 14 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 16 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  uploadButtonText: { fontSize: 16, fontWeight: '700' },
  libraryShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  libraryShortcutText: { flex: 1, fontSize: 15, fontWeight: '600' },
  libraryCount: { fontSize: 13 },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
  photoGrid: { gap: 16 },
  photoCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  photoImage: { width: '100%', height: 240 },
  primaryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  primaryText: { fontSize: 12, fontWeight: '700' },
  photoActions: { flexDirection: 'row', padding: 12, gap: 8 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  // Library tab
  libraryContainer: { flex: 1 },
  libraryHeader: {
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  libraryGrid: { paddingHorizontal: 20, paddingBottom: 24 },
  libraryRow: { gap: 6, marginBottom: 6 },
  libraryThumb: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  thumbLabel: { color: '#fff', fontSize: 10, fontWeight: '600' },
  thumbYear: { color: '#ccc', fontSize: 9 },
  addedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
