import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/space-grotesk";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTES, usePalette } from "../theme/palette";

export default function Index() {
  const { height } = useWindowDimensions();
  const router = useRouter();
  const { palette, paletteId, setPaletteId } = usePalette();
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.12)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(28)).current;
  const orbitProgress = useRef(new Animated.Value(0)).current;
  const heroColorProgress = useRef(new Animated.Value(1)).current;
  const previousHeroColor = useRef(palette.hero);

  useEffect(() => {
    heroColorProgress.setValue(0);
    const transition = Animated.timing(heroColorProgress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    });
    transition.start(({ finished }) => {
      if (finished) {
        previousHeroColor.current = palette.hero;
      }
    });
    return () => transition.stop();
  }, [heroColorProgress, palette.hero]);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(360),
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 560,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 560,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    const orbit = Animated.loop(
      Animated.timing(orbitProgress, {
        toValue: 1,
        duration: 14000,
        useNativeDriver: true,
      }),
    );

    entrance.start();
    orbit.start();

    return () => {
      entrance.stop();
      orbit.stop();
    };
  }, [contentOpacity, contentTranslateY, imageOpacity, imageScale, orbitProgress]);

  if (!fontsLoaded) {
    return null;
  }

  const heroHeight = Math.min(Math.max(height * 0.59, 430), 560);
  const heroColor = heroColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [previousHeroColor.current, palette.hero],
  });
  const orbitRotation = orbitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.hero,
          {
            height: heroHeight,
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Animated.View pointerEvents="none" style={[styles.heroColorLayer, { backgroundColor: heroColor }]} />
        <View style={[styles.heroGlow, { backgroundColor: palette.glow }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orbit,
            { transform: [{ rotate: "-23deg" }, { rotate: orbitRotation }] },
          ]}
        >
          <View style={styles.orbitDot} />
        </Animated.View>
        <View style={[styles.heroFade, { borderBottomColor: palette.background }]} />
      </Animated.View>

      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Text style={styles.wordmark}>ORBIT</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>CAMPUS LIFE</Text>
        </View>
      </SafeAreaView>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowLine, { backgroundColor: palette.accent }]} />
          <Text style={[styles.eyebrow, { color: palette.accent }]}>YOUR DAY, CONNECTED</Text>
        </View>

        <Text style={[styles.headline, { color: palette.ink }]}>
          Your campus,{"\n"}in motion.
        </Text>
        <Text style={styles.description}>
          Classes, community, and every good thing happening around you—one orbit
          away.
        </Text>

        <Pressable
          accessibilityHint="Opens the Orbit sign-up screen"
          accessibilityRole="button"
          onPress={() => router.push(`/auth/sign_up?palette=${paletteId}`)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Enter Orbit</Text>
          <Text style={[styles.buttonArrow, { color: palette.accent }]}>↗</Text>
        </Pressable>

        <View style={styles.palettePicker}>
          <Text style={styles.paletteLabel}>SET THE TONE</Text>
          <View style={styles.swatches}>
            {PALETTES.map((option) => {
              const isSelected = option.id === paletteId;

              return (
                <Pressable
                  key={option.id}
                  accessibilityLabel={`${option.label} color scheme`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setPaletteId(option.id)}
                  style={[
                    styles.swatch,
                    { backgroundColor: option.accent },
                    isSelected && [styles.selectedSwatch, { borderColor: palette.ink }],
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MADE FOR CAMPUS</Text>
          <View style={styles.footerRule} />
          <Text style={styles.footerNumber}>01</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6eee5",
  },
  hero: {
    backgroundColor: "#0a0d1b",
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroColorLayer: {
    ...StyleSheet.absoluteFill,
  },
  heroGlow: {
    backgroundColor: "rgba(91, 118, 255, 0.2)",
    borderRadius: 999,
    height: 380,
    left: -180,
    position: "absolute",
    top: 20,
    width: 380,
  },
  heroFade: {
    backgroundColor: "transparent",
    borderBottomColor: "#f6eee5",
    borderBottomWidth: 116,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  orbit: {
    borderColor: "rgba(255, 239, 220, 0.76)",
    borderRadius: 999,
    borderWidth: 1,
    height: 390,
    position: "absolute",
    right: -112,
    top: 92,
    width: 390,
  },
  orbitDot: {
    backgroundColor: "#ffcf9f",
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    left: "48%",
    position: "absolute",
    top: -8,
    width: 16,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  wordmark: {
    color: "#fff8f0",
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 17,
    letterSpacing: 4.2,
  },
  statusPill: {
    alignItems: "center",
    backgroundColor: "rgba(255, 247, 238, 0.17)",
    borderColor: "rgba(255, 247, 238, 0.35)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusDot: {
    backgroundColor: "#ffd7a9",
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusText: {
    color: "#fff8f0",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 9,
    letterSpacing: 1.1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  eyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 13,
  },
  eyebrowLine: {
    backgroundColor: "#a25435",
    height: 1,
    width: 28,
  },
  eyebrow: {
    color: "#a25435",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 10,
    letterSpacing: 1.35,
  },
  headline: {
    color: "#211513",
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 45,
    letterSpacing: -2.25,
    lineHeight: 47,
  },
  description: {
    color: "#5d4d47",
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 310,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#211513",
    borderRadius: 999,
    flexDirection: "row",
    gap: 28,
    justifyContent: "space-between",
    marginTop: 27,
    minWidth: 187,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#fffaf5",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 15,
  },
  buttonArrow: {
    color: "#f0a574",
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 21,
    lineHeight: 21,
  },
  palettePicker: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  paletteLabel: {
    color: "#8c7a70",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 9,
    letterSpacing: 1.1,
  },
  swatches: {
    flexDirection: "row",
    gap: 8,
  },
  swatch: {
    borderColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  selectedSwatch: {
    borderWidth: 2,
    transform: [{ scale: 1.25 }],
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 23,
  },
  footerText: {
    color: "#8c7a70",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 9,
    letterSpacing: 1.15,
  },
  footerRule: {
    backgroundColor: "#d8c9bd",
    flex: 1,
    height: 1,
  },
  footerNumber: {
    color: "#8c7a70",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 10,
    letterSpacing: 1.2,
  },
});
