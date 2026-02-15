export type GlobalState = {
  language: string;
};

export type GlobalActions = {
  setLanguage: (lang: string) => void;
};

export type GlobalSlice = GlobalState & GlobalActions;
