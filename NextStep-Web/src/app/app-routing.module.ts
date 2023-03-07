import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './common/auth/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './module/profile/profile.component';
import { DashboardComponent } from './module/dashboard/dashboard.component';
import { DashboardDetailsComponent } from './module/dashboard-details/dashboard-details.component';
import { AdminAddComponent } from './module/admin/admin-user/admin-add.component';
import { RegisterComponent } from './module/register/register.component';
import { SudentListComponent } from './module/sudent-list/sudent-list.component';
import { DocumentHistoryComponent } from './module/document-history/document-history.component';
import { ClassHistoryComponent } from './module/class-history/class-history.component';
import { CheckAssignmentComponent } from './module/check-assignment/check-assignment.component';
import { GradebookComponent } from './module/gradebook/gradebook.component';
import { ClassLaunchComponent } from './module/class-launch/class-launch.component';
import { AdminDashboardComponent } from './module/admin/admin-dashboard/admin-dashboard.component';
import { AdminClassComponent } from './module/admin/admin-class/admin-class.component';
import { AdminSubjectComponent } from './module/admin/admin-subject/admin-subject.component';
import { AdminGradeComponent } from './module/admin/admin-grade/admin-grade.component';
import { AdminSectionComponent } from './module/admin/admin-section/admin-section.component';
import { AdminGlanceComponent } from './module/admin/admin-glance/admin-glance.component';
import { AdminCommunityComponent } from './module/admin/admin-community/admin-community.component';
import { AdminStudentComponent } from './module/admin/admin-student/admin-student.component';
import { AdminSemesterComponent } from './module/admin/admin-semester/admin-semester.component';
import { AdminCommunicationComponent } from './module/admin/admin-communication/admin-communication.component'
import { AdminDirectoryComponent } from './module/admin/admin-directory/admin-directory.component'
import { SearchComponent } from './module/admin/search/search.component';
import { QuizComponent } from './module/quiz/quiz.component';
import { NoteComponent } from './module/note/note.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AccountPasswordComponent } from './forgot-password/account-password.component';
import { ActivateComponent } from './forgot-password/activate.component';
import { TestComponent } from './newComp/test.component';
import { ChatTestComponent } from './newComp/chattest/chat.test.component';

const appRoutes: Routes = [
  //{ path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', component: LoginComponent },
  { path: 'u/:user/login/user', component: LoginComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },
  { path: 'account/reset', component: AccountPasswordComponent },
  { path: 'activate/:resettoken', component: ActivateComponent },
  { path: 'activate/:resettoken', component: ActivateComponent },
  //{ path: 'register', component: RegisterComponent },
  { path: 'test', component: TestComponent },
  { path: 'test2', component: ChatTestComponent },
  //{ path: 'profile', component: ProfileComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'u/:user/dashboard', component: DashboardComponent },
  { path: 'dashboard/:id', component: DashboardDetailsComponent },
  { path: 'u/:user/dashboard/:id', component: DashboardDetailsComponent },
  { path: 'dashboard/:id/class', component: ClassLaunchComponent },
  { path: 'u/:user/dashboard/:id/class', component: ClassLaunchComponent },
  { path: 'student', component: SudentListComponent },
  { path: 'u/:user/student', component: SudentListComponent },
  { path: 'class-document', component: DocumentHistoryComponent },
  { path: 'u/:user/class-document', component: DocumentHistoryComponent },
  { path: 'document-history', component: ClassHistoryComponent },
  { path: 'u/:user/document-history', component: ClassHistoryComponent },
  { path: 'check-assignment', component: CheckAssignmentComponent },
  { path: 'u/:user/check-assignment', component: CheckAssignmentComponent },
  { path: 'gradebook', component: GradebookComponent },
  { path: 'u/:user/gradebook', component: GradebookComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'u/:user/admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin-user', component: AdminAddComponent },
  { path: 'u/:user/admin-user', component: AdminAddComponent },
  { path: 'admin-class', component: AdminClassComponent },
  { path: 'u/:user/admin-class', component: AdminClassComponent },
  { path: 'admin-subject', component: AdminSubjectComponent },
  { path: 'u/:user/admin-subject', component: AdminSubjectComponent },
  { path: 'admin-grade', component: AdminGradeComponent },
  { path: 'u/:user/admin-grade', component: AdminGradeComponent },
  { path: 'admin-section', component: AdminSectionComponent },
  { path: 'u/:user/admin-section', component: AdminSectionComponent },
  { path: 'admin-glance', component: AdminGlanceComponent },
  { path: 'u/:user/admin-glance', component: AdminGlanceComponent },
  { path: 'admin-community', component: AdminCommunityComponent },
  { path: 'u/:user/admin-community', component: AdminCommunityComponent },
  { path: 'admin-student', component: AdminStudentComponent },
  { path: 'u/:user/admin-student', component: AdminStudentComponent },
  { path: 'admin-search', component: SearchComponent },
  { path: 'u/:user/admin-search', component: SearchComponent },
  { path: 'admin-semester', component: AdminSemesterComponent },
  { path: 'u/:user/admin-semester', component: AdminSemesterComponent },
  { path: 'admin-communication', component: AdminCommunicationComponent },
  { path: 'u/:user/admin-communication', component: AdminCommunicationComponent },
  { path: 'admin-directory', component: AdminDirectoryComponent },
  { path: 'u/:user/admin-directory', component: AdminDirectoryComponent },
  { path: 'search', component: SearchComponent },
  { path: 'u/:user/search', component: SearchComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'u/:user/quiz', component: QuizComponent },
  { path: 'note', component: NoteComponent },
  { path: 'u/:user/note', component: NoteComponent },
  { path: '**', redirectTo: 'dashboard' }
  //{ path: 'dashboard', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
