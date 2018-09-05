import { Component,NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';

import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';

declare var ElizaBot: any;
declare var WebAvatar:any;
declare var SDKConnection:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  isListening=false;
  imageSrcPre='assets/imgs/';
  imageSrcPost='.jpg';
  imageCnt=1;
  imageCntMax=9;
  imageSrc=this.imageSrcPre+this.imageCnt+this.imageSrcPost;
  libreWebObj:any;

  constructor(
    public navCtrl: NavController,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech,
    public zone:NgZone
     ){

     //getting the libre ready
    var sdk = new SDKConnection("6406951692173129658");
    var web = new WebAvatar();
    this.libreWebObj=web;
    this.libreWebObj.connection = sdk;
    this.libreWebObj.avatar = "14876059";
    this.libreWebObj.voice = "cmu-slt";
    this.libreWebObj.voiceMod = "default";
    this.libreWebObj.width = "250";
    this.libreWebObj.createBox();
    this.libreWebObj.addMessage("", "", "", "");
    this.libreWebObj.processMessages();

    this.speechRecognition.isRecognitionAvailable()
      .then((available: boolean) => {
        if (available) {
          //alert("Has Available");
          this.speechRecognition.hasPermission()
            .then((hasPermission: boolean) => {
              if (hasPermission) {
                //alert("Has Permission");
              } else {
                //alert("Has No Permission");
                //Request permission
                this.speechRecognition.requestPermission()
                  .then(
                    () => { 
                      //alert("Permission Granted"); 
                    },
                    () => { 
                      //alert("Permission Denied"); 
                    }
                  )
              }
            });
        } else {
          //alert("Has Not Available");
        }


      });
  }

  buttonClicked = () => {
    console.log("Touch started");
    this.isListening=true;
    //Now record the voice
    let options = {
      matches:1,
      showPopup:false
    }
    
    this.speechRecognition.startListening(options)
      .subscribe(
        (result: Array<string>) => {
          console.log("Val:",this.isListening);
          this.isListening=false;
          //Changing the image
          //geting the counter
          // this.imageCnt=++this.imageCnt%this.imageCntMax;
          // if(this.imageCnt==0){
          //   ++this.imageCnt;
          // }
          // console.log("this.cnt",this.imageCnt);

          this.zone.run(() => {
            // this.imageSrc=this.imageSrcPre+this.imageCnt+this.imageSrcPost;
          });
  
          //alert(this.matches);
          var x = new ElizaBot();
          var response = x.transform(result[0]);

          this.libreWebObj.addMessage(response, "", "", "");
          this.libreWebObj.processMessages();

          // this.tts.speak(response)
          //   .then(() => console.log('Success'))
          //   .catch((reason: any) => console.log(reason));
        },
        (onerror) => {
          this.zone.run(() => {
            this.isListening=false;
          });
          console.log('error:', onerror);
        }
      )
  };

  

}
