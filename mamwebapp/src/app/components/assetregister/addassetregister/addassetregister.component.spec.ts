import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Facility } from 'src/app/models/facility.model';
import { AddassetregisterComponent } from './addassetregister.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { SharedService } from 'src/app/services/shared.service';
import { ToastService } from 'src/app/services/toast.service';

describe('AddassetregisterComponent', () => {
  let component: AddassetregisterComponent;
  let fixture: ComponentFixture<AddassetregisterComponent>;
  let facilityService: jasmine.SpyObj<FacilityService>;

  beforeEach(() => {
    facilityService = jasmine.createSpyObj<FacilityService>('FacilityService', [
      'getFacilityById', 'getFiles', 'saveFacility', 'uploadFiles'
    ]);

    TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, AddassetregisterComponent],
    providers: [
        { provide: AuthenticationService, useValue: { currentUserValue: { id: 7, roleId: 2 } } },
        { provide: FacilityService, useValue: facilityService },
        {
            provide: SharedService,
            useValue: {
                getDepartments: () => [],
                getAssetTypes: () => [],
                getDistricts: () => []
            }
        },
        { provide: Router, useValue: {} },
        {
            provide: ToastService,
            useValue: {
                ...jasmine.createSpyObj('ToastService', ['showSuccess', 'showError', 'showWarning', 'showInfo']),
                getApiErrorMessage: () => 'The server could not complete the request. Please try again later.'
            }
        }
    ]
})
      .overrideComponent(AddassetregisterComponent, { set: { template: '' } });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddassetregisterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedAsset', { mode: 'Add' });
    fixture.detectChanges();
  });

  it('creates in add mode', () => {
    expect(component).toBeTruthy();
    expect(component.mode).toBe('Add');
    expect(component.loading).toBeFalsy();
  });

  it('shows a successfully loaded asset and clears the loading state', () => {
    const facility = Object.assign(new Facility(), { id: 30507, fileReference: 'ASSET-30507' });
    facilityService.getFacilityById.and.returnValue(of(facility));
    spyOn(component, 'initFacility');
    spyOn(component, 'getFiles');
    component.selectedAsset = { mode: 'View', facilityId: 30507, facilityType: 1 };

    component.loadSelectedFacility();

    expect(component.loading).toBeFalsy();
    expect(component.loadError).toBeFalsy();
    expect(component.facility).toBe(facility);
    expect(component.initFacility).toHaveBeenCalled();
    expect(component.getFiles).toHaveBeenCalledWith(facility.fileReference);
  });

  it('clears loading and shows a retryable error when asset details fail to load', () => {
    facilityService.getFacilityById.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    component.selectedAsset = { mode: 'View', facilityId: 30507, facilityType: 1 };

    component.loadSelectedFacility();

    expect(component.loading).toBeFalsy();
    expect(component.loadError).toBeTruthy();
    expect(component.errorMsg).toBe('Unable to load the asset. Please try again.');
  });

  it('does not submit an invalid land form', () => {
    component.onLandFormSubmit();

    expect(facilityService.saveFacility).not.toHaveBeenCalled();
    expect(component.errorMsg).toContain('required asset details');
  });

  it('skips duplicate supporting files', () => {
    const file = new File(['asset document'], 'asset.pdf', { lastModified: 1 });
    component.onLandSelectFile([file]);
    component.onLandSelectFile([file]);

    expect(component.uploadedLandFiles).toEqual([file]);
    expect(component.fileSelectionError).toBe('Duplicate files were skipped.');
  });

  it('shows a friendly authorization error when saving is denied', () => {
    facilityService.saveFacility.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403 }))
    );
    component.landForm.patchValue({
      clientCode: 'ASSET-1',
      facilityName: 'Test facility',
      facilityType: { name: 'Land' }
    });

    component.onLandFormSubmit();

    expect(component.errorMsg).toBe('You are not authorized to save this asset.');
    expect(component.savingLand).toBeFalsy();
  });

  it('clears the file loading state when supporting documents fail to load', () => {
    facilityService.getFiles.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    component.getFiles('ASSET-1');

    expect(component.filesLoading).toBeFalsy();
    expect(component.filesError).toBeTruthy();
    expect(component.filesAreLoaded).toBeFalsy();
  });
});
