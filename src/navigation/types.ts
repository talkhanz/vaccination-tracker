import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Schedule: undefined;
  Timeline: undefined;
  History: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  VaccineDetail: { vaccineId: string };
  // recordId set = editing an existing record; otherwise a new one.
  RecordDose: { vaccineId?: string; doseNumber?: number; recordId?: string };
  // Book or edit a planned appointment date for a pending dose.
  PlanDose: { vaccineId: string; doseNumber: number };
  ManageVaccines: undefined;
  // add: true creates a new child; otherwise edits the selected child.
  EditChild: { add?: boolean } | undefined;
  Children: undefined;
};
