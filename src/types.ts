export interface CharacterSheetData {
  character_data: {
    character_name: string;
    character_class: string;
    character_lore: string;
    inventory_items: string;
    sheet_style: string;
    physical_attributes: {
      height: string;
      weight: string;
      build: string;
      distinguishing_feature: string;
    };
  };
  signature_attributes: {
    reputation: string;
    vice: string;
    virtue: string;
    fear: string;
    obsession: string;
    tell: string;
    loyalty: string;
    blind_spot: string;
    survival_instinct: string;
    legacy_fear: string;
  };
  rpg_stats: {
    core_attributes: {
      str: number;
      dex: number;
      con: number;
      int: number;
      wis: number;
      cha: number;
    };
    derived_stats: {
      hp: number;
      ac: number;
      initiative: string;
      speed: string;
      level: number;
    };
    class_resource: {
      resource_type: string;
      current_max: string;
    };
    alignment_or_faction: string;
    passive_skills: string[];
  };
  personal_quote: {
    text: string;
    attribution: string;
    tone_selected: string;
  };
  visual_prompts: {
    step_2_hero_portrait: string;
    step_5_inventory_grid: string;
    step_6_map_thumbnail: string;
    step_8_composition_blueprint: {
      left_panel: string;
      right_detail_panels: string[];
      lower_middle_grid: string;
      footer_thumbnails: string[];
      border_and_ui_style: string;
    };
  };
  _warning?: string;
}

export interface SheetPreset {
  name: string;
  style: string;
  category: string;
  charName: string;
  charClass: string;
  lore: string;
  items: string;
}
