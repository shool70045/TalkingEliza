import { Component,NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { HTTP } from '@ionic-native/http';

import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';

declare var ElizaBot: any;
// declare var WebAvatar:any;
// declare var SDKConnection:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  matches: any;
  isListening=false;
  imageSrcPre='assets/imgs/';
  imageSrcPost='.jpg';
  imageCnt=1;
  imageCntMax=9;
  imageSrc=this.imageSrcPre+this.imageCnt+this.imageSrcPost;
  

  ENDPOINT_CHAT_MITSUKU = 'https://kakko.pandorabots.com/pandora/talk?botid=87437a824e345a0d&skin=chat';
    MESSAGE_REGEX = /(Mitsuku -(.*))/;
    MESSAGE_REJECT_REGEX = /(x(.*)x[^\s]+)|(\|)|(BYESPLIT X1234)/ig;
    MESSAGE_SENDER_TAG = 'You -';
    _tag = null;
    _agent = null;
    _endpoint = null;

  constructor(
    public navCtrl: NavController,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech,
    public zone:NgZone,
    private http:HTTP
     ){

      // var sdk = new SDKConnection();
      // sdk.applicationId = "6406951692173129658";
      // var web = new WebAvatar();
      // web.connection = sdk;
      // web.avatar = "Julie3";
      // web.createBox();
      // web.message("Hi I am Eliza");
      // web.processMessages();

      this._tag = 'Anonymous';
    this._agent = this.http;
    this._endpoint = this.ENDPOINT_CHAT_MITSUKU;

      //Trying mitzuku
      this.send("Hey").then(function(response){
        console.log("Mitzuku said",response);
      });

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
          this.imageCnt=++this.imageCnt%this.imageCntMax;
          if(this.imageCnt==0){
            ++this.imageCnt;
          }
          console.log("this.cnt",this.imageCnt);

          this.zone.run(() => {
            this.imageSrc=this.imageSrcPre+this.imageCnt+this.imageSrcPost;
          });
          

          this.matches = result;


          


          //alert(this.matches);
          var x = new ElizaBot();
          var response = x.transform(this.matches[0]);


          this.tts.speak(response)
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));
        },
        (onerror) => {
          this.zone.run(() => {
            this.isListening=false;
          });
          console.log('error:', onerror);
        }
      )
  };

  getRawHtmlForMessage = (mitsuku, message) => {
    return new Promise(function (resolve, reject) {
        if (!mitsuku) {
            return reject(new Error('Mitsuku cannot be null'));
        }
        if (!message) {
            return reject(new Error('Message cannot be null or empty'));
        }

        var agent = mitsuku._agent,
            endpoint = mitsuku._endpoint,
            req;
        
        agent.post(endpoint,{ message: message },{'Content-Type': 'application/x-www-form-urlencoded'})
          .then(function(data){
            console.log("Data",data);
            resolve(data.text);
          });

        // req = agent.post(endpoint);
        // agent.attachCookies(req);
        // req.set('Content-Type', 'application/x-www-form-urlencoded')
        //     .send({ message: message })
        //     .end(function (err, res) {
        //         if (err) {
        //             return reject(err);
        //         }
        //         agent.saveCookies(res);
        //         resolve(res.text);
        //     });
    });
}

parseMessageFromHtml = (html) => {
    var conv = cheerio.load(html)('body')
        .find('p')
        .text()
        .trim();

    var match = this.MESSAGE_REGEX.exec(conv),
        message,
        prevMessageStart;

    if (match && match.length > 0) {
        message = match[match.length - 1];
        prevMessageStart = message.indexOf(this.MESSAGE_SENDER_TAG);
        if (prevMessageStart != -1) {
            message = message.substr(0, prevMessageStart);
        }
        return message.replace(this.MESSAGE_REJECT_REGEX, '').trim();
    } else {
        throw new Error("Could not parse Mitsuku response");
    }
}


    send = (message) => {
      return this.getRawHtmlForMessage(this, message)
          .then(this.parseMessageFromHtml)
  };

  
  getTag = () => {
      return '' + this._tag;
  };

  
  toString = () => {
      return this.getTag();
  };

}
