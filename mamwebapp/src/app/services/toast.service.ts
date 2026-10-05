import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage, ToastType } from '../models/toast-message.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  showSuccess(message: string): void {
    this.show('success', message);
  }

  showError(message: string): void {
    this.show('error', message);
  }

  showWarning(message: string): void {
    this.show('warning', message);
  }

  showInfo(message: string): void {
    this.show('info', message);
  }

  getApiErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Unable to connect to the server. Please check your connection and try again.';
      case 400:
        return 'The request contains invalid information. Please review it and try again.';
      case 401:
        return 'You are not authorized to perform this action.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested record could not be found.';
      case 409:
        return 'This record already exists or conflicts with an existing record.';
      case 422:
        return 'Some of the information provided is invalid. Please review it and try again.';
      case 408:
      case 504:
        return 'The server is taking too long to respond. Please try again.';
      default:
        return error.status >= 500
          ? 'The server could not complete the request. Please try again later.'
          : 'The request could not be completed. Please try again.';
    }
  }

  dismiss(id: number): void {
    const toast = this.messagesSubject.value.find(item => item.id === id);
    if (!toast || toast.leaving) {
      return;
    }
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
    }
    this.messagesSubject.next(this.messagesSubject.value.map(item =>
      item.id === id ? { ...item, leaving: true } : item
    ));
    this.timers.set(id, setTimeout(() => {
      this.timers.delete(id);
      this.messagesSubject.next(this.messagesSubject.value.filter(item => item.id !== id));
    }, 180));
  }

  private show(type: ToastType, message: string): void {
    const normalizedMessage = message?.trim();
    if (!normalizedMessage) {
      return;
    }

    const id = ++this.nextId;
    const toast: ToastMessage = {
      id,
      type,
      message: normalizedMessage,
      icon: this.iconFor(type),
      role: type === 'error' || type === 'warning' ? 'alert' : 'status'
    };
    this.messagesSubject.next([...this.messagesSubject.value, toast]);

    const duration = type === 'error' ? 7000 : type === 'warning' ? 5500 : 4500;
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  private iconFor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  }
}
