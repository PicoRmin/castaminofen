import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '@/store/player';
import { PLAYBACK_SPEEDS, SLEEP_TIMER_OPTIONS } from '@castaminofen/shared';
import { spacing, radius, fonts } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

const COMING_SOON = [
  { icon: 'cloud-download-outline' as const, title: 'دانلود آفلاین' },
  { icon: 'sync-outline' as const, title: 'همگام‌سازی دستگاه‌ها' },
  { icon: 'list-outline' as const, title: 'لیست پخش سفارشی' },
  { icon: 'bookmark-outline' as const, title: 'نشانک‌ها' },
];

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    container: { flex: 1 },
    header: { padding: spacing.md, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const, fontFamily: fonts.bold },
    subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4, fontFamily: fonts.regular },
    section: { padding: spacing.md, marginTop: spacing.sm },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600' as const,
      textAlign: 'right' as const,
      marginBottom: spacing.sm,
      fontFamily: fonts.semibold,
    },
    sectionHint: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'right' as const,
      marginBottom: spacing.sm,
      fontFamily: fonts.regular,
    },
    chipRow: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 44,
      justifyContent: 'center' as const,
    },
    chipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
    chipText: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular },
    chipTextActive: { color: colors.accent, fontWeight: '700' as const, fontFamily: fonts.semibold },
    comingRow: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    toolIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.bgCard,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    comingTitle: { flex: 1, color: colors.textMuted, fontSize: 14, textAlign: 'right' as const, fontFamily: fonts.regular },
    comingBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    comingBadgeText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.medium },
    authSection: { padding: spacing.md, marginTop: spacing.lg },
    loginBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 48,
    },
    loginText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontSize: 16, fontFamily: fonts.bold },
    registerBtn: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginTop: spacing.sm,
      padding: spacing.md,
      minHeight: 44,
    },
    registerText: { color: colors.accent, fontWeight: '600' as const, fontSize: 15, fontFamily: fonts.semibold },
    logoutBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 48,
    },
    logoutText: { color: colors.error, fontWeight: '600' as const, fontSize: 16, fontFamily: fonts.semibold },
    themeBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    themeBtnText: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 15, fontFamily: fonts.semibold },
  };
}

export default function ToolsScreen() {
  const router = useRouter();
  const { playbackSpeed, setSpeed, setSleepTimer, accessToken, logout } = usePlayerStore();
  const { mode, toggleMode, colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>ابزارهای پخش</Text>
          <Text style={styles.subtitle}>سرعت، تایمر خواب و تنظیمات حساب</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ظاهر</Text>
          <TouchableOpacity
            style={styles.themeBtn}
            onPress={toggleMode}
            accessibilityRole="button"
            accessibilityLabel={mode === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
          >
            <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.accent} />
            <Text style={styles.themeBtnText}>
              {mode === 'dark' ? 'حالت روشن' : 'حالت تیره'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سرعت پخش: {playbackSpeed}x</Text>
          <View style={styles.chipRow}>
            {PLAYBACK_SPEEDS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, playbackSpeed === s && styles.chipActive]}
                onPress={() => setSpeed(s)}
                accessibilityLabel={`سرعت ${s} برابر`}
                accessibilityState={{ selected: playbackSpeed === s }}
              >
                <Text style={[styles.chipText, playbackSpeed === s && styles.chipTextActive]}>{s}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تایمر خواب</Text>
          <View style={styles.chipRow}>
            {SLEEP_TIMER_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                style={styles.chip}
                onPress={() => setSleepTimer(m)}
                accessibilityLabel={`تایمر ${m} دقیقه`}
              >
                <Text style={styles.chipText}>{m} دقیقه</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setSleepTimer(null)}
              accessibilityLabel="خاموش کردن تایمر خواب"
            >
              <Text style={styles.chipText}>خاموش</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>به‌زودی</Text>
          <Text style={styles.sectionHint}>این قابلیت‌ها در نسخه‌های بعدی اضافه می‌شوند.</Text>
          {COMING_SOON.map((item) => (
            <View key={item.title} style={styles.comingRow}>
              <View style={styles.comingBadge}>
                <Text style={styles.comingBadgeText}>به‌زودی</Text>
              </View>
              <Text style={styles.comingTitle}>{item.title}</Text>
              <View style={styles.toolIcon}>
                <Ionicons name={item.icon} size={20} color={colors.textMuted} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.authSection}>
          {accessToken ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} accessibilityLabel="خروج از حساب">
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.logoutText}>خروج از حساب</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/login')}
                accessibilityLabel="ورود به حساب"
              >
                <Ionicons name="log-in-outline" size={20} color={colors.textOnPrimary} />
                <Text style={styles.loginText}>ورود به حساب</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push('/register')}
                accessibilityLabel="ساخت حساب جدید"
              >
                <Text style={styles.registerText}>ساخت حساب جدید</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
