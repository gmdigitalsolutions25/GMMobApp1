import { useDesignV2 } from '@/hooks/useDesignV2';
import HomeScreenV2 from '@/components-v2/home/HomeScreenV2';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Wrench,
  CheckCircle,
  Bot,
  Send,
  Calendar,
  Fuel,
  ArrowRight,
  ChevronDown,
  Car,
  Phone,
  MapPin,
  Star,
  Bell,
  X,
  Home,
  User,
  Settings,
  ShoppingBag,
  Building2,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import { getTranslatedServices, carsForSale, serviceCenters } from '@/constants/mockData';
import { trpc } from '@/lib/trpc';
import { getUnreadCount } from '@/lib/notifications';
import ProfileCompletionBanner from '@/components-v2/shared/ProfileCompletionBanner';


const { width } = Dimensions.get('window');

export default function HomeScreenRouter() {
  const { isV2 } = useDesignV2();
  if (isV2) return <HomeScreenV2 />;
  return <HomeScreenV1 />;
}

function HomeScreenV1() {
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread notification count
  useEffect(() => {
    const loadUnread = async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
    };
    loadUnread();
    // Refresh count when screen comes into focus
    const interval = setInterval(loadUnread, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);
  const { theme, vehicles, user } = useApp();
  const serviceTypes = getTranslatedServices(t);
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Force re-render by toggling state, images will re-fetch from server
    setTimeout(() => setRefreshing(false), 1000);
  }, []);
  const sparePartsSectionRef = useRef<View>(null);
  const carsSectionRef = useRef<View>(null);
  const serviceCentersSectionRef = useRef<View>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuSlideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const menuOverlayAnim = useRef(new Animated.Value(0)).current;
  const [isSparePartsDropdownOpen, setIsSparePartsDropdownOpen] = useState(false);
  const [selectedSparePartsVehicleId, setSelectedSparePartsVehicleId] = useState<string | null>(null);
  const [activeSparePartsTab, setActiveSparePartsTab] = useState<'garage' | 'vin' | 'ai'>('garage');
  const [activeCarsTab, setActiveCarsTab] = useState<'new' | 'preowned'>('new');
  const [aiQuery, setAiQuery] = useState('');
  const [vinQuery, setVinQuery] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [vinResult, setVinResult] = useState<any>(null);
  const sparePartsMutation = trpc.ai.spareParts.useMutation();
  const { language } = useApp();

  const selectedSparePartsVehicle = selectedSparePartsVehicleId
    ? vehicles.find((v) => v.id === selectedSparePartsVehicleId)
    : vehicles[0];

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(menuOverlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: -width * 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(menuOverlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
  };

  const menuItems = [
    { key: 'home', icon: Home, label: t('menu.home'), action: () => { closeMenu(); } },
    { key: 'myGarage', icon: Car, label: t('menu.myGarage'), action: () => { closeMenu(); router.push('/(tabs)/vehicles'); } },
    { key: 'appointments', icon: Calendar, label: t('menu.appointments'), action: () => { closeMenu(); router.push('/(tabs)/appointments'); } },
    { key: 'spareParts', icon: Wrench, label: t('menu.spareParts'), action: () => {
      closeMenu();
      setTimeout(() => {
        sparePartsSectionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (_x: number, y: number) => { scrollViewRef.current?.scrollTo({ y, animated: true }); },
          () => {}
        );
      }, 300);
    }},
    { key: 'carsForSale', icon: ShoppingBag, label: t('menu.carsForSale'), action: () => {
      closeMenu();
      setTimeout(() => {
        carsSectionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (_x: number, y: number) => { scrollViewRef.current?.scrollTo({ y, animated: true }); },
          () => {}
        );
      }, 300);
    }},
    { key: 'serviceCenters', icon: Building2, label: t('menu.serviceCenters'), action: () => {
      closeMenu();
      setTimeout(() => {
        serviceCentersSectionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (_x: number, y: number) => { scrollViewRef.current?.scrollTo({ y, animated: true }); },
          () => {}
        );
      }, 300);
    }},
    { key: 'notifications', icon: Bell, label: t('menu.notifications'), action: () => { closeMenu(); router.push('/notifications'); } },
    { key: 'profile', icon: User, label: t('menu.profile'), action: () => { closeMenu(); router.push('/profile'); } },
  ];

  useEffect(() => {
    const floatAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation1.start();
    floatAnimation2.start();
    pulseAnimation.start();

    return () => {
      floatAnimation1.stop();
      floatAnimation2.stop();
      pulseAnimation.stop();
    };
  }, [float1, float2, pulse]);

  const float1Y = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const float2Y = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const renderServiceIcon = (iconName: string) => {
    if (iconName === 'wrench') {
      return <Wrench size={24} color={colors.primary} />;
    }
    return <CheckCircle size={24} color={colors.primary} />;
  };

  const renderCarSilhouettes = () => (
    <>
      <View style={[styles.carSilhouette, styles.carSilhouette1, { borderColor: `${colors.primary}08` }]}>
        <Car size={140} color={`${colors.primary}12`} strokeWidth={1} />
      </View>
      <View style={[styles.carSilhouette, styles.carSilhouette2, { borderColor: `${colors.primary}06` }]}>
        <Car size={100} color={`${colors.primary}08`} strokeWidth={0.8} />
      </View>
      <View style={[styles.carSilhouette, styles.carSilhouette3, { borderColor: `${colors.primary}10` }]}>
        <Wrench size={80} color={`${colors.primary}10`} strokeWidth={1} />
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: colors.background },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.logoContainer} onPress={openMenu} activeOpacity={0.7}>
            <Image
              source={require('@/assets/images/groupmotors-logo.jpg')}
              style={styles.logoImage}
              contentFit="contain"
            />
            <Text style={[styles.logoText, { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }]}>Qaraj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={[styles.notifButton, { backgroundColor: colors.primary }]}
          >
            <Bell size={20} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.primary }]}>
                <Text style={[styles.notifBadgeText, { color: colors.primary }]}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Profile completion banner */}
        <ProfileCompletionBanner
          user={user}
          vehicles={vehicles}
          colors={colors}
          onComplete={() => router.push('/onboarding')}
        />

        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={[styles.diagonalStripe, styles.diagonalStripe1, { backgroundColor: `${colors.primary}08` }]} />
            <View style={[styles.diagonalStripe, styles.diagonalStripe2, { backgroundColor: `${colors.primary}05` }]} />
            <View style={[styles.diagonalStripe, styles.diagonalStripe3, { backgroundColor: `${colors.primary}12` }]} />
            
            {renderCarSilhouettes()}
            
            <Animated.View
              style={[
                styles.floatingAccent1,
                {
                  backgroundColor: `${colors.primary}10`,
                  transform: [{ translateY: float1Y }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.floatingAccent2,
                {
                  backgroundColor: `${colors.primary}08`,
                  transform: [{ translateY: float2Y }, { scale: pulse }],
                },
              ]}
            />
            
            <View style={[styles.dotPattern, { opacity: 0.4 }]} />
          </View>

          <View style={styles.heroContent}>
            <Text style={[styles.heroTitle, { color: colors.text, textAlign: 'center' }]}>
              {t('home.yourComplete')}
            </Text>
            <Text style={[styles.heroTitleAccent, { color: colors.primary, textAlign: 'center' }]}>
              {t('home.autoSolution')}
            </Text>
            <Text style={[styles.heroDescription, { color: colors.textSecondary, textAlign: 'center' }]}>
              {t('home.heroDescription')}
            </Text>

            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/appointments')}
            >
              <Text style={[styles.ctaButtonText, { color: '#000000' }]}>
                {t('home.bookServiceNow')}
              </Text>
              <ArrowRight size={20} color="#000000" />
            </TouchableOpacity>

            <View style={styles.secondaryButtonsContainer}>
              <View style={styles.secondaryButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.secondaryButtonSmall,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  onPress={() => {
                    sparePartsSectionRef.current?.measureLayout(
                      scrollViewRef.current as any,
                      (_x, y) => {
                        scrollViewRef.current?.scrollTo({ y, animated: true });
                      },
                      () => {}
                    );
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    {t('home.spareParts')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryButtonSmall,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  onPress={() => router.push('/(tabs)/vehicles')}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    {t('home.myGarage')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.secondaryButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.secondaryButtonSmall,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  onPress={() => {
                    carsSectionRef.current?.measureLayout(
                      scrollViewRef.current as any,
                      (_x, y) => {
                        scrollViewRef.current?.scrollTo({ y, animated: true });
                      },
                      () => {}
                    );
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    {t('home.cars')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryButtonSmall,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  onPress={() => {
                    serviceCentersSectionRef.current?.measureLayout(
                      scrollViewRef.current as any,
                      (_x, y) => {
                        scrollViewRef.current?.scrollTo({ y, animated: true });
                      },
                      () => {}
                    );
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    {t('home.serviceCenters')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>15+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.years')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.experience')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              5000+
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.happy')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.customers')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>24/7</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.support')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.available')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.ourServices')}
          </Text>

          <View style={styles.servicesGrid}>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => router.push(`/service-details?id=${service.id}`)}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    { backgroundColor: `${colors.primary}20` },
                  ]}
                >
                  {renderServiceIcon(service.icon)}
                </View>
                <Text style={[styles.serviceName, { color: colors.text }]}>
                  {service.name}
                </Text>
                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                  {service.description}
                </Text>
                <View style={styles.serviceFooter}>
                  <Text style={[styles.servicePrice, { color: colors.primary }]}>
                    ₼{service.price}
                  </Text>
                  <Text style={[styles.serviceLinkText, { color: colors.primary }]}>
                    {t('home.viewDetails')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section} ref={sparePartsSectionRef}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.genuineSpareParts').split(' ')[0]} <Text style={{ color: colors.primary }}>{t('home.genuineSpareParts').split(' ').slice(1).join(' ')}</Text>
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('home.sparePartsDescription')}
          </Text>

          <View style={[styles.materialTabContainer, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.materialTab}
              onPress={() => setActiveSparePartsTab('garage')}
            >
              <Text style={[
                styles.materialTabText,
                { color: activeSparePartsTab === 'garage' ? colors.primary : colors.textSecondary }
              ]}>
                {t('home.myGarageTab')}
              </Text>
              {activeSparePartsTab === 'garage' && (
                <View style={[styles.materialTabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.materialTab}
              onPress={() => setActiveSparePartsTab('vin')}
            >
              <Text style={[
                styles.materialTabText,
                { color: activeSparePartsTab === 'vin' ? colors.primary : colors.textSecondary }
              ]}>
                {t('home.vinSearch')}
              </Text>
              {activeSparePartsTab === 'vin' && (
                <View style={[styles.materialTabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.materialTab}
              onPress={() => setActiveSparePartsTab('ai')}
            >
              <Text style={[
                styles.materialTabText,
                { color: activeSparePartsTab === 'ai' ? colors.primary : colors.textSecondary }
              ]}>
                {t('home.aiAssistant')}
              </Text>
              {activeSparePartsTab === 'ai' && (
                <View style={[styles.materialTabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          </View>

          {activeSparePartsTab === 'garage' && (
            <View style={styles.tabContent}>
              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={[
                    styles.select,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setIsSparePartsDropdownOpen(true)}
                >
                  <Text style={[styles.selectText, { color: colors.text }]}>
                    {selectedSparePartsVehicle
                      ? `${selectedSparePartsVehicle.brand} ${selectedSparePartsVehicle.model} (${selectedSparePartsVehicle.year})`
                      : t('home.selectYourCar')}
                  </Text>
                  <ChevronDown size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeSparePartsTab === 'vin' && (
            <View style={styles.tabContent}>
              <View style={styles.formGroup}>
                <TextInput
                  style={[
                    styles.vinInput,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder={t('home.enterVinNumber')}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <TouchableOpacity
                style={[styles.searchButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.searchButtonText, { color: '#000000' }]}>
                  {t('home.searchParts')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeSparePartsTab === 'ai' && (
            <View style={styles.tabContent}>
              <View
                style={[
                  styles.aiAssistantCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.aiHeader}>
                  <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
                    <Bot size={20} color="#000000" />
                  </View>
                  <Text style={[styles.aiTitle, { color: colors.text }]}>
                    {t('home.aiPartsAssistant')}
                  </Text>
                </View>

                <Text style={[styles.aiDescription, { color: colors.textSecondary }]}>
                  {t('home.askAboutParts')}
                </Text>
                <Text style={[styles.aiExample, { color: colors.textTertiary }]}>
                  {t('home.aiExample')}
                </Text>

                <View style={styles.aiInputContainer}>
                  <TextInput
                    style={[
                      styles.aiInput,
                      { backgroundColor: colors.background, color: colors.text },
                    ]}
                    placeholder={t('home.askAboutPartsPlaceholder')}
                    placeholderTextColor={colors.textTertiary}
                    value={aiQuery}
                    onChangeText={setAiQuery}
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      if (!aiQuery.trim() || sparePartsMutation.isPending) return;
                      const vehicle = selectedSparePartsVehicle;
                      sparePartsMutation.mutate(
                        {
                          query: aiQuery.trim(),
                          vehicleBrand: vehicle?.brand,
                          vehicleModel: vehicle?.model,
                          vehicleYear: vehicle?.year,
                          vin: vehicle?.vin || undefined,
                          language: (language as 'en' | 'az' | 'ru') || 'en',
                        },
                        {
                          onSuccess: (data) => setAiResult(data.result),
                        }
                      );
                    }}
                  />
                  <TouchableOpacity
                    style={[styles.aiSendButton, { backgroundColor: sparePartsMutation.isPending ? colors.border : colors.primary }]}
                    disabled={sparePartsMutation.isPending}
                    onPress={() => {
                      if (!aiQuery.trim() || sparePartsMutation.isPending) return;
                      const vehicle = selectedSparePartsVehicle;
                      sparePartsMutation.mutate(
                        {
                          query: aiQuery.trim(),
                          vehicleBrand: vehicle?.brand,
                          vehicleModel: vehicle?.model,
                          vehicleYear: vehicle?.year,
                          vin: vehicle?.vin || undefined,
                          language: (language as 'en' | 'az' | 'ru') || 'en',
                        },
                        {
                          onSuccess: (data) => setAiResult(data.result),
                        }
                      );
                    }}
                  >
                    <Send size={20} color={sparePartsMutation.isPending ? colors.textTertiary : '#000000'} />
                  </TouchableOpacity>
                </View>

                {sparePartsMutation.isPending && (
                  <View style={{ marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ color: colors.primary, fontSize: 14 }}>🔍 {t('home.searchingParts')}</Text>
                  </View>
                )}

                {aiResult && !sparePartsMutation.isPending && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15, marginBottom: 8 }}>
                      {aiResult.summary}
                    </Text>
                    {aiResult.parts?.map((part: any, idx: number) => (
                      <View key={idx} style={[{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, flex: 1 }}>{part.name}</Text>
                          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{part.estimatedPrice}</Text>
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 2 }}>{t('home.partNumber')}: {part.partNumber} · {part.category}</Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{part.notes}</Text>
                      </View>
                    ))}
                    {aiResult.maintenanceTips?.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>💡 {t('home.maintenanceTips')}</Text>
                        {aiResult.maintenanceTips.map((tip: string, idx: number) => (
                          <Text key={idx} style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>• {tip}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section} ref={carsSectionRef}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.carsForSale').split(' ').slice(0, 2).join(' ')} <Text style={{ color: colors.primary }}>{t('home.carsForSale').split(' ').slice(2).join(' ')}</Text>
          </Text>

          <View style={[styles.materialTabContainer, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.materialTab}
              onPress={() => setActiveCarsTab('new')}
            >
              <Text style={[
                styles.materialTabText,
                { color: activeCarsTab === 'new' ? colors.primary : colors.textSecondary }
              ]}>
                {t('home.newCars')}
              </Text>
              {activeCarsTab === 'new' && (
                <View style={[styles.materialTabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.materialTab}
              onPress={() => setActiveCarsTab('preowned')}
            >
              <Text style={[
                styles.materialTabText,
                { color: activeCarsTab === 'preowned' ? colors.primary : colors.textSecondary }
              ]}>
                {t('home.preownedCars')}
              </Text>
              {activeCarsTab === 'preowned' && (
                <View style={[styles.materialTabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionDescription, { color: colors.textSecondary, marginTop: 16 }]}>
            {activeCarsTab === 'new' 
              ? t('home.newCarsDescription')
              : t('home.preownedCarsDescription')}
          </Text>

          {carsForSale
            .filter((car) => activeCarsTab === 'new' ? car.condition === 'new' : car.condition === 'pre-owned')
            .slice(0, 1)
            .map((car) => (
            <View
              key={car.id}
              style={[
                styles.carCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.carImageContainer}>
                <Image
                  source={{ uri: car.imageUri }}
                  style={styles.carImage}
                  contentFit="cover"
                />
                <View style={[styles.carBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.carBadgeText, { color: '#000000' }]}>
                    {car.condition === 'new' ? t('home.newCars') : t('home.preownedCars')}
                  </Text>
                </View>
              </View>

              <View style={styles.carInfo}>
                <Text style={[styles.carTitle, { color: colors.text }]}>
                  {car.brand} {car.model} {car.year}
                </Text>
                <Text style={[styles.carPrice, { color: colors.primary }]}>
                  ₼{car.price.toLocaleString()}
                </Text>

                <View style={styles.carSpecs}>
                  <View style={styles.carSpec}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text style={[styles.carSpecText, { color: colors.textSecondary }]}>
                      {car.year}
                    </Text>
                  </View>
                  <View style={styles.carSpec}>
                    <Wrench size={16} color={colors.textSecondary} />
                    <Text style={[styles.carSpecText, { color: colors.textSecondary }]}>
                      {car.mileage} km
                    </Text>
                  </View>
                  <View style={styles.carSpec}>
                    <Fuel size={16} color={colors.textSecondary} />
                    <Text style={[styles.carSpecText, { color: colors.textSecondary }]}>
                      {car.fuelType}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.inquireButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.inquireButtonText, { color: '#000000' }]}>
                    {t('home.inquireNow')}
                  </Text>
                  <ArrowRight size={20} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { marginBottom: 40 }]} ref={serviceCentersSectionRef}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.serviceCentersTitle').split(' ')[0]} <Text style={{ color: colors.primary }}>{t('home.serviceCentersTitle').split(' ').slice(1).join(' ')}</Text>
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('home.serviceCentersDescription')}
          </Text>

          {serviceCenters.map((center) => (
            <View
              key={center.id}
              style={[
                styles.serviceCenterCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.serviceCenterImageContainer}>
                <Image
                  source={typeof center.imageUri === 'string' ? { uri: center.imageUri } : center.imageUri}
                  style={styles.serviceCenterImage}
                  contentFit="cover"
                />
              </View>

              <View style={styles.serviceCenterInfo}>
                <View style={styles.serviceCenterHeader}>
                  <Text style={[styles.serviceCenterName, { color: colors.text }]}>
                    {center.name}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color={colors.primary} fill={colors.primary} />
                    <Text style={[styles.ratingText, { color: colors.text }]}>
                      {center.rating}
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceCenterDetails}>
                  <View style={styles.serviceCenterDetailRow}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text style={[styles.serviceCenterDetailText, { color: colors.textSecondary }]}>
                      {center.address}
                    </Text>
                  </View>
                  <View style={styles.serviceCenterDetailRow}>
                    <Phone size={16} color={colors.textSecondary} />
                    <Text style={[styles.serviceCenterDetailText, { color: colors.textSecondary }]}>
                      {center.phoneDisplay || center.phone}{center.shortCode ? ` / ${center.shortCode}` : ''}
                    </Text>
                  </View>
                  {center.workingHours?.service ? (
                    <View style={styles.serviceCenterDetailRow}>
                      <Clock size={16} color={colors.textSecondary} />
                      <Text style={[styles.serviceCenterDetailText, { color: colors.textSecondary }]}>
                        {center.workingHours.service}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.serviceTagsContainer}>
                  {center.services.slice(0, 3).map((service, index) => (
                    <View
                      key={index}
                      style={[
                        styles.serviceTag,
                        { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` },
                      ]}
                    >
                      <Text style={[styles.serviceTagText, { color: colors.primary }]}>
                        {service}
                      </Text>
                    </View>
                  ))}
                  {center.services.length > 3 && (
                    <View
                      style={[
                        styles.serviceTag,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.serviceTagText, { color: colors.textSecondary }]}>
                        +{center.services.length - 3}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.serviceCenterActions}>
                  <TouchableOpacity
                    style={[
                      styles.serviceCenterButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => Linking.openURL(`tel:${center.phone}`)}
                  >
                    <Phone size={18} color="#000000" />
                    <Text style={[styles.serviceCenterButtonText, { color: '#000000' }]}>
                      {t('home.callNow')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.serviceCenterButtonSecondary,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={() => {
                      const url = center.mapUrl || Platform.select({
                        ios: `maps:?q=${encodeURIComponent(center.address)}&ll=${center.lat},${center.lng}`,
                        android: `geo:${center.lat},${center.lng}?q=${encodeURIComponent(center.address)}`,
                        default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.address)}`,
                      });
                      Linking.openURL(url!);
                    }}
                  >
                    <MapPin size={18} color={colors.primary} />
                    <Text style={[styles.serviceCenterButtonTextSecondary, { color: colors.primary }]}>
                      {t('home.getDirections')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={isSparePartsDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSparePartsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSparePartsDropdownOpen(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>
              {t('home.selectVehicleForSpareParts')}
            </Text>
            <ScrollView style={styles.dropdownList}>
              {vehicles.length === 0 ? (
                <View style={styles.emptyDropdownState}>
                  <Text style={[styles.emptyDropdownText, { color: colors.textSecondary }]}>
                    {t('home.noVehiclesAdded')}
                  </Text>
                </View>
              ) : (
                vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.dropdownItem,
                      {
                        backgroundColor:
                          selectedSparePartsVehicleId === vehicle.id
                            ? `${colors.primary}15`
                            : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSparePartsVehicleId(vehicle.id);
                      setIsSparePartsDropdownOpen(false);
                    }}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Car
                        size={20}
                        color={
                          selectedSparePartsVehicleId === vehicle.id
                            ? colors.primary
                            : colors.text
                        }
                      />
                      <View style={styles.dropdownItemText}>
                        <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>
                          {vehicle.brand} {vehicle.model}
                        </Text>
                        <Text
                          style={[
                            styles.dropdownItemSubtitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {vehicle.year} • {vehicle.licensePlate}
                        </Text>
                      </View>
                    </View>
                    {selectedSparePartsVehicleId === vehicle.id && (
                      <View
                        style={[
                          styles.selectedIndicator,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <View style={styles.menuOverlayContainer}>
          <Animated.View
            style={[
              styles.menuOverlay,
              { opacity: menuOverlayAnim },
            ]}
          >
            <TouchableOpacity
              style={styles.menuOverlayTouchable}
              activeOpacity={1}
              onPress={closeMenu}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.menuDrawer,
              {
                backgroundColor: colors.surface,
                transform: [{ translateX: menuSlideAnim }],
                paddingTop: insets.top,
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <View style={styles.menuLogoRow}>
                <View style={[styles.menuLogoIcon, { backgroundColor: colors.primary }]}>
                  <Wrench size={22} color={colors.background} />
                </View>
                <Text style={[styles.menuLogoText, { color: colors.text }]}>Qaraj</Text>
              </View>
              <TouchableOpacity onPress={closeMenu} style={[styles.menuCloseButton, { backgroundColor: colors.background }]}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <ScrollView style={styles.menuItemsList} showsVerticalScrollIndicator={false}>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.menuItem}
                    onPress={item.action}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.menuItemIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                      <IconComponent size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={[styles.menuFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.menuFooterText, { color: colors.textTertiary }]}>Qaraj v1.6</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroSection: {
    paddingVertical: 23,
    paddingTop: 128,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 420,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  diagonalStripe: {
    position: 'absolute',
    width: width * 1.5,
    height: 200,
    transform: [{ rotate: '-15deg' }],
  },
  diagonalStripe1: {
    top: -50,
    left: -100,
    opacity: 0.65,
  },
  diagonalStripe2: {
    top: 120,
    right: -150,
    opacity: 0.55,
  },
  diagonalStripe3: {
    bottom: 80,
    left: -80,
    height: 150,
    opacity: 0.75,
  },
  carSilhouette: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
  },
  carSilhouette1: {
    top: -20,
    right: -40,
    width: 180,
    height: 180,
    transform: [{ rotate: '12deg' }],
  },
  carSilhouette2: {
    bottom: 30,
    left: -30,
    width: 130,
    height: 130,
    transform: [{ rotate: '-8deg' }],
  },
  carSilhouette3: {
    top: 160,
    right: 30,
    width: 110,
    height: 110,
    transform: [{ rotate: '20deg' }],
  },
  floatingAccent1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 80,
    left: 40,
    opacity: 0.85,
  },
  floatingAccent2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: 100,
    right: 60,
    opacity: 0.75,
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
  },
  heroTitleAccent: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  secondaryButtonsContainer: {
    gap: 12,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  secondaryButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 35,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2A3447',
  },
  section: {
    marginBottom: 32,
    marginTop: 60,
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
  formGroup: {
    marginBottom: 16,
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    marginBottom: 12,
    minHeight: 36,
  },
  serviceFooter: {
    marginTop: 4,
    gap: 8,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  serviceLinkText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },

  materialTabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  materialTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative' as const,
  },
  materialTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  materialTabIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabContent: {
    marginTop: 4,
  },
  vinInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  searchButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  aiAssistantCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  aiDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  aiExample: {
    fontSize: 12,
    fontStyle: 'italic' as const,
    marginBottom: 16,
  },
  aiInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  aiInput: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
  },
  aiSendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
  },
  carImageContainer: {
    position: 'relative',
    height: 200,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  carBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  carInfo: {
    padding: 20,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  carPrice: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  carSpecs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  carSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carSpecText: {
    fontSize: 13,
  },
  inquireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  inquireButtonText: {
    fontSize: 15,
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
  emptyDropdownState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDropdownText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  serviceCenterCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  serviceCenterImageContainer: {
    height: 160,
  },
  serviceCenterImage: {
    width: '100%',
    height: '100%',
  },
  serviceCenterInfo: {
    padding: 20,
  },
  serviceCenterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceCenterName: {
    fontSize: 18,
    fontWeight: '700' as const,
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  serviceCenterDetails: {
    gap: 8,
    marginBottom: 16,
  },
  serviceCenterDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceCenterDetailText: {
    fontSize: 14,
    flex: 1,
  },
  serviceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  serviceTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  serviceCenterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceCenterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  serviceCenterButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  serviceCenterButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  serviceCenterButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  menuOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  menuOverlayTouchable: {
    flex: 1,
  },
  menuDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  menuLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuLogoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLogoText: {
    fontSize: 26,
    fontWeight: '700' as const,
  },
  menuCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 20,
  },
  menuItemsList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  menuFooter: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  menuFooterText: {
    fontSize: 12,
  },
});
