import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatGridListModule, MatCardModule } from '@angular/material';
import { MatInputModule, MatButtonModule, MatCheckboxModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFileUploadModule } from 'angular-material-fileupload';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ChartsModule } from 'ng2-charts';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
//import { FilterPipe } from './filter.pipe';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from './common/loading-spinner/loading-spinner.component';
import { HeaderComponent, DialogNotification, DialogNotificationExpand, ExpiryComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { MenuStaticComponent } from './common/menu-static/menu-static.component';
import { MenuDrawerComponent } from './common/menu-drawer/menu-drawer.component';
import { AuthInterceptorService } from './common/auth/auth-interceptor.service';
import { ProfileComponent } from './module/profile/profile.component';
import { DashboardComponent } from './module/dashboard/dashboard.component';
import { AdminDashboardCardComponent } from './components/admin-dashboard-card/admin-dashboard-card.component';
import { ClassBoxComponent } from './components/class-box/class-box.component';
import { DashboardDetailsComponent, DialogSubmitAssignmentSt, ChatHistoryDialogComponent, DialogGenerateWhiteboard } from './module/dashboard-details/dashboard-details.component';
import { AdminAddComponent } from './module/admin/admin-user/admin-add.component';
import { RegisterComponent } from './module/register/register.component';
import { AddClassComponent } from './module/add-class/add-class.component';
import { SudentListComponent } from './module/sudent-list/sudent-list.component';
import { DocumentHistoryComponent } from './module/document-history/document-history.component';
import { ClassHistoryComponent } from './module/class-history/class-history.component';
import { AdminDashboardComponent } from './module/admin/admin-dashboard/admin-dashboard.component';
import { AdminSubjectComponent, DialogAddEditAdminRecordDialog, DialogDeleteAdminRecordDialog } from './module/admin/admin-subject/admin-subject.component';
import { AdminClassComponent, DialogDeleteClassAdminGradeRecordDialog } from './module/admin/admin-class/admin-class.component';
import { AdminClassAddComponent } from './module/admin/admin-class/admin-class-add/admin-class-add.component';
import { AdminGradeComponent, DialogAddEditGradeAdminRecordDialog, DialogDeleteAdminGradeRecordDialog } from './module/admin/admin-grade/admin-grade.component';
import { AdminSectionComponent, DialogAddEditSectionAdminRecordDialog, DialogDeleteAdminSectionRecordDialog } from './module/admin/admin-section/admin-section.component';
import { ClassLaunchComponent, DialogWarningDialog, DialogAttendanceDialog } from './module/class-launch/class-launch.component';
import { AdminGlanceComponent } from './module/admin/admin-glance/admin-glance.component';
import { AdminCommunityComponent } from './module/admin/admin-community/admin-community.component';
import { AdminStudentComponent, DialogAddEditAdminStudentDialog } from './module/admin/admin-student/admin-student.component';
import { AdminSemesterComponent, DialogAddEditAdminSemesterDialog, DialogDeleteAdminSemesterDialog } from './module/admin/admin-semester/admin-semester.component';
import { TestComponent } from './newComp/test.component';
import { ChatTestComponent } from './newComp/chattest/chat.test.component';
import { WebSocketService } from './services/websocket.service';
import { CheckAssignmentComponent, DialogAddAssignmentCheck } from './module/check-assignment/check-assignment.component';
import { GradebookComponent } from './module/gradebook/gradebook.component';
import { SearchComponent } from './module/admin/search/search.component';
import { QuizComponent } from './module/quiz/quiz.component';
import { NoteComponent } from './module/note/note.component';
import { NotifyDialogComponent } from './module/notify-dialog/notify-dialog.component';
import { AdminCommunicationComponent } from './module/admin/admin-communication/admin-communication.component';
import { AdminDirectoryComponent } from './module/admin/admin-directory/admin-directory.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AccountPasswordComponent } from './forgot-password/account-password.component';
import { ResetPasswordComponent } from './forgot-password/reset-password.component';
import { ActivateComponent } from './forgot-password/activate.component';
import { ClassAttendanceDialogComponent } from './module/dashboard-details/class-attendance-dialog.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule, 
    MatMenuModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    LayoutModule,
    FlexLayoutModule,
    MatProgressBarModule,
    //MatFileUploadModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTabsModule,
    FullCalendarModule,
    ChartsModule,
    MatBadgeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatButtonToggleModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    LoadingSpinnerComponent,
    ProfileComponent,
    ResetPasswordComponent,
    ActivateComponent,
    HeaderComponent,
    FooterComponent,
    MenuStaticComponent,
    MenuDrawerComponent,
    DashboardComponent,
    ClassBoxComponent,
    DashboardDetailsComponent,
    AdminAddComponent,
    RegisterComponent,
    AddClassComponent,
    SudentListComponent,
    DocumentHistoryComponent,
    ClassHistoryComponent,
    AdminDashboardComponent,
    AdminSubjectComponent,
    DialogAddEditAdminRecordDialog,
    DialogDeleteAdminRecordDialog,
    AdminClassComponent,
    DialogDeleteClassAdminGradeRecordDialog,
    DialogAddEditAdminSemesterDialog,
    DialogDeleteAdminSemesterDialog,
    AdminClassAddComponent,
    AdminGradeComponent,
    DialogAddEditGradeAdminRecordDialog, 
    DialogDeleteAdminGradeRecordDialog, 
    AdminSectionComponent,
    AdminDashboardCardComponent,
    TestComponent,
    ChatTestComponent,
    DialogAddEditSectionAdminRecordDialog, 
    DialogDeleteAdminSectionRecordDialog, ClassLaunchComponent, AdminGlanceComponent, AdminCommunityComponent, AdminStudentComponent, DialogAddEditAdminStudentDialog,  AdminSemesterComponent, CheckAssignmentComponent, DialogAddAssignmentCheck, GradebookComponent, SearchComponent, DialogSubmitAssignmentSt, ChatHistoryDialogComponent, ClassAttendanceDialogComponent, DialogGenerateWhiteboard, DialogNotification, ExpiryComponent, DialogNotificationExpand, QuizComponent, NoteComponent, DialogDeleteClassAdminGradeRecordDialog, NotifyDialogComponent, DialogWarningDialog, DialogAttendanceDialog, AdminCommunicationComponent, AdminDirectoryComponent, ForgotPasswordComponent, AccountPasswordComponent,
 ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    WebSocketService
  ],
  bootstrap: [AppComponent],
  entryComponents: [AddClassComponent, ProfileComponent, ResetPasswordComponent, DialogAddEditAdminRecordDialog, DialogDeleteAdminRecordDialog, AdminClassAddComponent, DialogAddEditGradeAdminRecordDialog, DialogDeleteAdminGradeRecordDialog, DialogAddEditSectionAdminRecordDialog, DialogDeleteAdminSectionRecordDialog, DialogDeleteClassAdminGradeRecordDialog, DialogAddAssignmentCheck, DialogSubmitAssignmentSt, ChatHistoryDialogComponent, ClassAttendanceDialogComponent, DialogGenerateWhiteboard, DialogNotification, ExpiryComponent, DialogNotificationExpand, NotifyDialogComponent, DialogWarningDialog, DialogAttendanceDialog, DialogAddEditAdminSemesterDialog, DialogDeleteAdminSemesterDialog, DialogAddEditAdminStudentDialog]
})
export class AppModule { }
//window.onunload = () => {
  // Clear the local storage
  //localStorage.removeItem('userData');
  //window.MyStorage.clear()
//}