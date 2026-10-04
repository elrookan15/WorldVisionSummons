export interface CharacterProposal {
  name: string;
  classRole: string;
  style: string;
  lore: string;
  inventory: string;
}

const PROPOSAL_BLOCK = /\[CHARACTER_PROPOSAL\]([\s\S]*?)\[\/CHARACTER_PROPOSAL\]/i;

function field(block: string, label: string): string {
  const match = block.match(new RegExp(`${label}:\\s*([^\\n\\r]+)`, "i"));
  return match ? match[1].trim() : "";
}

export function parseCharacterProposal(text: string): CharacterProposal | null {
  const match = text.match(PROPOSAL_BLOCK);
  if (!match) return null;
  const block = match[1];
  const name = field(block, "Name");
  const classRole = field(block, "Class");
  if (!name || !classRole) return null;
  return {
    name: name.slice(0, 80),
    classRole: classRole.slice(0, 80),
    style: field(block, "Style").slice(0, 80) || "High Fantasy",
    lore: field(block, "Lore").slice(0, 800),
    inventory: field(block, "Inventory").slice(0, 400),
  };
}

export function stripProposalBlock(text: string): string {
  return text.replace(/\[CHARACTER_PROPOSAL\][\s\S]*?\[\/CHARACTER_PROPOSAL\]/gi, "").trim();
}
