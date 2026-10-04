import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserComponent } from './components/user/user.component';
import { LoginComponent } from './common/login/login.component';
import { AssetregisterComponent } from './components/assetregister/assetregister.component';
import { AuthGuard } from '../app/helpers/auth.guard';
import { Role } from '../app/models/role.model';
import { FinancialsComponent } from './components/assetregister/addassetregister/financials/financials.component';
import { ImprovementsComponent } from './components/assetregister/addassetregister/improvements/improvements.component';
import { LandComponent } from './components/assetregister/addassetregister/land/land.component';
import { UampComponent } from './components/uamp/uamp.component';
import { CampComponent } from './components/camp/camp.component';
import { UampDetailsComponent } from './components/uamp/uamp-details/uamp-details.component';
import { TemplateOneComponent } from './components/uamp/template-one/template-one.component';
import { TemplateFiveOneComponent } from './components/uamp/template-five-one/template-five-one.component';
import { TemplateFiveThreeComponent } from './components/uamp/template-five-three/template-five-three.component';
import { TemplateFiveTwoComponent } from './components/uamp/template-five-two/template-five-two.component';
import { TemplateFourOneComponent } from './components/uamp/template-four-one/template-four-one.component';
import { TemplateFourTwoComponent } from './components/uamp/template-four-two/template-four-two.component';
import { TemplateSevenComponent } from './components/uamp/template-seven/template-seven.component';
import { TemplateSixComponent } from './components/uamp/template-six/template-six.component';
import { TemplateThreeComponent } from './components/uamp/template-three/template-three.component';
import { TemplateTwoOneComponent } from './components/uamp/template-two-one/template-two-one.component';
import { TemplateTwoTwoComponent } from './components/uamp/template-two-two/template-two-two.component';
import { ConditionAssessmentComponent } from './components/assetregister/conditionassessment/condition-assessment.component';
import { LeaseManagementComponent } from './components/leasemanagement/lease-management.component';
import { HiringComponent } from './components/hiring/hiring.component';
import { LeaseRegisterComponent } from './components/lesesregister/leaseregister.component';
import { FacilityManagementComponent } from './components/facilitymanagement/facility-management.component';
import { ReportFaultComponent } from './components/facilitymanagement/reportfault/report.fault.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },{
    path: 'users',
    component: UserComponent,
    canActivate: [AuthGuard],
  },{
    path: 'assetregister',
    component: AssetregisterComponent,
    canActivate: [AuthGuard],
  },{
    path: 'facility',
    component: FacilityManagementComponent,
    canActivate: [AuthGuard],
  },  
  {
    path: 'addland',
    component: LandComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'addimprovement',
    component: ImprovementsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'addfinancial',
    component: FinancialsComponent,
    canActivate: [AuthGuard],
  },  
  {
    path: 'camp',
    component: CampComponent,
    canActivate: [AuthGuard],
  },  
  {
    path: 'uamp',
    component: UampComponent,
    canActivate: [AuthGuard],
  }, 
  {
    path: 'hiring',
    component: HiringComponent,
    canActivate: [AuthGuard],
  }, 
  {
    path: 'leaseRegister',
    component: LeaseRegisterComponent,
    canActivate: [AuthGuard],
  }, 
  {
    path: 'conditionAssessment',
    component: ConditionAssessmentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'leaseManagement',
    component: LeaseManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reportfault',
    component: ReportFaultComponent,
  },
  {
    path: 'uampDetails',
    component: UampDetailsComponent,
    canActivate: [AuthGuard],
    children:[
      {
        path: 'uampTemp1',
        component: TemplateOneComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp21',
        component: TemplateTwoOneComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp22',
        component: TemplateTwoTwoComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp3',
        component: TemplateThreeComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp41',
        component: TemplateFourOneComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp42',
        component: TemplateFourTwoComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp51',
        component: TemplateFiveOneComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp52',
        component: TemplateFiveTwoComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp53',
        component: TemplateFiveThreeComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp6',
        component: TemplateSixComponent,
        canActivate: [AuthGuard],
        
      },{
        path: 'uampTemp7',
        component: TemplateSevenComponent,
        canActivate: [AuthGuard],
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
  },{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

