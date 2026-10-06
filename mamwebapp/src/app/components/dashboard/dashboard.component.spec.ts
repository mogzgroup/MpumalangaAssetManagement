import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';
import { DashboardWedge } from '../../models/dashboard-wedge.model';
import { FacilityService } from '../../services/facility/facility.service';
import { ToastService } from '../../services/toast.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let facilityService: jasmine.SpyObj<FacilityService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let changeDetector: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    facilityService = jasmine.createSpyObj<FacilityService>('FacilityService', [
      'getMapCoordinates',
      'getFacilityZonings',
      'getDashboardWedges'
    ]);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['getApiErrorMessage', 'showError']);
    changeDetector = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['markForCheck']);
    const dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    facilityService.getMapCoordinates.and.returnValue(of([]));
    facilityService.getFacilityZonings.and.returnValue(of([]));
    facilityService.getDashboardWedges.and.returnValue(of([
      { name: 'Non Residential Buildings', total: 10 },
      { name: 'Dwellings', total: 20 },
      { name: 'Land', total: 30 }
    ] as DashboardWedge[]));

    TestBed.configureTestingModule({
      providers: [
        { provide: FacilityService, useValue: facilityService },
        { provide: MatDialog, useValue: dialog },
        { provide: ToastService, useValue: toastService },
        { provide: ChangeDetectorRef, useValue: changeDetector }
      ]
    });
    component = TestBed.runInInjectionContext(() => new DashboardComponent());
  });

  it('loads dashboard sections independently without requesting unused summaries', () => {
    component.ngOnInit();

    expect(facilityService.getMapCoordinates).toHaveBeenCalledTimes(1);
    expect(facilityService.getFacilityZonings).toHaveBeenCalledTimes(1);
    expect(facilityService.getDashboardWedges).toHaveBeenCalledTimes(1);

    expect(component.markers).toEqual([]);
    expect(component.facilityType).toBeUndefined();
    expect(component.nonResidentialBuildings.total).toBe(10);
    expect(component.dwellings.total).toBe(20);
    expect(component.land.total).toBe(30);
    expect(changeDetector.markForCheck).toHaveBeenCalledTimes(3);
    expect(toastService.showError).not.toHaveBeenCalled();
  });

  it('ends the zoning loading state and offers retry when its request times out', () => {
    jasmine.clock().install();
    facilityService.getFacilityZonings.and.returnValue(NEVER);

    component.loadZonings();
    jasmine.clock().tick(30001);

    expect(component.loadingZonings).toBe(false);
    expect(component.zoningsLoadError).toBe('Zoning information is taking too long to load.');
    expect(toastService.showError).toHaveBeenCalledWith(component.zoningsLoadError);

    jasmine.clock().uninstall();
  });

  it('ends the dashboard totals loading state and offers retry when its request times out', () => {
    jasmine.clock().install();
    facilityService.getDashboardWedges.and.returnValue(NEVER);

    component.loadWedges();
    jasmine.clock().tick(30001);

    expect(component.loadingWedges).toBe(false);
    expect(component.wedgesLoadError).toBe('Dashboard totals are taking too long to load.');
    expect(toastService.showError).toHaveBeenCalledWith(component.wedgesLoadError);

    jasmine.clock().uninstall();
  });

  it('renders valid zoning results and ignores rows with blank names', () => {
    facilityService.getFacilityZonings.and.returnValue(of([{
      name: 'Dwellings',
      facilityZonings: [
        { name: 'residential', signedOff: 0, total: 1019 },
        { name: '', signedOff: 0, total: 1 }
      ]
    }]));

    component.loadZonings();

    expect(component.loadingZonings).toBe(false);
    expect(component.zoningsLoadError).toBe('');
    expect(component.facilityType.facilityZonings).toEqual([
      { name: 'residential', signedOff: 0, total: 1019 }
    ]);
  });
});
