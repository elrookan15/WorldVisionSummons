import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Sword, Sparkles, Compass, Scroll, User, Skull, BookOpen, 
  Download, RefreshCw, Sliders, Zap, Copy, Check, 
  Bookmark, Eye, Terminal, Flame, Award, Heart, ShieldAlert,
  BookMarked, Beaker, ChartColumn, Cog, Crown, EyeOff, Feather,
  Moon, Truck, Users, FileSpreadsheet, LogIn, LogOut,
  Star, Dices
} from "lucide-react";
import { CharacterSheetData, SheetPreset } from "./types";
import StatsRadarComparison from "./components/StatsRadarComparison";
import CharacterCodex from "./components/CharacterCodex";
import { CodexFinalizer } from "./features/codex";
import DiceTray from "./components/DiceTray";
import { StatBaseline } from "./lib/statBaselines";
import ImageEditorModal from "./components/ImageEditorModal";
import GeminiChatModal from "./components/GeminiChatModal";
import { nanoBananaProvider } from "./lib/providers/NanoBananaProvider";
import { googleSignIn, initAuth, logout } from "./lib/workspaceAuth";
import { exportCharacterToGoogleSheet, importCharacterFromGoogleSheet } from "./lib/sheetsService";
import { compilePortraitPrompt } from "./lib/prompts/generators";
import { CANONICAL_SHEET_STYLES, canonicalizeSheetStyle, themeIdForStyle } from "./lib/themeMap";
import { sheetPageBackgroundCssVars } from "./lib/sheetPageBackgrounds";
import { clampResource, mapGeneratedSheetToUi, mergeImportedSheet, portraitPromptContext, UiSheetData } from "./lib/sheetMapper";
import { buildProceduralPortrait } from "./lib/portraitFallback";
import {
  CodexEntry,
  deleteCodexEntry,
  duplicateCodexEntry,
  loadCodex,
  upsertCodexEntry
} from "./lib/characterCodex";
