/*
Strict TypeScript PersistAdapter implementation using Prisma Client.
Requires: npm install @prisma/client zod
Run: npx prisma generate after installing prisma and generating client.
*/

import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  CharacterRecordSchema,
  LedgerEntrySchema,
  CharacterRecord,
  LedgerEntry,
  PersistAdapter as PersistAdapterInterface,
} from "../../types/character";

const prisma = new PrismaClient();

export class PrismaPersistAdapter implements PersistAdapterInterface {
  constructor(private client = prisma) {}

  public async upsertCharacter(char: CharacterRecord): Promise<void> {
    const validated = CharacterRecordSchema.parse(char);
    const now = new Date();
    await this.client.character.upsert({
      where: { id: validated.id },
      create: {
        id: validated.id,
        sessionId: validated.session_id ?? null,
        record: validated as any,
        state: "NORMALIZED",
        createdAt: validated.created_at ? new Date(validated.created_at) : now,
        updatedAt: now,
      },
      update: {
        sessionId: validated.session_id ?? null,
        record: validated as any,
        updatedAt: now,
      },
    });

    // ensure character_state
    await this.client.characterState.upsert({
      where: { charId: validated.id },
      create: { charId: validated.id, state: "NORMALIZED", updatedAt: now },
      update: { state: "NORMALIZED", updatedAt: now },
    });
  }

  public async getCharacter(id: string): Promise<CharacterRecord | null> {
    if (!id) throw new Error("id required");
    const rec = await this.client.character.findUnique({
      where: { id },
      select: { record: true },
    });
    if (!rec) return null;
    return CharacterRecordSchema.parse(rec.record as any);
  }

  public async updateState(id: string, state: string): Promise<void> {
    if (!id) throw new Error("id required");
    if (!state) throw new Error("state required");
    const now = new Date();
    await this.client.character.update({
      where: { id },
      data: { state, updatedAt: now },
    });
    await this.client.characterState.upsert({
      where: { charId: id },
      create: { charId: id, state, updatedAt: now },
      update: { state, updatedAt: now },
    });
  }

  public async insertLedger(entry: LedgerEntry): Promise<void> {
    const validated = LedgerEntrySchema.parse(entry);
    await this.client.ledger.create({
      data: {
        id: validated.id,
        charId: validated.char_id,
        state: validated.state,
        actor: validated.actor,
        message: validated.message,
        payload: validated.payload ?? null,
        timestamp: validated.timestamp ? new Date(validated.timestamp) : new Date(),
      },
    });
  }

  public async getState(id: string): Promise<string | null> {
    if (!id) throw new Error("id required");
    const s = await this.client.characterState.findUnique({
      where: { charId: id },
      select: { state: true },
    });
    if (s?.state) return s.state;
    const c = await this.client.character.findUnique({
      where: { id },
      select: { state: true },
    });
    return c?.state ?? null;
  }
}
