import { Component, OnInit } from '@angular/core';
import { eventNames, listenerCount } from 'process';
import { Observable, Subscriber } from 'rxjs';
import * as io from 'socket.io-client';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
    selector: 'test-chat',
    templateUrl: './chat.test.component.html'
})
export class ChatTestComponent{

    inputMsg;

    constructor(private websocketService: WebSocketService) {}

    sendMessage() {
        let data = '';
        data += 'class:Grade V#@#';
        data += 'subject:Mathematics#@#';
        data += 'section:Section#@#';
        data += 'semester:Semester 1#@#';
        data += 'period:8asdasdas2323232#@#';
        data += 'user:Satyajit#@#';
        data += 'chatText:' + this.inputMsg;
        this.websocketService.sendChatMessage(data);
    }

    sendMessageRaiseHand() {
        let data = '';
        data += 'class:Grade V#@#';
        data += 'subject:Mathematics#@#';
        data += 'section:Section#@#';
        data += 'semester:Semester 1#@#';
        data += 'period:8asdasdas2323232#@#';
        data += 'user:Satyajit#@#';
        data += 'chatText:' + '$RH;';
        this.websocketService.sendChatMessage(data);
    }

    getMessage() {
        return this.websocketService.getClassChat();
    }

    startAttendance() {
        let data = '';
        data += 'class:Grade V#@#';
        data += 'subject:Mathematics#@#';
        data += 'section:Section#@#';
        data += 'semester:Semester 1#@#';
        data += 'period:8asdasdas2323232#@#';
        data += 'user:Satyajit#@#';
        data += 'attendanceStatus:Y';
        this.websocketService.startAttendance(data);
    }

    stopAttendance() {
        let data = '';
        data += 'class:Grade V#@#';
        data += 'subject:Mathematics#@#';
        data += 'section:Section#@#';
        data += 'semester:Semester 1#@#';
        data += 'period:8asdasdas2323232#@#';
        data += 'user:Satyajit#@#';
        data += 'attendanceStatus:N';
        this.websocketService.stopAttendance(data);
    }

    getAttendance() {
        let msg = this.websocketService.getAttendance();
        if(msg && msg.substring(msg.indexOf('attendanceStatus') >= 0)) {
            msg = msg.substring(msg.lastIndexOf('attendanceStatus') + 'attendanceStatus'.length + 1)
        }
        if ('Y' === msg) {
            return 'Started';
        }
        else {
            return 'Stop'
        }
    }
}