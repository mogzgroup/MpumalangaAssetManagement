import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps'
import { CurrencyPipe, DatePipe} from '@angular/common';
import { AutocompleteComponent } from './google-places.component';
// for HttpClient import:
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { JwtInterceptor } from '../app/helpers/jwt.interceptor';
import { ErrorInterceptor } from '../app/helpers/error.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './common/footer/footer.component';
import { SidemenuComponent } from './common/sidemenu/sidemenu.component';
import { HeaderComponent } from './common/header/header.component';
import { LoginComponent } from './common/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserComponent } from './components/user/user.component';
import { AddUserComponent } from './components/user/add-user/add-user.component';
import { AssetregisterComponent } from './components/assetregister/assetregister.component'
import { UampComponent } from './components/uamp/uamp.component';
import { CampComponent } from './components/camp/camp.component';
import { ViewUampComponent } from './components/uamp/view-uamp/view-uamp.component'; 
import { TemplateOneComponent } from './components/uamp/template-one/template-one.component';
import { TemplateTwoTwoComponent } from './components/uamp/template-two-two/template-two-two.component';
import { TemplateTwoOneComponent } from './components/uamp/template-two-one/template-two-one.component';
import { TemplateThreeComponent } from './components/uamp/template-three/template-three.component';
import { TemplateFourOneComponent } from './components/uamp/template-four-one/template-four-one.component';
import { TemplateFourTwoComponent } from './components/uamp/template-four-two/template-four-two.component';
import { TemplateFiveOneComponent } from './components/uamp/template-five-one/template-five-one.component';
import { TemplateFiveThreeComponent } from './components/uamp/template-five-three/template-five-three.component';
import { TemplateFiveTwoComponent } from './components/uamp/template-five-two/template-five-two.component';
import { TemplateSevenComponent } from './components/uamp/template-seven/template-seven.component';
import { TemplateSixComponent } from './components/uamp/template-six/template-six.component';
import { ReportFaultComponent } from './components/facilitymanagement/reportfault/report.fault.component'
import { AddMunicipalUtilityServicesComponent } from './components/uamp/template-two-one/add-municipal-utility-services/add-municipal-utility-services';
import { NgxPrintModule } from 'ngx-print';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService } from 'primeng/api';

//primeng
import { InputMaskModule } from 'primeng/inputmask';
import { MenuModule } from 'primeng/menu';
import { TimelineModule } from 'primeng/timeline';
import { SidebarModule } from 'primeng/sidebar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PopoverModule } from 'primeng/popover';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { MessageModule} from 'primeng/message';
import { StepsModule } from 'primeng/steps';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule}  from 'primeng/textarea';
import { InputNumberModule}  from 'primeng/inputnumber';
import { AddassetregisterComponent } from './components/assetregister/addassetregister/addassetregister.component';
import { FinancialsComponent } from './components/assetregister/addassetregister/financials/financials.component';
import { ImprovementsComponent } from './components/assetregister/addassetregister/improvements/improvements.component';
import { LandComponent } from './components/assetregister/addassetregister/land/land.component';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PrintAssetComponent } from './components/assetregister/print-asset/print-asset.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FilterService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule} from 'primeng/slider';
import { ContextMenuModule} from 'primeng/contextmenu';
import { ProgressBarModule} from 'primeng/progressbar';
import { InputTextModule} from 'primeng/inputtext';
import { UampDetailsComponent } from './components/uamp/uamp-details/uamp-details.component';
import { ConditionAssessmentComponent } from './components/assetregister/conditionassessment/condition-assessment.component';
import { LeaseManagementComponent } from './components/leasemanagement/lease-management.component';
import { LeasedPropertyComponent } from './components/leasemanagement/leasedproperty/leased-property.component';
import { HiringComponent } from './components/hiring/hiring.component';
import { LeaseRegisterComponent } from './components/lesesregister/leaseregister.component';
import { ProjectComponent } from './components/facilitymanagement/project/project.component';
import { ServiceRequestComponent } from './components/facilitymanagement/servicerequest/service-request.component';
import { FacilityManagementComponent } from './components/facilitymanagement/facility-management.component';
import { AddEditProjectComponent } from './components/facilitymanagement/project/addeditproject/add-edit-project.component';
import { ViewServiceRequestComponent } from './components/facilitymanagement/servicerequest/viewservicerequest/view-service-request.component';
import { AddFaultComponent } from './components/facilitymanagement/reportfault/addfault/add.fault.component';
import { TrackTicketComponent } from './components/facilitymanagement/reportfault/trackticket/track.ticket.component';
import { GapAnalysisComponent } from './components/uamp/gap-analysis/gap-analysis.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    AutocompleteComponent,
    TemplateOneComponent,
    FooterComponent,
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    UserComponent,
    AddUserComponent,
    SidemenuComponent,
    AssetregisterComponent,
    AddassetregisterComponent,
    LandComponent,
    ImprovementsComponent,
    FinancialsComponent,  
    ViewUampComponent,
    ConditionAssessmentComponent,
    PrintAssetComponent,    
    TemplateTwoOneComponent,
    TemplateTwoTwoComponent,
    TemplateThreeComponent,
    TemplateFourOneComponent,
    TemplateFourTwoComponent,
    TemplateFiveOneComponent,
    TemplateFiveTwoComponent,
    TemplateFiveThreeComponent,
    TemplateSixComponent,
    TemplateSevenComponent,
    AddMunicipalUtilityServicesComponent,
    UampComponent,  
    CampComponent,
    UampDetailsComponent,
    GapAnalysisComponent,
    LeaseManagementComponent,
    LeasedPropertyComponent,
    HiringComponent,
    LeaseRegisterComponent,
    ProjectComponent,
    ServiceRequestComponent,
    FacilityManagementComponent,
    AddEditProjectComponent,
    ViewServiceRequestComponent,
    ReportFaultComponent,
    AddFaultComponent,
    TrackTicketComponent
  ],
  imports: [
    BrowserModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,    
    HttpClientModule,
    LoadingBarHttpClientModule,
    MessageModule,
    ButtonModule,
    ScrollPanelModule,
    PopoverModule,
    DialogModule,
    ToastModule,
    MultiSelectModule,
    TableModule,
    MenuModule,
    SidebarModule,
    BreadcrumbModule,
    CheckboxModule,
    ConfirmDialogModule,
    TooltipModule,
    ChartModule,
    GoogleMapsModule,
    StepsModule,
    CardModule,
    TabsModule,
    SelectModule,
    FieldsetModule,
    DatePickerModule,
    FileUploadModule,
    SplitButtonModule,
    TextareaModule,
    NgxPrintModule,
    InputNumberModule,
    DynamicDialogModule,
    PanelModule,
    AutoCompleteModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,		
    InputTextModule,
    ProgressBarModule,
    PasswordModule,
    SelectButtonModule,
    ToggleButtonModule,
    ToggleSwitchModule,
    TimelineModule,
    DividerModule,
    //GooglePlaceModule,
    RadioButtonModule,
    InputMaskModule,
    //NgxQRCodeModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    CurrencyPipe, FilterService, PrimeNG, ConfirmationService,
    AddMunicipalUtilityServicesComponent, DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }

