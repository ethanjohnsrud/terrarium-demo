import React, {useState,  useEffect} from 'react';
import { useSelector} from 'react-redux';
import axios from 'axios';
import dateFormat from 'dateformat';
import SettingsButton from '../SettingsButton';

import '../../index.css';
import '../Settings.css';

//MOCK DATA
import LOG_TEXT from './../../Assets-Mock-Data/log.txt';


const LogView = (props) => {
    const SERVER_URL = useSelector(root => root.serverURL);
    const [current, setCurrent] = useState('');
    const [fileName, setFileName] = useState('log.txt');
    const [dateDifference, setDateDifference] = useState(0);

    const updateLog = async () => fetch(LOG_TEXT)
        .then(response=>response.text())
        .then((response)=>{setCurrent(response); })
        .catch((error)=>error.response ? error.response.status : false);
    useEffect(()=>updateLog(),[]);

    
    return(<div id='sensor-test-container' >
        <SettingsButton title='UPDATE' pendingText='RETRIEVING'
            condense={true}
            verifyLevel={0}
            onUpdate={async(password)=>'LOADING'}
            />
        <strong className='settings-value-title' style={{marginTop: '1.5rem'}}>File: {fileName}</strong>
    <div className='sensor-test-results'>
    {current.split(/(?=\[\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{1,2}:\d{1,2}])/g).map(entry=>entry.split(/\n/g).map((p, i)=>{        
        const time = /(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])-([0-9]{4}) ([0-2]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])/.exec(p);
        if(time) { if(dateDifference==0) setDateDifference(new Date().setHours(time[4], time[5], time[6]) - new Date(time[3], parseInt(time[1])-1, time[2], time[4], time[5], time[6]).getTime());
            const updatedText = p.replace(time[0], dateFormat(new Date(time[3], parseInt(time[1])-1, time[2], time[4], time[5], time[6]).getTime()+dateDifference, 'm-d-yyyy H:MM:ss'));
                return <p key={i} style={{color:(/error|fail/i.test(updatedText)) ? 'red' : (/\[\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{1,2}:\d{1,2}]/.test(updatedText)) ? (/severe|high|low/i.test(updatedText)) ? 'orangered' : (/restart/i.test(updatedText)) ? 'goldenrod' : 'whitesmoke' : null}}>{updatedText}</p> ;
        } else
            return <p key={i}  style={{color:(/error|fail/i.test(p)) ? 'red' : (/\[\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{1,2}:\d{1,2}]/.test(p)) ? (/severe|high|low/i.test(p)) ? 'orangered' : (/restart/i.test(p)) ? 'goldenrod' : 'whitesmoke' : null}}>{p}</p>                
    })).reverse()}    </div>
    {(fileName == undefined) ?  <div className='none no-size' style={{position:'absolute'}}></div> 
    : <SettingsButton title='PREVIOUS LOG' pendingText='SEARCHING'
            condense={true}
            verifyLevel={0}
            onUpdate={async(password)=>await axios.put(`${SERVER_URL}/log/`, {fileName: fileName})
                .then((response)=>{ setFileName(response.headers['content-name']); setCurrent(response.data); return 'LOADING';})
                .catch((error)=>error.response ? error.response.status : false)}
            />}
    </div>);
}
export default LogView;