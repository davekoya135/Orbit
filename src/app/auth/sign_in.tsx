import { useAuth, useSignIn, useSSO } from "@clerk/expo";
import {
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    useFonts,
} from "@expo-google-fonts/space-grotesk";
import * as AuthSession from "expo-auth-session";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { AppleMark, DecoratedField, GoogleMark } from "./sign_up";

export default function SignIn() {
    const router = useRouter();
    const { signIn, fetchStatus } = useSignIn();
    const { startSSOFlow } = useSSO();
    const { isSignedIn } = useAuth();
    const { palette, paletteId, setPaletteId } = usePalette();
    const [fontsLoaded] = useFonts({
        SpaceGrotesk_400Regular,
        SpaceGrotesk_500Medium,
        SpaceGrotesk_700Bold,
    });
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
        null,
    );

    useEffect(() => {
        if (isSignedIn) router.replace("/(tabs)/home");
    }, [isSignedIn, router]);

    const handleSocialSignIn = async (
        strategy: "oauth_google" | "oauth_apple"
    ) => {
        try {
            const { createdSessionId, setActive, authSessionResult } =
                await startSSOFlow({
                    strategy,
                    redirectUrl: AuthSession.makeRedirectUri({
                        scheme: "orbit",
                        path: "sso-callback",
                    }),
                });

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                router.replace("/(tabs)/home");
            } else if (authSessionResult?.type === "cancel") {
                setMessage("Social sign-in was canceled.");
            } else {
                setMessage(
                    `Clerk returned from ${authSessionResult?.type ?? "the provider"
                    }, but no active session was created.`,
                );
            }
        } catch (err) {
            console.error(err);
            setMessage("Something went wrong while signing in with Google.");
        }
    };

    const handleSignIn = async () => {
        setMessage("");
        const { error } = await signIn.password({
            emailAddress: email.trim(),
            password,
        });
        if (error) {
            setMessage(error.message);
            return;
        }
        if (signIn.status === "complete") {
            await signIn.finalize();
            router.replace("/(tabs)/home");
            return;
        }
        setMessage("Your account needs one more verification step.");
    };

    if (!fontsLoaded) return null;

    return (
        <View style={[styles.screen, { backgroundColor: palette.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView edges={["top"]} style={styles.topBar}>
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
                    accessibilityRole="button"
                    onPress={() => router.push("/auth/sign_up")}
                    style={[styles.linkButton, { borderColor: palette.line }]}
                >
                    <Text style={[styles.linkText, { color: palette.ink }]}>SIGN UP</Text>
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
                            WELCOME BACK
                        </Text>
                    </View>
                    <Text style={[styles.heading, { color: palette.ink }]}>
                        Your campus,{"\n"}still in motion.
                    </Text>
                    <Text style={[styles.subheading, { color: palette.mutedInk }]}>
                        Sign in to pick up where you left off.
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
                            autoComplete="password"
                            label="PASSWORD"
                            onChangeText={setPassword}
                            palette={palette}
                            placeholder="Your password"
                            secureTextEntry
                            value={password}
                        />
                        <Pressable
                            onPress={() => router.push("/auth/forgot_password")}
                            style={styles.forgotButton}
                        >
                            <Text style={[styles.forgotText, { color: palette.accent }]}>
                                Forgot password?
                            </Text>
                        </Pressable>
                        {message ? (
                            <Text style={[styles.message, { color: palette.accent }]}>
                                {message}
                            </Text>
                        ) : null}
                        <Pressable
                            disabled={fetchStatus === "fetching"}
                            onPress={handleSignIn}
                            style={[
                                styles.primaryButton,
                                { backgroundColor: palette.ink },
                                fetchStatus === "fetching" && styles.disabled,
                            ]}
                        >
                            <Text style={styles.primaryText}>
                                {fetchStatus === "fetching"
                                    ? "Signing in..."
                                    : "Sign in to Orbit"}
                            </Text>
                            <Text style={[styles.arrow, { color: palette.accent }]}>↗</Text>
                        </Pressable>
                        <View style={styles.divider}>
                            <View
                                style={[styles.dividerLine, { backgroundColor: palette.line }]}
                            />
                            <Text style={[styles.dividerText, { color: palette.mutedInk }]}>
                                OR CONTINUE WITH
                            </Text>
                            <View
                                style={[styles.dividerLine, { backgroundColor: palette.line }]}
                            />
                        </View>
                        <View style={styles.socialStack}>
                            <Pressable
                                disabled={socialLoading !== null}
                                onPress={() => handleSocialSignIn("oauth_google")}
                                style={[
                                    styles.socialButton,
                                    { borderColor: palette.line },
                                    socialLoading !== null && styles.disabled,
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
                                disabled={socialLoading !== null}
                                onPress={() => handleSocialSignIn("oauth_apple")}
                                style={[
                                    styles.socialButton,
                                    { borderColor: palette.line },
                                    socialLoading !== null && styles.disabled,
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
                    <Pressable onPress={() => router.push("/auth/sign_up")}>
                        <Text style={[styles.footerLink, { color: palette.mutedInk }]}>
                            New to Orbit?{" "}
                            <Text style={{ color: palette.accent }}>Create an account</Text>
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
        marginTop: 8,
    },
    forgotButton: { alignSelf: "flex-end", marginBottom: 18 },
    forgotText: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 12 },
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
    socialStack: { gap: 10 },
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
    pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
