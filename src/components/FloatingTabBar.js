import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../theme/tokens';

/**
 * Floating pill navigation bar — custom React Navigation tabBar.
 * Ported from styles.css `.floating-nav` / `.nav-pill-indicator` (:357–394).
 *
 * ── Animation logic (the part to review) ──────────────────────────────────
 * A single navy "pill" indicator slides horizontally behind the active tab.
 *
 * We measure each tab's flow box via onLayout → { x, width, height }, all
 * relative to the BlurView's content origin. The indicator is the FIRST child
 * and is `position:absolute` with NO top/left set, so Yoga lays it out at its
 * static *flow* position — which is the content top-left, i.e. exactly the same
 * origin as the first tab's { x, y }. That makes the math immune to however the
 * container's padding is accounted for:
 *
 *   translateX = activeTab.x - firstTab.x   // 0 for the first tab
 *   width      = activeTab.width
 *   height     = activeTab.height            // all tabs share a height
 *
 * translateX + width animate together (parallel timing, 350ms,
 * cubic-bezier(0.34,1.56,0.64,1) to match the CSS's slight overshoot — the
 * spec's "ease-out" with the CSS bezier as source of truth). width is a layout
 * prop so the whole animation runs with useNativeDriver:false.
 *
 * First measure snaps into place (setValue, no animation); subsequent index
 * changes animate.
 *
 * Android note: expo-blur (SDK 55) only truly blurs with a BlurTargetView ref,
 * which is too invasive here — the translucent white background is the Android
 * fallback; iOS/web get real frosted glass.
 */

const INACTIVE = 'rgba(255,255,255,0.55)';
const ACTIVE = colors.yellow; // #F59E0B
const ICON_SIZE = 18;
const NAV_PADDING = 5; // .floating-nav padding
const DURATION = 350;
const EASING = Easing.bezier(0.34, 1.56, 0.64, 1);

export function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [layouts, setLayouts] = useState({}); // { [index]: { x, width, height } }

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const didInit = useRef(false);

  const active = layouts[state.index];
  const first = layouts[0];
  const ready = !!(active && first);

  useEffect(() => {
    if (!active || !first) return;
    const toX = active.x - first.x;
    const toW = active.width;
    if (!didInit.current) {
      indicatorX.setValue(toX);
      indicatorW.setValue(toW);
      didInit.current = true;
      return;
    }
    Animated.parallel([
      Animated.timing(indicatorX, { toValue: toX, duration: DURATION, easing: EASING, useNativeDriver: false }),
      Animated.timing(indicatorW, { toValue: toW, duration: DURATION, easing: EASING, useNativeDriver: false }),
    ]).start();
  }, [state.index, active, first, indicatorX, indicatorW]);

  const onTabLayout = (index) => (e) => {
    const { x, width, height } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const cur = prev[index];
      if (cur && cur.x === x && cur.width === width && cur.height === height) return prev;
      return { ...prev, [index]: { x, width, height } };
    });
  };

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <View style={styles.shadow}>
        <BlurView intensity={20} tint="light" style={styles.nav}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: indicatorW,
                height: ready ? active.height : 0,
                opacity: ready ? 1 : 0,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const color = isFocused ? ACTIVE : INACTIVE;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };
            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                onLayout={onTabLayout(index)}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
                style={styles.tab}
              >
                {({ pressed }) => (
                  <>
                    <View
                      style={[
                        styles.icon,
                        isFocused && styles.iconActive,
                        pressed && !isFocused && styles.iconPressed,
                      ]}
                    >
                      {options.tabBarIcon
                        ? options.tabBarIcon({ focused: isFocused, color, size: ICON_SIZE })
                        : null}
                    </View>
                    <Text numberOfLines={1} style={[styles.label, { color }]}>
                      {String(label)}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  // Separate shadow layer: the BlurView itself uses overflow:hidden to clip the
  // blur to the pill radius, which would also clip its own shadow on iOS.
  shadow: {
    borderRadius: radii.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 12,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: NAV_PADDING,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.85)',
    borderRightWidth: 1.5,
    borderRightColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  indicator: {
    position: 'absolute',
    backgroundColor: colors.navy, // #0C1A2E
    borderRadius: radii.pill,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    minWidth: 58,
  },
  icon: {},
  iconActive: { transform: [{ translateY: -1 }, { scale: 1.15 }] },
  iconPressed: { transform: [{ scale: 0.88 }] },
  label: {
    fontSize: 9,
    fontWeight: '700', // Stage 1.3 will switch this to the Inter font family
  },
});
