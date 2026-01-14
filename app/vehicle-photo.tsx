import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ArrowLeft, Upload, Trash2, Check } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import type { VehiclePhoto } from '@/constants/types';

export default function VehiclePhotoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { vehicles, updateVehicle, theme } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const vehicle = vehicles.find(v => v.id === vehicleId);
  const [photos, setPhotos] = useState<VehiclePhoto[]>(vehicle?.photos || []);

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t('vehiclePhoto.vehicleNotFound')}</Text>
      </View>
    );
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      if (Platform.OS === 'web') {
        alert(t('vehiclePhoto.permissionGallery'));
      } else {
        Alert.alert(t('vehiclePhoto.permissionRequired'), t('vehiclePhoto.permissionGallery'));
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
    }
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
      if (window.confirm(t('vehiclePhoto.deletePhotoConfirm'))) {
        await confirmDelete();
      }
    } else {
      Alert.alert(
        t('vehiclePhoto.deletePhoto'),
        t('vehiclePhoto.deletePhotoConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.delete'), style: 'destructive', onPress: confirmDelete },
        ],
        { cancelable: true }
      );
    }
  };

  const setPrimaryPhoto = async (photoId: string) => {
    const updatedPhotos = photos.map(p => ({
      ...p,
      isPrimary: p.id === photoId,
    }));
    setPhotos(updatedPhotos);
    await updateVehicle(vehicleId, { 
      photos: updatedPhotos,
      primaryPhotoId: photoId,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('vehiclePhoto.vehiclePhotos')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              {vehicle.year} • {vehicle.licensePlate}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.primary }]}
            onPress={pickImage}
          >
            <Upload size={20} color="#000000" />
            <Text style={[styles.uploadButtonText, { color: '#000000' }]}>
              {t('vehiclePhoto.uploadPhoto')}
            </Text>
          </TouchableOpacity>

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
              {photos.map((photo) => (
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
        </View>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  content: {
    gap: 20,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  infoSubtitle: {
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  photoGrid: {
    gap: 16,
  },
  photoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 240,
  },
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
  primaryText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  photoActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
});
