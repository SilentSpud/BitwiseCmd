import AppState, { APP_VERSION, type PersistedAppData } from "./AppState";

const storeKey = "AppState";

const DEFAULT_DATA: PersistedAppData = {
  uiTheme: "dark",
  emphasizeBytes: false,
  version: APP_VERSION,
  debugMode: false,
  pageVisistsCount: 0,
  donationClicked: false,
  annotateTypes: false,
  dimExtrBits: false,
  cookieDisclaimerHidden: false,
};

export default {
  getPersistedData(): PersistedAppData {
    var json = window.localStorage.getItem(storeKey);
    if (!json) {
      return DEFAULT_DATA;
    }

    try {
      return JSON.parse(json) as PersistedAppData;
    } catch (ex) {
      console.error("Failed to parse AppState json. Json Value: \n" + json, ex);
      return DEFAULT_DATA;
    }
  },

  watch(appState: AppState) {
    appState.onChange(() => this.persistData(appState));
  },

  persistData(appState: AppState) {
    localStorage.setItem(storeKey, JSON.stringify(appState.getPersistData()));
  },
};
