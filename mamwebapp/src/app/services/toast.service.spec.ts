import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jasmine.clock().install();
    service = new ToastService();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('publishes accessible typed messages', () => {
    let messages = [];
    service.messages$.subscribe(value => messages = value);

    service.showSuccess('Saved.');
    service.showError('Unable to save.');

    expect(messages.map(message => message.type)).toEqual(['success', 'error']);
    expect(messages.map(message => message.role)).toEqual(['status', 'alert']);
    jasmine.clock().tick(7180);
  });

  it('stacks notifications and dismisses them individually', () => {
    let messages = [];
    service.messages$.subscribe(value => messages = value);

    service.showInfo('First.');
    service.showWarning('Second.');
    const firstId = messages[0].id;
    const secondId = messages[1].id;

    service.dismiss(secondId);
    expect(messages.length).toBe(2);
    expect(messages[1].leaving).toBe(true);
    jasmine.clock().tick(180);
    expect(messages.map(message => message.id)).toEqual([firstId]);
    service.dismiss(firstId);
    jasmine.clock().tick(180);
  });

  it('automatically dismisses notifications after the configured duration', () => {
    let messages = [];
    service.messages$.subscribe(value => messages = value);

    service.showSuccess('Saved.');
    jasmine.clock().tick(4680);

    expect(messages).toEqual([]);
  });

  it('maps API failures to safe user-facing messages', () => {
    expect(service.getApiErrorMessage(new HttpErrorResponse({ status: 0 })))
      .toContain('Unable to connect to the server');
    expect(service.getApiErrorMessage(new HttpErrorResponse({ status: 401 })))
      .toBe('You are not authorized to perform this action.');
    expect(service.getApiErrorMessage(new HttpErrorResponse({ status: 500 })))
      .toBe('The server could not complete the request. Please try again later.');
  });
});
