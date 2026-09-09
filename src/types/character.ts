import { z } from "zod";

export const OrchestratorStateEnum = z.enum([
  "INITIAL",
  "NORMALIZED",
  "VALIDATED",
  "COMPLETED",
  "FAILED"
]);
export type OrchestratorState = z.infer<typeof OrchestratorStateEnum>;

export const InputPayloadSchema = z.object({
  character_name: z.string().optional(),
  character_class: z.string().optional(),
  character_lore: z.string().optional(),
  inventory_items: z.string().optional(),
  sheet_style: z.string(),
  session_id: z.string().optional(),
});
export type InputPayload = z.infer<typeof InputPayloadSchema>;

export const PhysicalAttributesSchema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  build: z.string().optional(),
  distinguishing_feature: z.string().optional(),
});

export const SignatureAttributesSchema = z.object({
  reputation: z.string().optional(),
  vice: z.string().optional(),
  virtue: z.string().optional(),
  fear: z.string().optional(),
  obsession: z.string().optional(),
  tell: z.string().optional(),
  loyalty: z.string().optional(),
  blind_spot: z.string().optional(),
  survival_instinct: z.string().optional(),
  legacy_fear: z.string().optional(),
});
export type SignatureAttributes = z.infer<typeof SignatureAttributesSchema>;

export const CoreStatsSchema = z.object({
  str: z.number(),
  dex: z.number(),
  con: z.number(),
  int: z.number(),
  wis: z.number(),
  cha: z.number(),
});
export type CoreStats = z.infer<typeof CoreStatsSchema>;

export const ImagePromptSchema = z.object({
  prompt: z.string(),
  style: z.string().optional(),
});
export type ImagePrompt = z.infer<typeof ImagePromptSchema>;

export const CharacterRecordSchema = z.object({
  id: z.string(),
  session_id: z.string().optional(),
  created_at: z.string().optional(),
  character_data: z.any(),
  signature_attributes: z.any(),
  rpg_stats: z.any(),
  personal_quote: z.any(),
  visual_prompts: z.any(),
});
export type CharacterRecord = z.infer<typeof CharacterRecordSchema>;

export const LedgerEntrySchema = z.object({
  id: z.string(),
  char_id: z.string(),
  state: z.string(),
  actor: z.string(),
  message: z.string(),
  payload: z.any().optional(),
  timestamp: z.string().optional(),
});
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

export interface PersistAdapter {
  upsertCharacter(char: CharacterRecord): Promise<void>;
  getCharacter(id: string): Promise<CharacterRecord | null>;
  updateState(id: string, state: string): Promise<void>;
  insertLedger(entry: LedgerEntry): Promise<void>;
  getState(id: string): Promise<string | null>;
}

export type Inventory = string;
export type SheetStyle = string;
