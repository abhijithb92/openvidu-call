import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { ApiService } from '../../services/api.service';
import { OvSettings } from '../../models/ov-settings';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';

declare var require: any
const FileSaver = require('file-saver');

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})

export class ToolbarComponent implements OnInit {

  private record;
    //Will use this flag for detect recording
    private recording = false;
    //Url of Blob
    private url;
    private error;
  fullscreenIcon = 'fullscreen';

  @Input() lightTheme: boolean;
  @Input() mySessionId: boolean;
  @Input() localUser: UserModel;
  @Input() compact: boolean;
  @Input() showNotification: boolean;
  @Input() newMessagesNum: number;
  @Input() ovSettings: OvSettings;

  @Output() micButtonClicked = new EventEmitter<any>();
  @Output() camButtonClicked = new EventEmitter<any>();
  @Output() screenShareClicked = new EventEmitter<any>();
  @Output() exitButtonClicked = new EventEmitter<any>();
  @Output() chatButtonClicked = new EventEmitter<any>();
  @Output() stopScreenSharingClicked = new EventEmitter<any>();

  constructor(private apiSrv: ApiService, private domSanitizer: DomSanitizer) {}

  sanitize(url:string){
        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    const maxHeight = window.screen.height;
    const maxWidth = window.screen.width;
    const curHeight = window.innerHeight;
    const curWidth = window.innerWidth;
    if (maxWidth !== curWidth && maxHeight !== curHeight) {
      this.fullscreenIcon = 'fullscreen';
    }
  }

  ngOnInit() {}

  micStatusChanged() {
    this.micButtonClicked.emit();
  }

  camStatusChanged() {
    this.camButtonClicked.emit();
  }

  screenShare() {
    this.screenShareClicked.emit();
  }

  stopScreenSharing() {
    this.stopScreenSharingClicked.emit();
  }

  exitSession() {
    this.exitButtonClicked.emit();
  }

  toggleChat() {
    this.chatButtonClicked.emit();
  }

  toggleFullscreen() {
    const state = this.apiSrv.toggleFullscreen('videoRoomNavBar');
    if (state === 'fullscreen') {
      this.fullscreenIcon = 'fullscreen_exit';
    } else {
      this.fullscreenIcon = 'fullscreen';
    }
  }
  initiateRecording() {
        
        this.recording = true;
        let mediaConstraints = {
            video: false,
            audio: true
        };
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then(this.successCallback.bind(this), this.errorCallback.bind(this));
    }
    /**
     * Will be called automatically.
     */
    successCallback(stream) {
        var options = {
            mimeType: "audio/wav",
            numberOfAudioChannels: 2
        };
        //Start Actuall Recording
        var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
        this.record = new StereoAudioRecorder(stream, options);
        this.record.record();
    }
    /**
     * Stop recording.
     */
    stopRecording() {
        this.recording = false;
        this.record.stop(this.processRecording.bind(this));
    }
    /**
     * processRecording Do what ever you want with blob
     * @param  {any} blob Blog
     */
    processRecording(blob) {
        this.url = URL.createObjectURL(blob);
        FileSaver.saveAs(this.url)
    }
    /**
     * Process Error.
     */
    errorCallback(error) {
        this.error = 'Can not play audio in your browser';
    }
}


