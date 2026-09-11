import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

export const PALETTES = [
    {
        id: "clay",
        label: "Clay",
        background: "#f6eee5",
        hero: "#895943",
        accent: "#a25435",
        glow: "rgba(255, 206, 163, 0.18)",
        ink: "#211513",
        mutedInk: "#765f56",
        input: "rgba(255, 250, 245, 0.72)",
        line: "#dbc9bd",
    },
    {
        id: "forest",
        label: "Forest",
        background: "#edf1e8",
        hero: "#294637",
        accent: "#527455",
        glow: "rgba(147, 211, 163, 0.17)",
        ink: "#183024",
        mutedInk: "#5d7062",
        input: "rgba(250, 253, 247, 0.76)",
        line: "#cad8c9",
    },
    {
        id: "midnight",
        label: "Midnight",
        background: "#e9edf6",
        hero: "#263a68",
        accent: "#526d9d",
        glow: "rgba(134, 165, 255, 0.22)",
        ink: "#18233b",
        mutedInk: "#5d6b88",
        input: "rgba(250, 252, 255, 0.76)",
        line: "#cad2e1",
    },
    {
        id: "coral",
        label: "Coral",
        background: "#fff0eb",
        hero: "#8f4f45",
        accent: "#d96b5f",
        glow: "rgba(255, 165, 151, 0.2)",
        ink: "#2d1715",
        mutedInk: "#80605b",
        input: "rgba(255, 251, 248, 0.8)",
        line: "#e4c8c0",
    },
    {
        id: "saffron",
        label: "Saffron",
        background: "#fff6df",
        hero: "#8a621f",
        accent: "#d59a26",
        glow: "rgba(255, 213, 105, 0.22)",
        ink: "#2b2112",
        mutedInk: "#796943",
        input: "rgba(255, 253, 244, 0.82)",
        line: "#e5d4a7",
    },
    {
        id: "lavender",
        label: "Lavender",
        background: "#f1eefb",
        hero: "#5c527f",
        accent: "#8a78c7",
        glow: "rgba(183, 164, 255, 0.2)",
        ink: "#242036",
        mutedInk: "#6f6887",
        input: "rgba(252, 250, 255, 0.82)",
        line: "#d5cdec",
    },
] as const;

export type Palette = (typeof PALETTES)[number];
export type PaletteId = Palette["id"];

export function isPaletteId(value: unknown): value is PaletteId {
    return typeof value === "string" && PALETTES.some(({ id }) => id === value);
}

type PaletteContextValue = {
    palette: Palette;
    paletteId: PaletteId;
    setPaletteId: (id: PaletteId) => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function PaletteProvider({ children }: PropsWithChildren) {
    const [paletteId, setPaletteId] = useState<PaletteId>("clay");
    const palette = PALETTES.find(({ id }) => id === paletteId) ?? PALETTES[0];
    const value = useMemo(() => ({ palette, paletteId, setPaletteId }), [palette, paletteId]);

    return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette() {
    const context = useContext(PaletteContext);
    if (!context) {
        throw new Error("usePalette must be used within PaletteProvider");
    }
    return context;
}
