import { getAccessToken } from "./workspaceAuth";
import { DossierSheet } from "../types/dossier";
import { buildSheetRows, parseSheetRows } from "./sheetsMapper";

export { parseSheetRows, buildSheetRows };

export async function exportCharacterToGoogleSheet(sheetData: DossierSheet): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Authentication required. Please sign in with Google.");
  }

  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: `WorldVision Summons - ${sheetData.name} (${sheetData.sheet_style || "High Fantasy"})`
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
  const rows = buildSheetRows(sheetData);

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

export async function importCharacterFromGoogleSheet(spreadsheetId: string): Promise<Record<string, any>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Authentication required. Please sign in with Google.");
  }

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B80`, {
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
  return parseSheetRows(rows);
}
