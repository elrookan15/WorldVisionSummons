import { getAccessToken } from "./workspaceAuth";

export async function exportCharacterToGoogleSheet(sheetData: any): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Authentication required. Please sign in with Google.");
  }

  // 1. Create a new spreadsheet
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: `WorldVision Summons - ${sheetData.name} (${sheetData.sheet_style || 'High Fantasy'})`
      }
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;

  // 2. Prepare data rows from the live dossier shape
  const statValue = (key: string, fallback: number) => {
    const match = sheetData.stats?.find((s: any) =>
      s?.key === key || String(s?.label || "").toUpperCase().includes(key)
    );
    return match?.value ?? fallback;
  };
  const inventoryItems = sheetData.equipment?.items
    ? String(sheetData.equipment.items).split(",").map((s: string) => s.trim()).filter(Boolean)
    : [
        sheetData.equipment?.primaryWeapon,
        sheetData.equipment?.secondaryFocus,
        sheetData.equipment?.armor,
        sheetData.equipment?.utilityTools,
        sheetData.equipment?.consumables,
        sheetData.equipment?.relics,
      ].filter(Boolean);

  const rows = [
    ["WORLDVISION SUMMONS - CHARACTER RECORD"],
    ["Name", sheetData.name],
    ["Title", sheetData.title],
    ["Class Role", sheetData.overview?.classRole],
    ["Style", sheetData.sheet_style],
    ["Alignment", sheetData.overview?.alignment],
    ["Level", sheetData.overview?.level || sheetData.derivedStats?.level],
    ["HP", sheetData.derivedStats?.hpCurrent ?? sheetData.derivedStats?.hpMax],
    ["AC", sheetData.derivedStats?.ac],
    ["Speed", sheetData.derivedStats?.speed],
    ["Initiative", sheetData.derivedStats?.initiative],
    ["Bio / Lore", sheetData.lore?.backstory || sheetData.overview?.bio],
    [],
    ["PHYSICAL ATTRIBUTES"],
    ["Height", sheetData.physical?.height],
    ["Weight", sheetData.physical?.weight],
    ["Build", sheetData.physical?.build],
    ["Distinguishing Feature", sheetData.physical?.marks || sheetData.physical?.distinguishing_feature],
    [],
    ["CORE ATTRIBUTES"],
    ["Strength", statValue("STR", 12)],
    ["Dexterity", statValue("DEX", 14)],
    ["Constitution", statValue("CON", 13)],
    ["Intelligence", statValue("INT", 10)],
    ["Wisdom", statValue("WIS", 11)],
    ["Charisma", statValue("CHA", 10)],
    [],
    ["INVENTORY ITEMS"],
    ...inventoryItems.map((item: string, idx: number) => [`Item ${idx + 1}`, item]),
    [],
    ["PSYCHOLOGICAL TRAITS (DNA)"],
    ["Reputation", sheetData.signatureAttributes?.reputation || sheetData.traits?.reputation],
    ["Vice", sheetData.signatureAttributes?.vice || sheetData.traits?.vice],
    ["Virtue", sheetData.signatureAttributes?.virtue || sheetData.traits?.virtue],
    ["Fear", sheetData.signatureAttributes?.fear || sheetData.traits?.fear],
    ["Obsession", sheetData.signatureAttributes?.obsession || sheetData.traits?.obsession],
    ["Tell", sheetData.signatureAttributes?.tell || sheetData.traits?.tell],
    ["Loyalty", sheetData.signatureAttributes?.loyalty || sheetData.traits?.loyalty],
    ["Blind Spot", sheetData.signatureAttributes?.blindSpot || sheetData.traits?.blind_spot],
    ["Survival Instinct", sheetData.signatureAttributes?.survivalInstinct || sheetData.traits?.survival_instinct],
    ["Legacy Fear", sheetData.signatureAttributes?.legacyFear || sheetData.traits?.legacy_fear]
  ];

  // 3. Write values to Sheet1!A1
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range: "Sheet1!A1",
      majorDimension: "ROWS",
      values: rows
    })
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to write data to Google Sheet: ${errText}`);
  }

  return { spreadsheetId, spreadsheetUrl };
}

export async function importCharacterFromGoogleSheet(spreadsheetId: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Authentication required. Please sign in with Google.");
  }

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B50`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read Google Sheet: ${errText}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  const findVal = (key: string) => {
    const row = rows.find(r => r[0]?.toLowerCase() === key.toLowerCase());
    return row ? row[1] || "" : "";
  };

  const name = findVal("Name") || "Imported Summon";
  const title = findVal("Title") || "Wanderer";
  const classRole = findVal("Class Role") || "Adventurer";
  const style = findVal("Style") || "High Fantasy";
  const alignment = findVal("Alignment") || "Neutral";
  const level = parseInt(findVal("Level")) || 1;
  const hp = parseInt(findVal("HP")) || 50;
  const ac = parseInt(findVal("AC")) || 15;
  const speed = findVal("Speed") || "30 ft";
  const initiative = findVal("Initiative") || "+2";
  const bio = findVal("Bio / Lore") || "An enigmatic summon stepped through the rift.";

  const height = findVal("Height") || "6'0\"";
  const weight = findVal("Weight") || "180 lbs";
  const build = findVal("Build") || "Athletic";
  const distinguishing_feature = findVal("Distinguishing Feature") || "Marked by arcane sigils";

  const str = parseInt(findVal("Strength")) || 12;
  const dex = parseInt(findVal("Dexterity")) || 14;
  const con = parseInt(findVal("Constitution")) || 13;
  const int = parseInt(findVal("Intelligence")) || 10;
  const wis = parseInt(findVal("Wisdom")) || 11;
  const cha = parseInt(findVal("Charisma")) || 10;

  // Extract inventory items
  const inventory: string[] = [];
  let collectingItems = false;
  for (const row of rows) {
    if (row[0] === "INVENTORY ITEMS") {
      collectingItems = true;
      continue;
    }
    if (row[0] === "PSYCHOLOGICAL TRAITS (DNA)") {
      collectingItems = false;
      break;
    }
    if (collectingItems && row[1]) {
      inventory.push(row[1]);
    }
  }

  if (inventory.length === 0) {
    inventory.push("Obsidian Blade", "Health Potion", "Traveler's Cloak");
  }

  const traits = {
    reputation: findVal("Reputation") || "Unknown Wanderer",
    vice: findVal("Vice") || "Hubris",
    virtue: findVal("Virtue") || "Resilience",
    fear: findVal("Fear") || "Oblivion",
    obsession: findVal("Obsession") || "Truth",
    tell: findVal("Tell") || "Quiet gaze",
    loyalty: findVal("Loyalty") || "Oathed",
    blind_spot: findVal("Blind Spot") || "Pride",
    survival_instinct: findVal("Survival Instinct") || "Vigilant",
    legacy_fear: findVal("Legacy Fear") || "Forgotten name"
  };

  return {
    name,
    title,
    sheet_style: style,
    overview: {
      classRole,
      bio,
      alignment,
      level,
      hp,
      ac,
      speed,
      initiative,
      classResource: "Mana (20/20)"
    },
    physical: {
      height,
      weight,
      build,
      distinguishing_feature
    },
    stats: [
      { label: "STR", value: str, desc: "Physical power & muscle mass" },
      { label: "DEX", value: dex, desc: "Agility, reflexes & poise" },
      { label: "CON", value: con, desc: "Endurance & vitality" },
      { label: "INT", value: int, desc: "Reason & arcana knowledge" },
      { label: "WIS", value: wis, desc: "Intuition & perception" },
      { label: "CHA", value: cha, desc: "Presence & command" }
    ],
    inventory,
    traits,
    passives: ["Arcane Attunement +3", "Vigilant Guard +2", "Shadow Step +4"]
  };
}
