import { useSignIn } from "@clerk/expo";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/space-grotesk";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTES, usePalette } from "../../theme/palette";
import { DecoratedField } from "./sign_up";

export default function ForgotPassword() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const { palette, paletteId, setPaletteId } = usePalette();
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState("");

  async function sendCode() {
    const { error: createError } = await signIn.create({
      identifier: email.trim(),
    });
    if (createError) {
      setMessage(createError.message);
      return;
    }
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setMessage(error.message);
      return;
    }
    setCodeSent(true);
    setMessage("We sent a reset code to your email.");
  }

  async function verifyCode() {
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: code.trim(),
    });
    if (error) setMessage(error.message);
    else setMessage("Code verified. Choose a new password.");
  }

  async function submitNewPassword() {
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize();
      router.replace("/(tabs)/home");
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: palette.line }]}
        >
          <Text style={[styles.backArrow, { color: palette.ink }]}>←</Text>
        </Pressable>
        <Text style={[styles.wordmark, { color: palette.ink }]}>ORBIT</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/auth/sign_in")}
          style={[styles.linkButton, { borderColor: palette.line }]}
        >
          <Text style={[styles.linkText, { color: palette.ink }]}>SIGN IN</Text>
        </Pressable>
      </SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.eyebrowRow}>
            <View
              style={[styles.eyebrowLine, { backgroundColor: palette.accent }]}
            />
            <Text style={[styles.eyebrow, { color: palette.accent }]}>
              ACCOUNT ACCESS
            </Text>
          </View>
          <Text style={[styles.heading, { color: palette.ink }]}>
            Reset your{"\n"}Orbit password.
          </Text>
          <Text style={[styles.subheading, { color: palette.mutedInk }]}>
            Enter your student email and we’ll send a reset link.
          </Text>
          <View style={styles.palettePicker}>
            <Text style={[styles.paletteLabel, { color: palette.mutedInk }]}>
              SET THE TONE
            </Text>
            <View style={styles.swatches}>
              {PALETTES.map((option) => (
                <Pressable
                  key={option.id}
                  accessibilityLabel={`${option.label} color scheme`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: option.id === paletteId }}
                  onPress={() => setPaletteId(option.id)}
                  style={[
                    styles.swatch,
                    { backgroundColor: option.accent },
                    option.id === paletteId && {
                      borderColor: palette.ink,
                      transform: [{ scale: 1.2 }],
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={[styles.form, { borderColor: palette.line }]}>
            {!codeSent ? (
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
            ) : null}
            {codeSent ? (
              <>
                <DecoratedField
                  autoCapitalize="none"
                  keyboardType="numeric"
                  label="RESET CODE"
                  onChangeText={setCode}
                  palette={palette}
                  placeholder="Enter your email code"
                  value={code}
                />
                {signIn.status === "needs_new_password" ? (
                  <>
                    <DecoratedField
                      autoCapitalize="none"
                      autoComplete="new-password"
                      label="NEW PASSWORD"
                      onChangeText={setNewPassword}
                      palette={palette}
                      placeholder="Create a new password"
                      secureTextEntry
                      value={newPassword}
                    />
                  </>
                ) : null}
              </>
            ) : null}
            {message ? (
              <Text style={[styles.message, { color: palette.accent }]}>
                {message}
              </Text>
            ) : null}
            <Pressable
              disabled={fetchStatus === "fetching"}
              onPress={
                codeSent
                  ? signIn.status === "needs_new_password"
                    ? submitNewPassword
                    : verifyCode
                  : sendCode
              }
              style={[
                styles.primaryButton,
                { backgroundColor: palette.ink },
                fetchStatus === "fetching" && styles.disabled,
              ]}
            >
              <Text style={styles.primaryText}>
                {fetchStatus === "fetching"
                  ? "Working..."
                  : !codeSent
                    ? "Send reset code"
                    : signIn.status === "needs_new_password"
                      ? "Set new password"
                      : "Verify code"}
              </Text>
              <Text style={[styles.arrow, { color: palette.accent }]}>↗</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push("/auth/sign_up")}>
            <Text style={[styles.footerLink, { color: palette.mutedInk }]}>
              Need an account?{" "}
              <Text style={{ color: palette.accent }}>Create one</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardView: { flex: 1 },
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
  backArrow: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 20 },
  wordmark: {
    flex: 1,
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 17,
    letterSpacing: 4.2,
    textAlign: "center",
  },
  linkButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  linkText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  content: { paddingBottom: 36, paddingHorizontal: 24, paddingTop: 24 },
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
  heading: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 35, lineHeight: 38 },
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
  form: { borderTopWidth: 1, marginTop: 25, paddingTop: 23 },
  label: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 9,
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 21,
    paddingVertical: 16,
  },
  primaryText: {
    color: "#fffaf5",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 15,
  },
  arrow: { fontSize: 21 },
  footerLink: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
  inputShell: {
    alignItems: "center",
    borderRadius: 15,
    flexDirection: "row",
  },
  input: {
    flex: 1,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    height: 54,
    paddingHorizontal: 15,
    paddingRight: 4,
  },
  eyeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: 10,
    width: 30,
  },
  message: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  disabled: { opacity: 0.6 },
});
