import { useReducedMotion } from '@/hooks/useReducedMotion';
import { View } from 'react-native';
import { radius, spacing } from '@/constants/theme';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height?: number;
  style?: object;
  rounded?: boolean;
}

function createStyles(colors: ThemeColors) {
  return {
    box: {
      backgroundColor: colors.bgCard,
      opacity: 0.7,
    },
    boxStatic: {
      opacity: 0.55,
    },
    grid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.md,
      padding: spacing.md,
    },
    card: {
      width: '47%' as const,
      gap: spacing.xs,
    },
    cover: {
      borderRadius: radius.md,
      marginBottom: spacing.xs,
    },
  };
}

export function SkeletonBox({ width = '100%', height = 16, style, rounded }: SkeletonBoxProps) {
  const reducedMotion = useReducedMotion();
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[
        styles.box,
        reducedMotion && styles.boxStatic,
        { width, height, borderRadius: rounded ? radius.full : radius.sm },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export function ContentGridSkeleton({ count = 4 }: { count?: number }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.grid} accessibilityLabel="در حال بارگذاری" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBox height={140} style={styles.cover} />
          <SkeletonBox height={14} width="80%" />
          <SkeletonBox height={10} width="55%" style={{ marginTop: spacing.xs }} />
        </View>
      ))}
    </View>
  );
}
