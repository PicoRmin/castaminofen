import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SLEEP_TIMER_OPTIONS } from '@castaminofen/shared';
import { usePlayerStore } from '@/store/player';
import { syncPlaybackPosition } from '@/lib/playback';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ProgressBar';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { padding: spacing.lg, alignItems: 'center' as const, paddingBottom: spacing.xxl },
    empty: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, gap: spacing.sm },
    emptyText: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' as const },
    emptyHint: { color: colors.textMuted },
    backBtn: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.bgCard,
      borderRadius: radius.full,
    },
    backBtnText: { color: colors.accent, fontWeight: '600' as const },
    topBar: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      width: '100%' as const,
      marginBottom: spacing.lg,
    },
    topBtn: { width: 44, height: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
    nowPlaying: { color: colors.textMuted, fontSize: 13, fontWeight: '600' as const },
    artworkWrap: { marginVertical: spacing.xl },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' as const, textAlign: 'center' as const, marginTop: spacing.lg },
    subtitle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, textAlign: 'center' as const },
    progressWrap: { width: '100%' as const, marginTop: spacing.xl },
    timeRow: { flexDirection: 'row-reverse' as const, justifyContent: 'space-between' as const, marginTop: spacing.sm },
    time: { color: colors.textMuted, fontSize: 12 },
    controls: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.md,
      marginTop: spacing.xl,
      width: '100%' as const,
    },
    playBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accent,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginHorizontal: spacing.sm,
    },
    skipBtn: { alignItems: 'center' as const, width: 48 },
    skipLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
    sideBtn: { width: 44, alignItems: 'center' as const },
    speedBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    speedText: { color: colors.accent, fontWeight: '700' as const, fontSize: 12 },
    sleepRow: {
      width: '100%' as const,
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sleepLabel: { color: colors.textSecondary, textAlign: 'right' as const, marginBottom: spacing.sm, fontWeight: '600' as const },
    sleepChips: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: spacing.sm },
    sleepChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sleepChipText: { color: colors.textSecondary, fontSize: 13 },
  };
}

export default function PlayerScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    currentEpisode,
    streamUrl,
    isPlaying,
    position,
    playbackSpeed,
    sleepTimerEnd,
    isBookmarked,
    accessToken,
    togglePlay,
    setPosition,
    setSpeed,
    setSleepTimer,
    toggleBookmark,
    skipForward,
    skipBackward,
  } = usePlayerStore();

  useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

  useEffect(() => {
    if (!streamUrl) return;
    (async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: isPlaying, rate: playbackSpeed, shouldCorrectPitch: true },
        (status) => {
          if (status.isLoaded) setPosition(status.positionMillis / 1000);
        },
      );
      soundRef.current = sound;
    })();
  }, [streamUrl]);

  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) soundRef.current.playAsync();
    else soundRef.current.pauseAsync();
  }, [isPlaying]);

  useEffect(() => {
    soundRef.current?.setRateAsync(playbackSpeed, true);
  }, [playbackSpeed]);

  useEffect(() => {
    if (!sleepTimerEnd) return;
    const timer = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        usePlayerStore.setState({ isPlaying: false });
        setSleepTimer(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sleepTimerEnd, setSleepTimer]);

  useEffect(() => {
    if (!accessToken || !currentEpisode) return;
    syncRef.current = setInterval(() => {
      void syncPlaybackPosition(accessToken, currentEpisode.id, position, playbackSpeed, currentEpisode.duration);
    }, 30000);
    return () => {
      if (syncRef.current) clearInterval(syncRef.current);
    };
  }, [accessToken, currentEpisode, position, playbackSpeed]);

  const seekTo = async (percent: number) => {
    if (!currentEpisode) return;
    const next = percent * currentEpisode.duration;
    setPosition(next);
    await soundRef.current?.setPositionAsync(next * 1000);
  };

  const handleSkipForward = async () => {
    skipForward(15);
    const next = Math.min(position + 15, currentEpisode?.duration ?? 0);
    await soundRef.current?.setPositionAsync(next * 1000);
  };

  const handleSkipBackward = async () => {
    skipBackward(15);
    const next = Math.max(0, position - 15);
    await soundRef.current?.setPositionAsync(next * 1000);
  };

  if (!currentEpisode) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>اپیزودی انتخاب نشده</Text>
          <Text style={styles.emptyHint}>از صفحه کاوش یک محتوا انتخاب کنید</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="بازگشت" accessibilityRole="button">
            <Text style={styles.backBtnText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = currentEpisode.duration ? (position / currentEpisode.duration) * 100 : 0;

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const idx = speeds.indexOf(playbackSpeed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn} accessibilityLabel="بستن پخش‌کننده" accessibilityRole="button">
            <Ionicons name="chevron-down" size={28} color={colors.textPrimary} accessibilityElementsHidden />
          </TouchableOpacity>
          <Text style={styles.nowPlaying}>در حال پخش</Text>
          <View style={styles.topBtn} />
        </View>

        <View style={styles.artworkWrap}>
          <CoverArt
            type={currentEpisode.contentType || 'AUDIOBOOK'}
            coverUrl={currentEpisode.coverUrl}
            title={currentEpisode.contentTitle}
            size="xl"
            glow
          />
        </View>

        <Text style={styles.title}>{currentEpisode.title}</Text>
        <Text style={styles.subtitle}>{currentEpisode.contentTitle}</Text>

        <View style={styles.progressWrap}>
          <ProgressBar
            progress={progress}
            height={4}
            onSeek={seekTo}
            accessibilityLabel={`پیشرفت پخش ${currentEpisode.title}`}
            positionSeconds={position}
            durationSeconds={currentEpisode.duration}
          />
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(currentEpisode.duration)}</Text>
            <Text style={styles.time}>{formatTime(position)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.sideBtn}
            accessibilityLabel={isBookmarked ? 'حذف نشانک' : 'افزودن نشانک'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={isBookmarked ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipBackward} style={styles.skipBtn} accessibilityLabel="۱۵ ثانیه عقب" accessibilityRole="button">
            <Ionicons name="play-back" size={28} color={colors.textPrimary} />
            <Text style={styles.skipLabel}>۱۵</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playBtn}
            onPress={togglePlay}
            accessibilityLabel={isPlaying ? 'توقف' : 'پخش'}
            accessibilityRole="button"
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={colors.textOnPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipForward} style={styles.skipBtn} accessibilityLabel="۱۵ ثانیه جلو" accessibilityRole="button">
            <Ionicons name="play-forward" size={28} color={colors.textPrimary} />
            <Text style={styles.skipLabel}>۱۵</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={cycleSpeed} style={styles.speedBtn} accessibilityLabel={`سرعت پخش ${playbackSpeed} برابر`} accessibilityRole="button">
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sleepRow}>
          <Text style={styles.sleepLabel}>تایمر خواب</Text>
          <View style={styles.sleepChips}>
            {SLEEP_TIMER_OPTIONS.slice(0, 4).map((m) => (
              <TouchableOpacity
                key={m}
                style={styles.sleepChip}
                onPress={() => setSleepTimer(m)}
                accessibilityLabel={`تایمر خواب ${m} دقیقه`}
                accessibilityRole="button"
              >
                <Text style={styles.sleepChipText}>{m}د</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.sleepChip}
              onPress={() => setSleepTimer(null)}
              accessibilityLabel="خاموش کردن تایمر خواب"
              accessibilityRole="button"
            >
              <Text style={styles.sleepChipText}>خاموش</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
