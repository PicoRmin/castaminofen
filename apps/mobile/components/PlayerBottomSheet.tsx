import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '@/store/player';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ProgressBar';
import { PlayerControls } from '@/components/PlayerControls';
import { useAudioEngineContext } from '@/context/PlayerAudioContext';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_HEIGHT = 72;
const EXPANDED_HEIGHT = Math.min(SCREEN_HEIGHT * 0.85, SCREEN_HEIGHT - 48);

function createStyles(colors: ThemeColors) {
  return {
    miniRow: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: MINI_HEIGHT,
    },
    info: { flex: 1, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 14 },
    subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    playBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    sheet: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      overflow: 'hidden' as const,
    },
    handle: {
      alignSelf: 'center' as const,
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    expandedHeader: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    nowPlaying: { color: colors.textMuted, fontSize: 13, fontWeight: '600' as const },
    artworkWrap: { alignItems: 'center' as const, marginVertical: spacing.md },
    expandedTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '700' as const,
      textAlign: 'center' as const,
      paddingHorizontal: spacing.lg,
    },
    expandedSubtitle: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center' as const,
      marginTop: spacing.xs,
      paddingHorizontal: spacing.lg,
    },
    expandedBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  };
}

export function PlayerBottomSheet() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const reducedMotion = useReducedMotion();
  const { seekTo, skipForward, skipBackward } = useAudioEngineContext();

  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const expanded = usePlayerStore((s) => s.playerSheetExpanded);
  const setExpanded = usePlayerStore((s) => s.setPlayerSheetExpanded);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const heightAnim = useRef(new Animated.Value(MINI_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = expanded ? EXPANDED_HEIGHT : MINI_HEIGHT;
    if (reducedMotion) {
      heightAnim.setValue(target);
      backdropAnim.setValue(expanded ? 1 : 0);
      return;
    }
    Animated.parallel([
      Animated.spring(heightAnim, { toValue: target, useNativeDriver: false, bounciness: 4 }),
      Animated.timing(backdropAnim, { toValue: expanded ? 1 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [expanded, heightAnim, backdropAnim, reducedMotion]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => expanded && Math.abs(g.dy) > 8,
      onPanResponderMove: (_, g) => {
        if (!expanded) return;
        const next = Math.max(MINI_HEIGHT, EXPANDED_HEIGHT + g.dy);
        heightAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60 || g.vy > 0.5) setExpanded(false);
        else {
          Animated.spring(heightAnim, { toValue: EXPANDED_HEIGHT, useNativeDriver: false }).start();
        }
      },
    }),
  ).current;

  if (!currentEpisode) return null;

  const progress = currentEpisode.duration ? (position / currentEpisode.duration) * 100 : 0;

  return (
    <>
      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: '#000', opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }) },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setExpanded(false)} accessibilityLabel="بستن پخش‌کننده" />
      </Animated.View>

      <Animated.View style={[styles.sheet, { height: heightAnim }]}>
        {expanded ? (
          <View {...panResponder.panHandlers} style={{ flex: 1 }}>
            <View style={styles.handle} accessibilityElementsHidden />
            <View style={styles.expandedHeader}>
              <TouchableOpacity
                onPress={() => setExpanded(false)}
                hitSlop={12}
                accessibilityLabel="بستن پخش‌کننده"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.nowPlaying}>در حال پخش</Text>
              <View style={{ width: 28 }} />
            </View>
            <View style={styles.artworkWrap}>
              <CoverArt
                type={currentEpisode.contentType || 'PODCAST'}
                coverUrl={currentEpisode.coverUrl}
                title={currentEpisode.contentTitle}
                size="lg"
                glow
              />
            </View>
            <Text style={styles.expandedTitle} numberOfLines={2}>{currentEpisode.title}</Text>
            <Text style={styles.expandedSubtitle} numberOfLines={1}>{currentEpisode.contentTitle}</Text>
            <View style={styles.expandedBody}>
              <PlayerControls onSeek={seekTo} onSkipForward={() => void skipForward()} onSkipBackward={() => void skipBackward()} />
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`در حال پخش: ${currentEpisode.title}. برای باز کردن پخش‌کننده ضربه بزنید`}
        >
          <ProgressBar
            progress={progress}
            height={2}
            accessibilityLabel={`پیشرفت ${currentEpisode.title}`}
            positionSeconds={position}
            durationSeconds={currentEpisode.duration}
          />
          <View style={styles.miniRow}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                togglePlay();
              }}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'توقف پخش' : 'شروع پخش'}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={colors.textOnPrimary} accessibilityElementsHidden />
            </TouchableOpacity>
            <View style={styles.info} importantForAccessibility="no-hide-descendants">
              <Text style={styles.title} numberOfLines={1}>{currentEpisode.title}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{currentEpisode.contentTitle}</Text>
            </View>
            <CoverArt
              type={currentEpisode.contentType || 'PODCAST'}
              coverUrl={currentEpisode.coverUrl}
              title={currentEpisode.contentTitle}
              size="sm"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}
