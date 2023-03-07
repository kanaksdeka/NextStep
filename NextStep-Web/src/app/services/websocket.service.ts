import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    domain = document.getElementsByTagName('base')[0].href.split('//');
    baseUrl = this.domain[0] + '//api.' + this.domain[1];
    socket = io(this.baseUrl);
    //socket = io('https://api.trueleap.io/');
    //socket = io('https://35.164.171.15:9001');
    //socket = io('https://35.164.171.15:4000');
    //socket = io('https://35.164.171.15:4000/chat');

    //socket2 = io('https://35.164.171.15:4000');

    public delimiter = '#@#';

    private _classChat = [];
    private _attendance;
    private _classNotification = [];
    private _attendanceData = {};
    private _screenData;

    private _eventNames = {
        classChat: 'class-chat-event',
        attendance: 'class-attendance-event',
        notification: 'school-notification-event',
        attendanceData: 'school-attendance-response-event',
        screenEvent: 'screen-event'
    }

    constructor() {
        this.init();
    }

    init() {
        this.listen(this._eventNames.classChat).subscribe(
            (data) => {
                this._classChat.push(data);
            }
        )

        this.listen(this._eventNames.attendance).subscribe(
            (data) => {
                this._attendance = data;
            }
        )

        this.listen('school-notification-event').subscribe(
            (data) => {
                this._classNotification.push(data);
            }
        )

        this.listen(this._eventNames.attendanceData).subscribe(
            (data) => {
                this._attendanceData = data;
            }
        )

        this.listen(this._eventNames.screenEvent).subscribe(
            (data) => {
                this._screenData = data;
            }
        )

        /*
        this.listen2('subscribe').subscribe(
            (data) => {
                console.log('Socket message: ', data);
            }
        )
        */
    }

    listen(eventName: string) {
        return new Observable((subscriber) => {
            this.socket.on(eventName, (data) => {
                subscriber.next(data);
            })
        })
    }

    /*
    listen2(eventName: string) {
        return new Observable((subscriber) => {
            this.socket2.on(eventName, (data) => {
                subscriber.next(data);
            })
        })
    }
    */

    private emit(data, eventName: string) {
        //this.socket.emit(eventName, code + this.delimiter 
        //+ name + this.delimiter + message);
        // let data = '';
        // data += 'class:' + 'TestClass1' + '#@#';
        // data += 'subject:' + 'TestSub1' + '#@#';
        // data += 'section:' + 'TestSection1' + '#@#';
        // data += 'semester:' + 'TestSemester1' + '#@#';
        // data += 'period:' + 'TestPeriod1' + '#@#';
        // data += 'user:' + 'TestUser1' + '#@#';
        // data += 'chatText:' + message;

        this.socket.emit(eventName, data);
    }

    /*
    public emit2() {
        this.socket2.emit('disconnect', 'Hi Test');
    }
    */

    public sendChatMessage(data) {
        //TODO change hardcoded code value and name
        this.emit(data, this._eventNames.classChat);
    }

    public startAttendance(data) {
        //TODO change hardcoded code value and name
        //this.emit('Class1SecB', '', 'Y', this._eventNames.attendance);
        this.emit(data, this._eventNames.attendance);
    }

    public stopAttendance(data) {
        //TODO change hardcoded code value and name
        this.emit(data, this._eventNames.attendance);
    }

    public sendResponseAttendance(data) {
        //TODO change hardcoded code value and name
        this.emit(data, this._eventNames.attendanceData);
    }

    public setScreenData(data) {
        //TODO change hardcoded code value and name
        this.emit(data, this._eventNames.screenEvent);
    }

    public getAttendance() {
        return this._attendance;
    }

    public getClassChat() {
        return this._classChat
    }

    public getClassNotification() {
        return this._classNotification;
    }

    public getResponseAttendance() {
        //TODO change hardcoded code value and name
        return this._attendanceData;
    }

    public getScreenData() {
        return this._screenData;
    }

}