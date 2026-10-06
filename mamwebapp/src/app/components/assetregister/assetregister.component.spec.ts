import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { Facility } from '../../models/facility.model';
import { AuthenticationService } from '../../services/authentication.service';
import { FacilityService } from '../../services/facility/facility.service';
import { AssetregisterComponent } from './assetregister.component';
import { ToastService } from '../../services/toast.service';

describe('AssetregisterComponent', () => {
  let component: AssetregisterComponent;
  let facilityService: jasmine.SpyObj<FacilityService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const facility = {
    id: 7,
    name: 'Central Office',
    fileReference: 'FILE-7',
    type: 'Land',
    clientCode: 'ASSET-7',
    status: 'Saved'
  } as Facility;

  beforeEach(() => {
    facilityService = jasmine.createSpyObj<FacilityService>('FacilityService', [
      'getAssetRegisterfacilities',
      'deleteFacility'
    ]);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', [
      'showSuccess', 'showError', 'showWarning', 'showInfo', 'getApiErrorMessage'
    ]);
    toastService.getApiErrorMessage.and.returnValue('Unable to connect to the server. Please check your connection and try again.');
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    facilityService.getAssetRegisterfacilities.and.returnValue(of([facility]));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { currentUser: of({ id: 1, roleId: 2 }) } },
        { provide: FacilityService, useValue: facilityService },
        { provide: ToastService, useValue: toastService },
        { provide: MatDialog, useValue: dialog }
      ]
    });
    component = TestBed.runInInjectionContext(() => new AssetregisterComponent());
  });

  it('keeps loading active while the table request is pending', () => {
    const request = new Subject<Facility[]>();
    facilityService.getAssetRegisterfacilities.and.returnValue(request);

    component.ngOnInit();

    expect(component.loading).toBe(true);
    expect(component.dataSource.data).toEqual([]);
    request.complete();
  });

  it('loads assets without replacing the table data source', () => {
    const dataSource = component.dataSource;
    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.dataSource).toBe(dataSource);
    expect(component.dataSource.data).toEqual([facility]);
    expect(component.landTotal).toBe(1);
  });

  it('treats an empty response as an empty result rather than an error', () => {
    facilityService.getAssetRegisterfacilities.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.error).toBe('');
    expect(component.loading).toBe(false);
    expect(component.dataSource.data).toEqual([]);
  });

  it('shows a friendly API error and supports retry', () => {
    facilityService.getAssetRegisterfacilities.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0 }))
    );
    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Unable to load assets. Please try again.');

    facilityService.getAssetRegisterfacilities.and.returnValue(of([facility]));
    component.retryLoadFacilities();

    expect(component.error).toBe('');
    expect(component.dataSource.data).toEqual([facility]);
  });

  it('updates an existing asset after a successful save event', () => {
    component.ngOnInit();
    const updatedFacility = { ...facility, name: 'Updated Office' };

    component.addUpdateAsset({ response: 'isUpdatedSuccessful', data: updatedFacility });

    expect(component.showDialog).toBe(false);
    expect(component.dataSource.data).toEqual([updatedFacility]);
  });

  it('does not close the editor when the save event has no returned asset', () => {
    component.showDialog = true;

    component.addUpdateAsset({ response: 'isAddedSuccessful', data: null });

    expect(component.showDialog).toBe(true);
    expect(component.facilities).toEqual([]);
  });

  it('keeps a failed delete confirmation open and retains the asset', () => {
    facilityService.deleteFacility.and.returnValue(of(null as Facility));
    component.facility = facility;
    component.showdelete = true;

    component.deleteFacility();

    expect(component.facilities).toEqual([]);
    expect(component.showdelete).toBe(true);
    expect(component.deleting).toBe(false);
    expect(toastService.showError).toHaveBeenCalled();
  });

  it('removes an asset only after delete succeeds', () => {
    facilityService.deleteFacility.and.returnValue(of(facility));
    component.facilities = [facility];
    component.dataSource.data = [facility];
    component.facility = facility;
    component.showdelete = true;

    component.deleteFacility();

    expect(component.facilities).toEqual([]);
    expect(component.dataSource.data).toEqual([]);
    expect(component.showdelete).toBe(false);
  });
});
