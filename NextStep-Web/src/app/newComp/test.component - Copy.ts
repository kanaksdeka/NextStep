import { Component, OnInit, Inject, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { ZoomMtg } from '@zoomus/websdk';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

@Component({
  selector: 'test-comp',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  smallSize = true;
  bigSize = false;

   @ViewChild('myEl', { read: '', static: true }) 
   myDiv: ElementRef;

  //signatureEndpoint = 'http://localhost:4000'
  //signatureEndpoint = 'https://35.164.171.15:9001/class/zoom/signature'
  signatureEndpoint = '/class/zoom/signature'
  apiKey = '4QeYXqSARl6a1joypX8L-w'
  meetingNumber = '2279546871'
  role = '0'
  leaveUrl = 'http://localhost:4200/test'
  userName = 'Kanak test 1'
  userEmail = 'kanakd2013@gmail.com'
  passWord = '123455'
  signature = ''

  url: SafeResourceUrl;

  inputUrl;
  inputToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vd3d3LnRydWVsZWFwLmlvLyIsInN1YiI6InRlYWNoZXIxMDFAdHJ1ZWxlYXAuY29tIiwic2NvcGUiOiJzZWxmIiwianRpIjoiMjA1YjU4MzAtMTIzOS00ZjNjLTk0N2ItMGY0YTc5ZWEwNGU4IiwiaWF0IjoxNjA5NjkxNDIwLCJleHAiOjE2MDk2OTUwMjB9.ZhIX-J8TqN1-_nXydoJNsOrrfwpSxuL5-SwrVU-iAjw';

  tmpArgs = {
    apiKey: this.apiKey,
    mn: this.meetingNumber,
    name: 'Kanak',
    pwd: this.passWord,
    role: this.role,
    email: '',
    lang: 'en-US',
    signature: 'NFFlWVhxU0FSbDZhMWpveXBYOEwtdy4yMjc5NTQ2ODcxLjE2MjUzMzExNjUzMDYuMC5hR0hnOUgrK0FNUGoxZHdobmowb2N2R2E2U3NJdHdnUUxNNys5WXMzN3o0PQ',
    china: '0',
    version: '1'
  }

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) document, private sanitizer: DomSanitizer, private renderer: Renderer2) {

  }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://zoom.us/j/9278862669');

    ZoomMtg.generateSignature({
      meetingNumber: this.meetingNumber,
      apiKey: this.apiKey,
      apiSecret: "p6ZYS5YZBvnBuSl4hwghPvUCpyxfOefA3IwY",
      role: this.role,
      success: (res) => {
        console.log("kanak 1: " + res.result);
        //this.startMeeting(res.signature)
        this.signature = res.result;
      },
    });
  }

  getSignature() {

    if(this.inputUrl) {
      this.signatureEndpoint = this.inputUrl;
    }

    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          //'authorization': this.inputToken
      })
    };

    /*
    this.httpClient.post(this.signatureEndpoint, {
	    meetingNumber: this.meetingNumber,
	    role: this.role
    }, httpOptions).toPromise().then((data: any) => {
      if(data.signature) {
        console.log(data.signature)
        this.startMeeting(data.signature)
        //this.beginJoin(data.signature)
      } else {
        console.log(data)
      }
    }).catch((error) => {
      console.log(error)
    })
    */
    ///////////////////
    /*
    ZoomMtg.generateSignature({
      meetingNumber: this.meetingNumber,
      apiKey: this.apiKey,
      apiSecret: "p6ZYS5YZBvnBuSl4hwghPvUCpyxfOefA3IwY",
      role: this.role,
      success: function (res) {
        console.log("kanak 1: " + res.result);
        this.startMeeting(res.signature)
      },
    });
    */
    console.log("kanak 1: " + this.signature);
    this.startMeeting(this.signature)
    //this.beginJoin(this.signature);
    ///////////////////
  }

  startMeeting(signature) {
    let window = document.getElementById('zmmtg-root');
    window.style.display = 'block';
    window.style.position = 'relative'
    //window.style.width = '50%'

    //this.myDiv.nativeElement.previousSibling = window;
    this.renderer.appendChild(this.myDiv.nativeElement, window);

    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      isSupportAV: true,
      success: (success) => {
        console.log(success)

        ZoomMtg.join({
          signature: signature,
          meetingNumber: this.meetingNumber,
          userName: this.userName,
          apiKey: this.apiKey,
          userEmail: this.userEmail,
          passWord: this.passWord,
          success: (success) => {
            console.log(success)
          },
          error: (error) => {
            console.log(error)
          }
        })

      },
      error: (error) => {
        console.log(error)
      }
    })
  }


  meetingConfig = {
    apiKey: this.tmpArgs.apiKey,
    meetingNumber: this.tmpArgs.mn,
    userName: (() => {
      if (this.tmpArgs.name) {
        try {
          return this.tmpArgs.name; //testTool.b64DecodeUnicode(this.tmpArgs.name);
        } catch (e) {
          return this.tmpArgs.name;
        }
      }
      return (
        "CDN#" +
        this.tmpArgs.version +
        "#" +
        //testTool.detectOS() +
        "#" +
        //testTool.getBrowserInfo()
        ""
      );
    })(),
    passWord: this.tmpArgs.pwd,
    leaveUrl: this.leaveUrl,  //"/index.html",
    role: parseInt(this.tmpArgs.role, 10),
    userEmail: ( () => {
      try {
        return this.tmpArgs.email; //testTool.b64DecodeUnicode(this.tmpArgs.email);
      } catch (e) {
        return this.tmpArgs.email;
      }
    })(),
    lang: this.tmpArgs.lang,
    signature: this.tmpArgs.signature || "",
    china: this.tmpArgs.china === "1",
  };

  beginJoin(signature) {
    ZoomMtg.init({
      leaveUrl: this.meetingConfig.leaveUrl,
      disableCORP: false, //!window.crossOriginIsolated, // default true
      // disablePreview: false, // default false
      success: () => {
        console.log(this.meetingConfig);
        console.log("signature", signature);
        ZoomMtg.i18n.load(this.meetingConfig.lang);
        ZoomMtg.i18n.reload(this.meetingConfig.lang);
        ZoomMtg.join({
          meetingNumber: this.meetingConfig.meetingNumber,
          userName: this.meetingConfig.userName,
          signature: signature,
          apiKey: this.meetingConfig.apiKey,
          userEmail: this.meetingConfig.userEmail,
          passWord: this.meetingConfig.passWord,
          success: function (res) {
            console.log("join meeting success");
            console.log("get attendeelist");
            ZoomMtg.getAttendeeslist({});
            ZoomMtg.getCurrentUser({
              success: function (res) {
                console.log("success getCurrentUser", res.result.currentUser);
              },
            });
          },
          error: function (res) {
            console.log(res);
          },
        });
      },
      error: function (res) {
        console.log("Kanak error", res);
      },
    });
  
    ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
      console.log('inMeetingServiceListener onUserJoin', data);
    });
  
    ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
      console.log('inMeetingServiceListener onUserLeave', data);
    });
  
    ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
      console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
    });
  
    ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
      console.log('inMeetingServiceListener onMeetingStatus', data);
    });
    
  }

  setSmallSize() {
    this.smallSize = true;
    this.bigSize = false;
  }

  setBigSize() {
    this.bigSize = true;
    this.smallSize = false;
  }
}
