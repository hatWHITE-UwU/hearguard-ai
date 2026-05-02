export interface UserSettings {
  reminders: boolean;
  darkTheme: boolean;
  volumeUnit: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  occupation?: string;
  city?: string;
  settings?: UserSettings;
}
