import { Directive, HostListener, Input } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Directive({
  standalone: false,
  selector: 'button[ngxPrint]'
})
export class PrintSectionDirective {
  @Input() printSectionId = '';
  @Input() printTitle = '';
  @Input() useExistingCss = false;

  constructor(private toastService: ToastService) { }

  @HostListener('click')
  printSection(): void {
    const section = document.getElementById(this.printSectionId);
    if (!section) {
      this.toastService.showError('Unable to prepare this section for printing.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toastService.showError('Allow pop-ups to print this section.');
      return;
    }

    const content = section.cloneNode(true) as HTMLElement;
    this.copyFormValues(section, content);
    const documentStyles = this.useExistingCss
      ? Array.from(document.querySelectorAll('base, style, link[rel="stylesheet"]'))
        .map(element => element.outerHTML)
        .join('')
      : '';

    printWindow.addEventListener('load', () => {
      printWindow.focus();
      printWindow.print();
    }, { once: true });
    printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
    printWindow.document.open();
    printWindow.document.write(
      `<!doctype html><html><head><meta charset="utf-8">${documentStyles}</head><body></body></html>`
    );
    printWindow.document.title = this.printTitle;
    printWindow.document.body.appendChild(content);
    printWindow.document.close();
  }

  private copyFormValues(source: HTMLElement, clone: HTMLElement): void {
    const sourceControls = source.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select'
    );
    const clonedControls = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select'
    );

    sourceControls.forEach((control, index) => {
      const clonedControl = clonedControls.item(index);
      if (control instanceof HTMLInputElement && clonedControl instanceof HTMLInputElement) {
        clonedControl.value = control.value;
        clonedControl.checked = control.checked;
      } else if (control instanceof HTMLTextAreaElement && clonedControl instanceof HTMLTextAreaElement) {
        clonedControl.textContent = control.value;
      } else if (control instanceof HTMLSelectElement && clonedControl instanceof HTMLSelectElement) {
        clonedControl.value = control.value;
      }
    });
  }
}
