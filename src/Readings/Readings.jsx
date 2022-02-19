import React, {useState, useEffect, forwardRef} from 'react';
import { useHistory} from "react-router-dom";
import { useSelector, useDispatch} from 'react-redux';
import axios from 'axios';
import dateFormat from 'dateformat';
import useInterval from '../useInterval';
import './Readings.css';
import '../index.css';
import SettingsButton from '../Settings/SettingsButton';
import { fetchData } from '..';


const BACKGROUNDCOLOR = 'rgba(24, 98, 24, 0.5)';
const ERRORBACKGROUNDCOLOR = 'darkred';


 const Readings = forwardRef((props, ref) => {
    const [nextCountDown, setNextCountDown] = useState(0);
    const [previousCountUp, setPreviousCountUp] = useState(0);
    const [sensorColor, setSensorColor] = useState(BACKGROUNDCOLOR);
    const [maxError, setMaxError] = useState(2);
    const [ERROR_LIST, setERROR_LIST] = useState(['SERVER DISCONNECTED']);
    const DATA = useSelector(root => root.data);
    const SERVER_URL = useSelector(root => root.serverURL);
    const convertToFahrenheit = useSelector(root => root.convertToFahrenheit);
    const dispatch = useDispatch();
    const routeHistory = useHistory();
    
    const showDetails = () => (props.hideDetails && maxError == 0) ? false : true;

    const getDefaultBackgroundColor = () => showDetails() ? 'rgba(24, 98, 24, 0.85)' : 'rgba(24, 98, 24, 0.3)';

    const getTemperaturePercent = (current = DATA.operatingTemperature, goal = DATA.goalTemperature, min = DATA.minimumTemperature, max = DATA.maximumTemperature) => (current >= max) ? 2 + ((current-max) * (1/(max-min))) : (current <= min) ? ((current-min) * (1/(max-min))) : 1 - ((goal-current) * (1/(max-min))); 

    const getHumidityPercent = (current = DATA.operatingHumidity, goal = DATA.goalHumidity, min = DATA.minimumHumidity, max = DATA.maximumHumidity) => (current >= max) ? 2 + ((current-max) * (1/(max-min))) : (current <= min) ? ((current-min) * (1/(max-min))) : 1 - ((goal-current) * (1/(max-min))); 

//Evaluate Current Errors //Error 0, 1, 2
    useEffect(()=>{let max = 0; let list = [];
        if(DATA.sensorErrorCode == undefined) {max = 2; list.push('SERVER DISCONNECTED');}
        else {
            if(DATA.sensorErrorCode) {max = Math.max(max, DATA.sensorErrorCode); list.push('SENSOR ERROR');}
            if(DATA.maximumTemperatureErrorCode) {max = Math.max(max, DATA.maximumTemperatureErrorCode); list.push('MAXIMUM TEMPERATURE');}
            if(DATA.minimumTemperatureErrorCode) {max = Math.max(max, DATA.minimumTemperatureErrorCode); list.push('MINIMUM TEMPERATURE');}
            if(DATA.maximumHumidityErrorCode) {max = Math.max(max, DATA.maximumHumidityErrorCode); list.push('MAXIMUM HUMIDITY');}
            if(DATA.minimumHumidityErrorCode) {max = Math.max(max, DATA.minimumHumidityErrorCode); list.push('MINIMUM HUMIDITY');}
            if((DATA.accessDatabase != undefined && !DATA.accessDatabase)) {max = Math.max(max, 1); list.push('DATABASE BLOCKED');}
        } setMaxError(max); setERROR_LIST(list);
    },[DATA]);

    useInterval(()=>{setNextCountDown(DATA.timeNextEvaluation - new Date().getTime()); setPreviousCountUp(new Date().getTime() - DATA.timeLastReading)
                    setSensorColor(previous => (maxError == 1 || previous == 'whitesmoke') ? ERRORBACKGROUNDCOLOR : (maxError > 1) ? 'whitesmoke' : getDefaultBackgroundColor()); 
    }, 1000);

    const formatTemperature = (temp) => (Math.round((convertToFahrenheit ? ((temp*(9/5)+32)) : temp) * 100) / 100);


    const getSensor = () => (DATA.operatingTemperature && !showDetails()) ? <div className='none no-size'></div>
        : <div id='condition-details' className='none readings-box-outer' style={{}}>
            <div className='readings-box-inner' style={{backgroundColor: sensorColor}}>
                <div className=' readings-value-box' >
                    <strong className=' ' style={{gridRow: 1, gridColumn: 1, fontSize: '4.0rem', fontFamily: `'New Tegomin', serif`}} >
                        {(maxError || !DATA.operatingTemperature)  ? 'SYSTEM ERROR' : ''}
                    </strong>
                    {(DATA.statusMessage && DATA.statusMessage.length) ?  <div style={{display: 'inline-grid', gridRow: 2, gridColumn: 1,}}>
                    {DATA.statusMessage.match(/[^\r\n]+/g).reverse().map((m, i)=>
                            <p key={`statusMessage-${i}`} className=' ' style={{gridRow: (i+1), gridColumn: 1, overflowX: 'auto', fontSize: '1.4rem', fontFamily: `'New Tegomin', serif`, margin: 0}} >{m}</p>
                        )} </div> : <div className='none no-size'></div>}
                    {ERROR_LIST.map((e,i)=><strong key={`error-${i}`} className=' ' style={{gridRow: (i+3), gridColumn: 1, overflowX: 'auto', fontSize: '1.2rem', fontFamily: `'New Tegomin', serif`, margin: 0, color: sensorColor == ERRORBACKGROUNDCOLOR ? 'white' : ERRORBACKGROUNDCOLOR}} >{e}</strong>)}
                </div>
                {(DATA.operatingTemperature) ? <section className='readings-value-box'>
                    <div id='readings-sensor-spacer-line' className='none' style={{gridRow: 1, gridColumn: '1 / span 2', width: '80%', height:'0', margin: '0.75rem auto', borderTop: '1px solid black'}}></div>
                    <p className='none readings-description' style={{gridRow: 2, gridColumn: 1,}} >Last Sensor Reading:</p>
                    <strong className='none readings-value' style={{gridRow: 2, gridColumn: 2, }} >{dateFormat(DATA.timeLastReading, 'm-d-yy HH:MM')}{previousCountUp > DATA.evaluationFrequency ? ` [${`${(previousCountUp>3600000)?`${Math.floor(previousCountUp/3600000)}:`:''}${(previousCountUp>60000)?`${Math.floor((previousCountUp%3600000)/60000)}:`:''}${((previousCountUp>60000) && (previousCountUp%60000<10000))?'0':''}${Math.floor((previousCountUp%60000)/1000)}`}]`: ''}</strong>
                    <p className='none readings-description' style={{gridRow: 3, gridColumn: 1, }} >Sensor Frequency:</p>
                    <strong className='none readings-value' style={{gridRow: 3, gridColumn: 2, }} >{DATA.evaluationFrequency/60000} minutes</strong>
                    <p className='none readings-description' style={{gridRow: 4, gridColumn: 1,  }} >Next Evaluation:</p>
                    <strong className='none readings-value' style={{gridRow: 4, gridColumn: 2, }} >{nextCountDown <= 0 ? 'Reading' : nextCountDown > 60000 ? `${Math.floor(nextCountDown/60000)}:${nextCountDown%60000<10000?'0':''}${Math.floor((nextCountDown%60000)/1000)}` : `${Math.floor(nextCountDown/1000)} seconds`}</strong>
                </section> : <div  className='none no-size'></div>}
            </div>
        </div>;

    const getTemperature = () => (DATA.operatingTemperature) ? <div id='temperature-section' className='none readings-box-outer' style={{marginLeft: align ? 'auto' : 0}}>
            <div className='readings-box-inner' style={{backgroundColor: maxError ? ERRORBACKGROUNDCOLOR : getDefaultBackgroundColor()}}>
                <section className='none readings-value-box' style={{columnGap: '0'}}>
                        <strong className='none readings-main-value' style={{}} >{formatTemperature(DATA.operatingTemperature)}</strong>
                        <p className='none ' style={{gridRow: 1, gridColumn: 2, verticalAlign: 'top', fontSize: '1.0rem'}} >{convertToFahrenheit ? <span>&#8457;</span> : <span>&#8451;</span>}</p>
                    </section>
                {!showDetails() ? <div className='none no-size'></div> 
                : <section className='readings-value-box'>
                        <p className='none readings-title' style={{}} >Temperature</p>
                        <p className='none readings-description' style={{gridRow: 2, gridColumn: 1, }} >Efficiency:</p>
                        <strong className='none readings-value' style={{gridRow: 2, gridColumn: 2, }} >{Math.floor(getTemperaturePercent()*100)}%</strong>
                        <p className='none readings-description' style={{gridRow: 3, gridColumn: 1, }} >Range:</p>
                        <strong className='none readings-value' style={{gridRow: 3, gridColumn: 2, }} >{formatTemperature(DATA.minimumTemperature)} - {formatTemperature(DATA.maximumTemperature)}{convertToFahrenheit ? <span>&#8457;</span> : <span>&#8451;</span>}</strong>
                </section> }     
            </div>     
        </div> : <div id='temperature-section' className='none no-size'></div>;


    const getHumidity = () => (DATA.operatingHumidity) ? <div id='humidity-section'  className='none readings-box-outer' style={{marginRight: align ? 'auto' : '0'}}>
            <div className='readings-box-inner' style={{backgroundColor: maxError ? ERRORBACKGROUNDCOLOR : getDefaultBackgroundColor()}}>
                <section className='none readings-value-box' style={{columnGap: '0'}}>
                    <strong className='none readings-main-value' style={{}} >{Math.round(DATA.operatingHumidity * 100) / 100}</strong>
                    <p className='none ' style={{gridRow: 1, gridColumn: 2, verticalAlign: 'top', fontSize: '1.0rem'}} >%</p>
                </section>
                {!showDetails() ? <div className='none no-size'></div> 
                : <section className='readings-value-box'>
                    <p className='none readings-title' style={{textAlign: 'center'}} >Humidity</p>
                    <p className='none readings-description' style={{gridRow: 2, gridColumn: 1, }} >Efficiency:</p>
                    <strong className='none readings-value' style={{gridRow: 2, gridColumn: 2, }} >{Math.floor(getHumidityPercent()*100)}%</strong>
                    <p className='none readings-description' style={{gridRow: 3, gridColumn: 1, }} >Range:</p>
                    <strong className='none readings-value' style={{gridRow: 3, gridColumn: 2, }} >{(DATA.minimumHumidity)} - {(DATA.maximumHumidity)}%</strong>
                </section> }
            </div> 
        </div> : <div id='humidity-section' className='none no-size'></div>;

//Detect flew-wrap and center horizontally
const [align, setAlign] = useState((window.innerWidth < 900));
useEffect(()=>{setTimeout(()=>{
    const temperatureSectionTop = document.getElementById('temperature-section').getBoundingClientRect().top;
    const humiditySectionTop = document.getElementById('humidity-section').getBoundingClientRect().top;
    if(temperatureSectionTop != undefined && temperatureSectionTop != humiditySectionTop) setAlign(true);
},500);},[]);    

const HumidityOnClick = async(password) => {const response = await fetchData(); routeHistory.push('/'); return response == true ? 'UPDATING' : response;}
const TemperatureOnClick = async(password) => {dispatch({type: 'toggleConvertToFahrenheit'}); return null;}
const sensorOnClick = async(password) => {if(DATA.sensorErrorCode == undefined) routeHistory.push('/settings'); else if(maxError) routeHistory.push('/log'); else if(showDetails()) {setTimeout(()=>fetchData(), 60000); return await axios.put(`${SERVER_URL}/evaluate/`, {PASSWORD: password}).then((response)=>'EVALUATING').catch((error)=>error.response ? error.response.status : false);} return null;}

    return (align ? <div ref={ref} id='readings-container' className='readings-align'  >
                <SettingsButton title={getSensor()}
                    condense={true}
                    buttonColor={'transparent'}
                    buttonStyle={{border: 'none', margin: '1.0rem', padding: '0', borderRadius: '0.75rem'}}
                    verifyLevel={maxError ? 0 : 1}
                    pendingText='INITIATING'
                    onUpdate = {sensorOnClick}/>
                <SettingsButton title={getTemperature()}
                    condense={true}
                    buttonColor={'transparent'}
                    buttonStyle={{border: 'none', margin: '1.0rem', padding: '0', borderRadius: '0.75rem'}}
                    verifyLevel={0}
                    onUpdate = {TemperatureOnClick}/>
                <SettingsButton title={getHumidity()}
                    condense={true}
                    buttonColor={'transparent'}
                    buttonStyle={{border: 'none', margin: '1.0rem', padding: '0', borderRadius: '0.75rem'}}
                    verifyLevel={0}
                    pendingText='RETRIEVING'
                    onUpdate={HumidityOnClick}/>
        </div> : <div ref={ref} id='readings-container' className='readings-top'  >
                <SettingsButton title={getTemperature()}
                    condense={true}
                    buttonColor={'transparent'}
                    buttonStyle={{border: 'none', margin: '1.0rem', padding: '0', borderRadius: '0.75rem'}}
                    verifyLevel={0}
                    onUpdate = {TemperatureOnClick}/>
                <SettingsButton title={getSensor()}
                    condense={true}
                    buttonColor={'transparent'}
                    buttonStyle={{border: 'none', margin: '1.0rem', padding: '0', borderRadius: '0.75rem'}}
                    verifyLevel={maxError ? 0 : 1}
                    pendingText='INITIATING'
                    onUpdate = {sensorOnClick}/>
                <SettingsButton title={getHumidity()}
                    condense={true}
                    buttonColor={'transparent'}
                    buttonStyle={{border: 'none', margin: '1.0rem', padding: '0', borderRadius: '0.75rem'}}
                    verifyLevel={0}
                    pendingText='RETRIEVING'
                    onUpdate={HumidityOnClick}/>
        </div>);
});

export default Readings;