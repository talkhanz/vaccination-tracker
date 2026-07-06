import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Schedule: undefined;
  History: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  VaccineDetail: { vaccineId: string };
  // recordId set = editing an existing record; otherwise a new one.
  RecordDose: { vaccineId?: string; doseNumber?: number; recordId?: string };
  ManageVaccines: undefined;
  EditChild: undefined;
};
