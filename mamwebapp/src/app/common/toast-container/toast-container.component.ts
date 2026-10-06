import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'app-toast-container',
    templateUrl: './toast-container.component.html',
    styleUrls: ['./toast-container.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon, MatIconButton, AsyncPipe]
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);

  readonly messages$: ToastService['messages$'];

  constructor() {
    this.messages$ = this.toastService.messages$;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
