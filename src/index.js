import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import{Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import defaultImage from './Background/terrarium-buddies.jpg';
//MOCK DATA
import DATA from './Assets-Mock-Data/data.json';



//Action Creators (manipulate State) => Doing in Component | Traditional Method is to predefine here and import into component, just to send back to reducer

//Single State with one Reducer | Could all be separate with separate reducers and combine with: 'combineReducers'

//Reducers : Perform state Update
const setServerURLReducer = (state = process.env.REACT_APP_SERVER_URL || '', action) => {
  if(action.type == 'setServerURL')  return action.payload;
  else return state;
}

const initialImage = {
  IMAGE_INTERVAL: 6000,
  TRANSITION_INTERVAL: 1000,
  SCREENSAVER_INACTIVE_TIME: 60000,
  location: defaultImage,
  isVisible: false,  // https://stackoverflow.com/questions/40064249/react-animate-mount-and-unmount-of-a-single-component
}
const setImageReducer = (state = initialImage, action) => {
  if(action.type == 'setImage') { return {...state, location: action.payload, isVisible: true};}
  else if(action.type == 'setImageVisible') return {...state, isVisible: true};
  else if(action.type == 'setImageInvisible') return {...state, isVisible: false};
  else return state;
}
const screenSaverActiveReducer = (state = true, action) => { //Image Opacity on/off -> transition css
  if(action.type == 'activateScreenSaver')  return true; 
  else if(action.type == 'deactivateScreenSaver')  return false;
  else return state;
}
const initialScreenSaverBrightness = {
  settingOptions: ['Default', 'Scheduled', 'Black', 'Disabled'],
  setting: 'Default',
  dayOpacity: 1.00,
  dayHourStart: 7,
  nightOpacity: 0.35,
  nightHourStart: 19,
  blackHourStart: 21,
}
const ScreenSaverBrightnessReducer = (state = initialScreenSaverBrightness, action) => {
  switch(action.type) {
    case 'setting':
      if(state.settingOptions.includes(action.payload)) return {...state, setting: action.payload};
      else return state;
    case 'dayOpacity':
      return {...state, setting: 'Scheduled', dayOpacity: action.payload};
    case 'dayHourStart':
      return {...state, setting: 'Scheduled', dayHourStart: action.payload};
    case 'nightOpacity':
      return {...state, setting: 'Scheduled', nightOpacity: action.payload};
    case 'nightHourStart':
      return {...state, setting: 'Scheduled', nightHourStart: action.payload};
    case 'blackHourStart':
      return {...state, setting: 'Scheduled', blackHourStart: action.payload};
    default: return state;
  }
}
const setDataReducer = (state = {}, action) => {
  if(action.type == 'setData') return {...action.payload};
  else return state;
}

const toggleConvertToFahrenheitReducer = (state = true, action) => { 
  if(action.type == 'toggleConvertToFahrenheit') return !state; 
  else return state;
}

const setDropListReducer = (state = 'OFF', action) => { 
  if(action.type == 'setDropList' && state == action.payload) return 'OFF';
  else if(action.type == 'setDropList' && action.payload == undefined) return 'OFF';  
  else if(action.type == 'setDropList') return action.payload; 
  else return state;
}

//Setup Store
const allStateDomains = combineReducers({
  serverURL: setServerURLReducer,
  image: setImageReducer,
  isScreenSaverActive: screenSaverActiveReducer, 
  screenSaverBrightness: ScreenSaverBrightnessReducer,
  data: setDataReducer,
  convertToFahrenheit: toggleConvertToFahrenheitReducer,
  dropListOpen: setDropListReducer
});

const store = createStore(allStateDomains,{});


//Fetch Image


//Fetch Data
export const fetchData = async()=> { console.log(store.getState().serverURL);
  DATA.timeLastReading = new Date().getTime()-(15*60*1000)+(45*1000);
  DATA.timeNextEvaluation = new Date().getTime()+(45*1000);
  //Controls
  DATA.CONTROLS[0]['settings'][0]['until'] = DATA.timeNextEvaluation;
  DATA.CONTROLS[1]['settings'][0]['until'] = new Date().setHours(20, 0, 0);
  DATA.CONTROLS[2]['settings'][0]['until'] = new Date().setHours(18, 0, 0);
  DATA.CONTROLS[3]['settings'][0]['until'] = DATA.timeNextEvaluation;
  DATA.CONTROLS[4]['settings'][0]['until'] = DATA.timeNextEvaluation;
  DATA.CONTROLS[6]['settings'][0]['until'] = new Date().getTime() + (73*60*1000);
  store.dispatch({type: 'setData', payload: DATA});
  return true;
}

const start = async() => {
  store.dispatch({type: 'setServerURL', payload: window.location.origin});
  fetchData();
  /*
      MOCK LOW HUMIDITY
  */
    setTimeout(()=>{ console.log('INITIATING LOW HUMIDITY ERROR');
    DATA.timeLastReading = new Date().getTime();
    DATA.timeNextEvaluation = new Date().getTime()+(15*60*1000);
      DATA.minimumHumidityErrorCode = 2;
      DATA.operatingHumidity = DATA.minimumHumidity - 3.27;
      DATA.operatingTemperature = DATA.operatingTemperature + 0.72;
      DATA.statusMessage = "Minimum Humidity Exceeded -> Responding accordingly by enabling \'Humidify\' and disabling \'Dehumidify\'\nOperating with current conditions.";
      //Controls
      DATA.CONTROLS[0]['settings'] = [
        {
            "reason": "Climate Cooling",
            "set": 0,
            "until": DATA.timeNextEvaluation
        }
    ];
    DATA.CONTROLS[1]['settings'] = [
      {
          "reason": "Daytime",
          "set": 0,
          "until": new Date().setHours(20, 0, 0) 
      }
  ];
  DATA.CONTROLS[2]['settings'] = [
  {
      "reason": "Schedule Grow\n",
      "set": 1,
      "until": new Date().setHours(18, 0, 0) 
  }
];
DATA.CONTROLS[3]['settings'] = [
    {
        "reason": "ON : Severe Low Humidity",
        "set": 1,
        "until": DATA.timeNextEvaluation
    }
];
DATA.CONTROLS[4]['settings'] = [
  {
      "reason": "OFF : Severe Low Humidity",
      "set": 0,
      "until": DATA.timeNextEvaluation
  }
];
DATA.CONTROLS[5]['settings'] = [
  {
    "reason": "Default",
    "set": 0,
      "until": -1
  }
];
DATA.CONTROLS[6]['settings'] = [
  {
    "reason": "ON : Severe Low Humidity",
    "set": 1,
      "until": DATA.timeNextEvaluation
  }
];
      store.dispatch({type: 'setData', payload: DATA});
    }, 45*1000);
}
start();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store} >
        <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



