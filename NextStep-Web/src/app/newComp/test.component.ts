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

  signatureEndpoint = 'http://localhost:4000'
  //signatureEndpoint = 'https://35.164.171.15:9001/class/zoom/signature'
  //signatureEndpoint = '/class/zoom/signature'
  apiKey = '4QeYXqSARl6a1joypX8L-w'
  meetingNumber = 2279546871
  role = 0
  leaveUrl = 'http://localhost:4200/test'
  userName = 'Kanak test 1'
  userEmail = 'kanakd2013@gmail.com'
  passWord = '123455'

  url: SafeResourceUrl;

  inputUrl;
  inputToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vd3d3LnRydWVsZWFwLmlvLyIsInN1YiI6InRlYWNoZXIxMDFAdHJ1ZWxlYXAuY29tIiwic2NvcGUiOiJzZWxmIiwianRpIjoiMjA1YjU4MzAtMTIzOS00ZjNjLTk0N2ItMGY0YTc5ZWEwNGU4IiwiaWF0IjoxNjA5NjkxNDIwLCJleHAiOjE2MDk2OTUwMjB9.ZhIX-J8TqN1-_nXydoJNsOrrfwpSxuL5-SwrVU-iAjw';

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) document, private sanitizer: DomSanitizer, private renderer: Renderer2) {

  }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://zoom.us/j/9278862669');
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

    this.httpClient.post(this.signatureEndpoint, {
	    meetingNumber: this.meetingNumber,
	    role: this.role
    }, httpOptions).toPromise().then((data: any) => {
      if(data.signature) {
        console.log(data.signature)
        this.startMeeting(data.signature)
      } else {
        console.log(data)
      }
    }).catch((error) => {
      console.log(error)
    })
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

  setSmallSize() {
    this.smallSize = true;
    this.bigSize = false;
  }

  setBigSize() {
    this.bigSize = true;
    this.smallSize = false;
  }
}
