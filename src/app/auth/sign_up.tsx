import { useAuth, useSignUp, useSSO } from "@clerk/expo";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/space-grotesk";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  isPaletteId,
  PALETTES,
  usePalette,
  type Palette,
} from "../../theme/palette";

import * as AuthSession from "expo-auth-session";

type Gender = "Female" | "Male";

type DecoratedFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  palette: Palette;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "words";
  autoComplete?: "name" | "email" | "password" | "new-password" | "off";
  containerStyle?: StyleProp<ViewStyle>;
};

export function EyeIcon({
  color,
  visible,
}: {
  color: string;
  visible: boolean;
}) {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M2.1 12s3.2-5.2 9.9-5.2S21.9 12 21.9 12 18.7 17.2 12 17.2 2.1 12 2.1 12Z"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
      />
      <Path
        d={
          visible
            ? "M12 9.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Z"
            : "m4 4 16 16"
        }
        fill={visible ? color : "none"}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.7}
      />
    </Svg>
  );
}

export function DecoratedField({
  label,
  value,
  onChangeText,
  palette,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "words",
  autoComplete = "off",
  containerStyle,
}: DecoratedFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const focus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focus, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [focus, isFocused]);

  return (
    <View style={[styles.field, containerStyle]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fieldAccent,
          {
            backgroundColor: palette.accent,
            opacity: focus,
            transform: [
              {
                scaleX: focus.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 1],
                }),
              },
            ],
          },
        ]}
      />
      <Text
        style={[
          styles.fieldLabel,
          { color: isFocused ? palette.accent : palette.mutedInk },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: palette.input,
            borderColor: isFocused ? palette.accent : palette.line,
            borderWidth: 0,
          },
        ]}
      >
        <TextInput
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={`${palette.mutedInk}99`}
          secureTextEntry={secureTextEntry && !isVisible}
          selectionColor={palette.accent}
          style={[styles.input, { color: palette.ink }]}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsVisible((current) => !current)}
            style={styles.eyeButton}
          >
            <EyeIcon color={palette.mutedInk} visible={isVisible} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function formatDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length < 3) return digits;
  if (digits.length < 5) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getAge(dateOfBirth: string) {
  const match = dateOfBirth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const birthday = new Date(year, month - 1, day);

  if (
    birthday.getFullYear() !== year ||
    birthday.getMonth() !== month - 1 ||
    birthday.getDate() !== day ||
    birthday > new Date()
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const hasHadBirthday =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);

  if (!hasHadBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function GoogleMark() {
  return (
    <Svg height={19} viewBox="0 0 24 24" width={19}>
      <Path
        d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
        fill="#4285F4"
      />
      <Path
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <Path
        d="M6.54 13.83a5.86 5.86 0 0 1 0-3.66V7.64H3.3a9.75 9.75 0 0 0 0 8.72l3.24-2.53Z"
        fill="#FBBC05"
      />
      <Path
        d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function AppleMark({ color }: { color: string }) {
  return (
    <Svg height={19} viewBox="0 0 24 24" width={19}>
      <Path
        d="M17.05 12.54c-.02-2.2 1.8-3.26 1.88-3.31a4.03 4.03 0 0 0-3.18-1.72c-1.34-.14-2.63.8-3.31.8-.69 0-1.75-.78-2.88-.76a4.25 4.25 0 0 0-3.57 2.18c-1.54 2.67-.39 6.6 1.08 8.76.73 1.05 1.57 2.21 2.69 2.17 1.08-.05 1.49-.7 2.8-.7 1.3 0 1.67.7 2.81.67 1.17-.02 1.9-1.06 2.61-2.12a8.68 8.68 0 0 0 1.19-2.45 3.8 3.8 0 0 1-2.12-3.52ZM14.88 6.09a3.87 3.87 0 0 0 .88-2.78 3.94 3.94 0 0 0-2.54 1.31 3.67 3.67 0 0 0-.9 2.67 3.26 3.26 0 0 0 2.56-1.2Z"
        fill={color}
      />
    </Svg>
  );
}

export default function SignUp() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const { palette: paletteParam } = useLocalSearchParams<{
    palette?: string;
  }>();
  const { palette, paletteId, setPaletteId } = usePalette();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
    null,
  );

  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)/home");
  }, [isSignedIn, router]);

  const handleSocialSignUp = async (
    strategy: "oauth_google" | "oauth_apple"
  ) => {
    try {
      const {
        createdSessionId,
        setActive,
        authSessionResult,
        signIn: completedSignIn,
        signUp: completedSignUp,
      } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "orbit",
          path: "sso-callback",
        }),
      });

      const sessionId =
        createdSessionId ??
        completedSignUp?.createdSessionId ??
        completedSignIn?.createdSessionId;

      if (sessionId && setActive) {
        await setActive({ session: sessionId });
        router.replace("/(tabs)/home");
      } else if (authSessionResult?.type === "cancel") {
        setMessage("Social sign-up was canceled.");
      } else {
        setMessage(
          `Clerk returned from ${authSessionResult?.type ?? "the provider"
          }, but no active session was created.`,
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while signing up with Google.");
    }
  };
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentOffset = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    if (isPaletteId(paletteParam)) {
      setPaletteId(paletteParam);
    }
  }, [paletteParam, setPaletteId]);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(contentOffset, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();
    return () => {
      entrance.stop();
    };
  }, [contentOffset, contentOpacity]);

  if (!fontsLoaded) return null;

  const age = getAge(dateOfBirth);
  async function handleSignUp() {
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setMessage("A few details are still waiting for you.");
      return;
    }
    if (age === null) {
      setMessage("Please enter a valid date of birth.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Your passwords need to match.");
      return;
    }
    if (password.length < 15) {
      setMessage("Your password must be at least 15 characters.");
      return;
    }
    setMessage("");
    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    const { error: verificationError } =
      await signUp.verifications.sendEmailCode();
    if (verificationError) {
      setMessage(verificationError.message);
      return;
    }
    setIsVerifying(true);
    setMessage("We sent a verification code to your email.");
  }

  async function handleVerify() {
    const { error } = await signUp.verifications.verifyEmailCode({
      code: verificationCode.trim(),
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize();
      router.replace("/(tabs)/home");
      return;
    }
    setMessage(
      "Your verification is complete, but the account still needs attention.",
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <SafeAreaView
        edges={["top"]}
        style={[styles.topBar, { backgroundColor: palette.background }]}
      >
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { borderColor: palette.line },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.backArrow, { color: palette.ink }]}>←</Text>
        </Pressable>
        <Text style={[styles.wordmark, { color: palette.ink }]}>ORBIT</Text>
        <Pressable
          accessibilityLabel="Go to sign in"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/auth/sign_in")}
          style={({ pressed }) => [
            styles.signInButton,
            { borderColor: palette.line },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.signInLink, { color: palette.ink }]}>
            SIGN IN
          </Text>
        </Pressable>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.sheet, { backgroundColor: palette.background }]}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentOffset }],
                },
              ]}
            >
              <View style={styles.eyebrowRow}>
                <View
                  style={[
                    styles.eyebrowLine,
                    { backgroundColor: palette.accent },
                  ]}
                />
                <Text style={[styles.eyebrow, { color: palette.accent }]}>
                  JOIN THE CIRCLE
                </Text>
              </View>
              <Text style={[styles.heading, { color: palette.ink }]}>
                Build your{"\n"}campus circle.
              </Text>
              <Text style={[styles.subheading, { color: palette.mutedInk }]}>
                Create your student profile and find your people.
              </Text>

              <View style={styles.palettePicker}>
                <Text
                  style={[styles.paletteLabel, { color: palette.mutedInk }]}
                >
                  SET THE TONE
                </Text>
                <View style={styles.swatches}>
                  {PALETTES.map((option) => {
                    const isSelected = option.id === paletteId;
                    return (
                      <Pressable
                        accessibilityLabel={`${option.label} color scheme`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        key={option.id}
                        onPress={() => setPaletteId(option.id)}
                        style={[
                          styles.swatch,
                          { backgroundColor: option.accent },
                          isSelected && {
                            borderColor: palette.ink,
                            transform: [{ scale: 1.22 }],
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              <View style={[styles.formCard, { borderColor: palette.line }]}>
                <View style={styles.nameRow}>
                  <DecoratedField
                    containerStyle={styles.halfField}
                    label="FIRST NAME"
                    onChangeText={setFirstName}
                    palette={palette}
                    placeholder="Ava"
                    value={firstName}
                  />
                  <DecoratedField
                    containerStyle={styles.halfField}
                    label="LAST NAME"
                    onChangeText={setLastName}
                    palette={palette}
                    placeholder="James"
                    value={lastName}
                  />
                </View>

                <View style={styles.birthRow}>
                  <DecoratedField
                    containerStyle={styles.birthField}
                    keyboardType="numeric"
                    label="DATE OF BIRTH"
                    onChangeText={(value) => setDateOfBirth(formatDate(value))}
                    palette={palette}
                    placeholder="DD/MM/YYYY"
                    value={dateOfBirth}
                  />
                  <View
                    style={[styles.ageBadge, { backgroundColor: palette.hero }]}
                  >
                    <Text style={styles.ageLabel}>YOUR AGE</Text>
                    <Text style={styles.ageValue}>
                      {age === null ? "—" : age}
                    </Text>
                  </View>
                </View>

                <View style={styles.genderField}>
                  <Text
                    style={[styles.fieldLabel, { color: palette.mutedInk }]}
                  >
                    GENDER
                  </Text>
                  <View style={styles.genderOptions}>
                    {(["Female", "Male"] as const).map((option) => {
                      const selected = gender === option;
                      return (
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          key={option}
                          onPress={() => setGender(option)}
                          style={[
                            styles.genderOption,
                            {
                              backgroundColor: selected
                                ? palette.hero
                                : palette.input,
                              borderColor: selected
                                ? palette.hero
                                : palette.line,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.genderText,
                              { color: selected ? "#fffaf5" : palette.ink },
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <DecoratedField
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  label="EMAIL ADDRESS"
                  onChangeText={setEmail}
                  palette={palette}
                  placeholder="you@campus.edu"
                  value={email}
                />
                <DecoratedField
                  autoCapitalize="none"
                  autoComplete="new-password"
                  label="PASSWORD"
                  onChangeText={setPassword}
                  palette={palette}
                  placeholder="Create a password"
                  secureTextEntry
                  value={password}
                />
                <DecoratedField
                  autoCapitalize="none"
                  autoComplete="new-password"
                  label="CONFIRM PASSWORD"
                  onChangeText={setConfirmPassword}
                  palette={palette}
                  placeholder="One more time"
                  secureTextEntry
                  value={confirmPassword}
                />

                {message ? (
                  <Text style={[styles.message, { color: palette.accent }]}>
                    {message}
                  </Text>
                ) : null}
                {isVerifying ? (
                  <>
                    <Text
                      style={[styles.fieldLabel, { color: palette.mutedInk }]}
                    >
                      VERIFICATION CODE
                    </Text>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="numeric"
                      onChangeText={setVerificationCode}
                      placeholder="Enter the code from your email"
                      placeholderTextColor={`${palette.mutedInk}99`}
                      style={[
                        styles.input,
                        {
                          backgroundColor: palette.input,
                          borderColor: palette.line,
                          color: palette.ink,
                        },
                      ]}
                      value={verificationCode}
                    />
                  </>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  disabled={fetchStatus === "fetching"}
                  onPress={isVerifying ? handleVerify : handleSignUp}
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: palette.ink },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.createButtonText}>
                    {fetchStatus === "fetching"
                      ? "Working..."
                      : isVerifying
                        ? "Verify email"
                        : "Create my Orbit"}
                  </Text>
                  <Text
                    style={[
                      styles.createButtonArrow,
                      { color: palette.accent },
                    ]}
                  >
                    ↗
                  </Text>
                </Pressable>

                <View style={styles.divider}>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: palette.line },
                    ]}
                  />
                  <Text
                    style={[styles.dividerText, { color: palette.mutedInk }]}
                  >
                    OR CONTINUE WITH
                  </Text>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: palette.line },
                    ]}
                  />
                </View>

                <View style={styles.socialRow}>
                  <Pressable
                    accessibilityLabel="Continue with Google"
                    accessibilityRole="button"
                    disabled={socialLoading !== null}
                    onPress={() => handleSocialSignUp("oauth_google")}
                    style={({ pressed }) => [
                      styles.socialButton,
                      { borderColor: palette.line },
                      pressed && styles.pressed,
                    ]}
                  >
                    <GoogleMark />
                    <Text style={[styles.socialText, { color: palette.ink }]}>
                      {socialLoading === "google"
                        ? "Connecting..."
                        : "Continue with Google"}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Continue with Apple"
                    accessibilityRole="button"
                    disabled={socialLoading !== null}
                    onPress={() => handleSocialSignUp("oauth_apple")}
                    style={({ pressed }) => [
                      styles.socialButton,
                      { borderColor: palette.line },
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppleMark color={palette.ink} />
                    <Text style={[styles.socialText, { color: palette.ink }]}>
                      {socialLoading === "apple"
                        ? "Connecting..."
                        : "Continue with Apple"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.terms, { color: palette.mutedInk }]}>
                By joining, you agree to keep the Orbit kind.
              </Text>
            </Animated.View>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { paddingBottom: 34 },
  sheet: { minHeight: "100%", overflow: "hidden" },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  backArrow: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 20,
    lineHeight: 22,
  },
  wordmark: {
    flex: 1,
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 17,
    letterSpacing: 4.2,
    textAlign: "center",
  },
  signInButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  signInLink: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  eyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 11,
  },
  eyebrowLine: { height: 1, width: 28 },
  eyebrow: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 10,
    letterSpacing: 1.35,
  },
  heading: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 35,
    letterSpacing: -1.7,
    lineHeight: 38,
  },
  subheading: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  palettePicker: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  paletteLabel: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 9,
    letterSpacing: 1.1,
  },
  swatches: { flexDirection: "row", gap: 9 },
  swatch: {
    borderColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  formCard: { borderTopWidth: 1, marginTop: 25, paddingTop: 23 },
  nameRow: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  field: { marginBottom: 18, position: "relative" },
  fieldAccent: {
    bottom: 0,
    height: 2,
    left: 15,
    position: "absolute",
    right: 15,
    zIndex: 2,
  },
  fieldLabel: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 9,
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  input: {
    borderRadius: 15,
    flex: 1,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    height: 54,
    paddingHorizontal: 15,
    paddingRight: 4,
  },
  inputShell: { alignItems: "center", borderRadius: 15, flexDirection: "row" },
  eyeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: 10,
    width: 30,
  },
  birthRow: { alignItems: "flex-end", flexDirection: "row", gap: 12 },
  birthField: { flex: 1 },
  ageBadge: {
    alignItems: "center",
    borderRadius: 15,
    height: 68,
    justifyContent: "center",
    marginBottom: 18,
    width: 76,
  },
  ageLabel: {
    color: "rgba(255, 248, 240, 0.74)",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 7,
    letterSpacing: 0.8,
  },
  ageValue: {
    color: "#fffaf5",
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 23,
    letterSpacing: -0.8,
    marginTop: 1,
  },
  genderField: { marginBottom: 18 },
  genderOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genderOption: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  genderText: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 11 },
  message: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    marginTop: -2,
  },
  createButton: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 21,
    paddingVertical: 16,
  },
  createButtonText: {
    color: "#fffaf5",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 15,
  },
  createButtonArrow: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 21,
    lineHeight: 21,
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginVertical: 22,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 8,
    letterSpacing: 0.75,
  },
  socialRow: { gap: 10 },
  socialButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    paddingVertical: 14,
  },
  socialText: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 12 },
  terms: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 18,
    textAlign: "center",
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
