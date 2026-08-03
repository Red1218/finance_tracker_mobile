export interface UpdateThemeCommand {
  theme: 'SYSTEM' | 'LIGHT' | 'DARK';
  userId?: string;
}
