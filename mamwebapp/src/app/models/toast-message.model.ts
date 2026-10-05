export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  icon: string;
  role: 'status' | 'alert';
  leaving?: boolean;
}
