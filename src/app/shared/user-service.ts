import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private eventSource = new BehaviorSubject<any>({
    eventName: 'INIT',
  });
  private messageSource = new BehaviorSubject(null);
  currentEvent = this.eventSource.asObservable();

  sidebarState = signal(true);
  constructor(private http: HttpClient, private configService: ConfigService) { }

  changeEvent(data: any) {
    this.eventSource.next(data);
  }
  Setdynamicformparam(param: any) {
    this.messageSource.next(param);
  }
  getdynamicformparam() {
    return this.messageSource.asObservable();
  }
  MastrtfileuploadNew(fileToUpload: Array<File>, Activity: string) {
    const headerSettings: { [name: string]: string | string[] } = {
      dataType: 'json',
      'No-Auth': 'True',
      key: 'IcomsImages',
    };
    const newHeader = new HttpHeaders(headerSettings);
    const formData: FormData = new FormData();
    fileToUpload.forEach((file: File) => {
      formData.append('Files', file, file.name);
      formData.append('folderName', Activity);
    });
    return this.http.post(
      `${this.configService.elockerUrl}/values/MasterUploadFiles_New`,
      formData,
      { headers: newHeader }
    );
  }

  userAuthentication(userName: string, password: string) {
    let data = 'username=' + userName + '&password=' + password + '&grant_type=password';
    let reqHeader = new HttpHeaders({
      'Content-Type': 'application/x-www-urlencoded',
      'No-Auth': 'True',
    });
    return this.http.post(this.configService.apiUrl + '/token', data, { headers: reqHeader });
  }

  UpdateClaims(userToken: string, userId: string, TokenExpireAfter: number) {
    let data = JSON.stringify(
      'uspApplicationUserUpdateLoginTokenSSO|userToken=' +
      userToken +
      '|userId=' +
      userId +
      '|TokenExpireAfter=' +
      TokenExpireAfter
    );
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'header';
    headerSettings['Content-Type'] = 'application/json';
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.post(this.configService.apiUrl + '/Values/authenticate', data, {
      headers: newHeader,
    });
  }
  SubmitPostChangeStatusData(spname: string, paramsparameter: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'change';
    const newHeader = new HttpHeaders(headerSettings);
    let data = JSON.stringify(spname + '|' + paramsparameter);
    return this.http.post(this.configService.apiUrl + '/values/PostQuestionAnswerData', data, {
      headers: newHeader,
    });
  }

  CustomFormActionActivesubmit(id: string, letaction: string, TableId: string, formName: any): any {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    //  headerSettings['No-Auth'] = 'True' ;
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    if (letaction == 'Deleted') {
      //  return this.http.get(this.configService.apiUrl + '/values/GetDataSet/?UiParam=uspMasterTableGetDetailsInList|tblname=' + tbname, {headers: newHeader});
      return this.http.delete(
        this.configService.apiUrl +
        '/values/Delete/?UiParam=uspCustomFormDeleteData|tableName=' +
        TableId +
        '|id=' +
        id +
        '|appUserId=' +
        sessionStorage.getItem('userId') +
        '|appUserRole=' +
        JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId,
        { headers: newHeader }
      );
    } else if (letaction == 'Active' || letaction == 'InActive') {
      return this.http.delete(
        this.configService.apiUrl +
        '/values/Delete/?UiParam=uspCustomFormActiveData|tableName=' +
        TableId +
        '|id=' +
        id +
        '|appUserId=' +
        sessionStorage.getItem('userId') +
        '|appUserRole=' +
        JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId,
        { headers: newHeader }
      );
    }
  }

  getUserData(userId: string, activity: string | string[]) {
    let authlet = 'Bearer ' + sessionStorage.getItem('userToken');
    // let _data = "uspApplicationUserGetDetail|userId=" + userId;
    let _data =
      'uspApplicationUserGetDetailUsingLoginToken|userId=' +
      userId +
      '|RoleId=' +
      JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    //  let reqHeader = new HttpHeaders({ 'content-Type': 'application/json'});
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = activity;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(
      this.configService.apiUrl + '/Values/GetUpdateDataSetProfile/?UiParam=' + _data,
      { headers: newHeader }
    );
  }

  userAuthenticationLogOutHome(userToken: string, userId: string) {
    let _data = JSON.stringify(
      'uspApplicationUserLogOut|username=' + userId + '|userToken=' + userToken
    );
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'header';
    headerSettings['Content-Type'] = 'application/json';
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.post(
      this.configService.apiUrl + '/values/PostReturnOutParameterfromBodyData',
      _data,
      { headers: newHeader }
    );
  }

  getChangeRoleUserData(userId: string, Roleid: string | string[], activity: string | string[]) {
    let authlet = 'Bearer ' + sessionStorage.getItem('userToken');
    // let _data = "uspApplicationUserGetDetail|userId=" + userId;
    let _data = 'uspApplicationUserGetDetailUsingLoginToken|userId=' + userId + '|RoleId=' + Roleid;
    //  let reqHeader = new HttpHeaders({ 'content-Type': 'application/json'});
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = Roleid;
    headerSettings['Activity'] = activity;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(
      this.configService.apiUrl + '/Values/GetUpdateDataSetProfile/?UiParam=' + _data,
      { headers: newHeader }
    );
  }

  getQuestionPaper<T = any>(procWithParameter: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'change';
    const newHeader = new HttpHeaders(headerSettings);
    //console.log("date=====",this.configService.apiUrl + '/values/GetDataSet/?UiParam=' + procWithParameter);
    return this.http.get<T>(this.configService.apiUrl + '/values/GetDataSet/?UiParam=' + procWithParameter, { headers: newHeader });
  }

  SubmitPostTypeData(spname: string, paramsparameter: string, formName: any, role?: string) {
    let currentRole = role || JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = currentRole;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    let data = JSON.stringify(spname + '|' + paramsparameter);
    //console.log("09809===========",this.configService.apiUrl + '/values/PostReturnOutParameterDeserializeMultiTable',data);
    return this.http.post(this.configService.apiUrl + '/values/PostReturnOutParameterDeserializeMultiTable', data, { headers: newHeader });
  }

  getUniqueId(formName: any) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    //  headerSettings['No-Auth'] = 'True' ;
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(this.configService.apiUrl + '/values/GetUniqueId/', {
      headers: newHeader,
    });
  }

  getQuestionPaperOne(procWithParameter: any) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'change';
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(
      this.configService.apiUrl + '/values/GetDataSet/?UiParam=' + procWithParameter,
      { headers: newHeader }
    );
  }

  // Upload files new method

  MastrtfileuploadMasters(fileToUpload: Array<File>, Activity: string, orgCode: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['No-Auth'] = 'True';
    headerSettings['key'] = 'IcomsImages';
    const newHeader = new HttpHeaders(headerSettings);
    const formData: FormData = new FormData();
    fileToUpload.forEach((file: File) => {
      formData.append('Files', file, file.name);
      formData.append('folderName', Activity);
      formData.append('companyName', orgCode);
    });
    return this.http.post(
      this.configService.elockerUrl + '/values/MasterUploadFiles_Masters',
      formData,
      { headers: newHeader }
    );
  }

  // Excel upload files new method

  Excelfileupload(fileToUpload: Array<File>, controllerName: string, exceltableName: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['No-Auth'] = 'True';
    const newHeader = new HttpHeaders(headerSettings);
    const formData: FormData = new FormData();
    fileToUpload.forEach((file: File) => {
      formData.append('Files', file, file.name);
    });

    formData.append('appUserId', sessionStorage.getItem('userId') || '{}');
    formData.append('tableName', exceltableName);
    return this.http.post(this.configService.apiUrl + '/values/' + controllerName, formData, {
      headers: newHeader,
    });
  }

  LoadReport(procWithParameter: string, formName: any) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(
      this.configService.apiUrl + '/values/GetDataSet/?UiParam=' + procWithParameter,
      { headers: newHeader }
    );
  }

  geChplData(procWithParameter: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'change';
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(
      'https://prjapi.nobilitasinfotech.com' + '/values/GetDataSet/?UiParam=' + procWithParameter,
      { headers: newHeader }
    );
  }

  SubmitPostForBufTracker(spname: string, paramsparameter: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'header';
    const newHeader = new HttpHeaders(headerSettings);
    let data = JSON.stringify(spname + '|' + paramsparameter);
    return this.http.post(
      this.configService.apiUrl + '/values/PostReturnOutParameterDeserializeMultiTable',
      data,
      { headers: newHeader }
    );
  }

  SubmitPostErpTicket(spname: string, paramsparameter: string, postapi: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'header';
    const newHeader = new HttpHeaders(headerSettings);
    let data = JSON.stringify(spname + '|' + paramsparameter);
    return this.http.post(postapi, data, { headers: newHeader });
  }

  // ERP forms method
  getPurchasePageLoadDrp(formName: any, spName: string) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    //  headerSettings['No-Auth'] = 'True' ;
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(this.configService.apiUrl + '/values/GetDropDownlist/?UiParam=' + spName + '|appUserId=' + sessionStorage.getItem('userId') + '|appUserRole=' + JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId, { headers: newHeader });
  }

  BindWarehouse(formName: any) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(this.configService.apiUrl + '/values/GetDropDownlist/?UiParam=uspBindWarehouse|appUserId=' + sessionStorage.getItem('userId') + '|districtId=' + sessionStorage.getItem('District') + '|appUserRole=' + JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId, { headers: newHeader });

  }

  BindIssueType(formName: any) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(this.configService.apiUrl + '/values/GetDropDownlist/?UiParam=uspBindIssueType|appUserId=' + sessionStorage.getItem('userId') + '|appUserRole=' + JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId, { headers: newHeader });

  }

  getReceiptNotePageLoadDrp(formName: any, spName: any) {
    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(this.configService.apiUrl + '/values/GetDropDownlist/?UiParam=' + spName, { headers: newHeader });
  }

  getDetailsViewForm(formName: any, proc: string) {
    const headerSettings: { [name: string]: string | string[]; } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(this.configService.apiUrl + '/values/GetDataSet/?UiParam=' + proc + '|appUserId=' + sessionStorage.getItem('userId') + '|appUserRole=' + JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId, { headers: newHeader });

  }


  SubmitSwipeInSwaipeOut(spname: string, paramsparameter: string, formName: any) {
    const headerSettings: { [name: string]: string | string[]; } = {};
    headerSettings['dataType'] = 'json';
    //  headerSettings['No-Auth'] = 'True' ;
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';

    let roleList = JSON.parse(sessionStorage.getItem('userRole') || '{}');
    var flag = 0;

    roleList.Roles.forEach((element: any) => {
      if (element.roleId == '16')
        flag = 1;
    });
    if (flag == 1) {

      headerSettings['CurrentRole'] = '16';
    } else {

      headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    }

    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    let data = JSON.stringify(spname + "|" + paramsparameter);
    return this.http.post(this.configService.apiUrl + '/values/PostReturnOutParameterDeserializeMultiTable', data, { headers: newHeader });
  }

  SubmitPostTypeNotification(spname: string, paramsparameter: string, formName: any) {
    const headerSettings: { [name: string]: string | string[]; } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] = 'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    headerSettings['Activity'] = formName;
    const newHeader = new HttpHeaders(headerSettings);
    let data = JSON.stringify(spname + "|" + paramsparameter);
    // console.log("jlkj=====",this.configService.apiUrl + '/values/PostReturnOutParameterDeserializeMultiTableNotification', data);
    return this.http.post(this.configService.apiUrl + '/values/PostReturnOutParameterDeserializeMultiTable', data, { headers: newHeader });
  }

  getDataFromServer(procWithParameter: string) {

    const headerSettings: { [name: string]: string | string[] } = {};
    headerSettings['dataType'] = 'json';
    headerSettings['Authorization'] =
      'Bearer ' + sessionStorage.getItem('userToken');
    headerSettings['Content-Type'] = 'application/json';
    headerSettings['CurrentRole'] = JSON.parse(
      sessionStorage.getItem('currentRole') || '{}'
    ).roleId;
    headerSettings['Activity'] = 'change';
    const newHeader = new HttpHeaders(headerSettings);
    return this.http.get(
      this.configService.apiUrl + '/values/GetDataSet/?UiParam=' + procWithParameter,
      { headers: newHeader }
    );
  }




}
