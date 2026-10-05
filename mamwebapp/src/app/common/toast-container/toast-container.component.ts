import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: false,
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ToastContainerComponent {
  readonly messages$: ToastService['messages$'];

  constructor(private toastService: ToastService) {
    this.messages$ = this.toastService.messages$;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
