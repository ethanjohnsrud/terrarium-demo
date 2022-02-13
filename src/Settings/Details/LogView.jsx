import React, {useState,  useEffect} from 'react';
import { useSelector} from 'react-redux';
import axios from 'axios';
import SettingsButton from '../SettingsButton';


import '../../index.css';
import '../Settings.css';


const LogView = (props) => {
    const SERVER_URL = useSelector(root => root.serverURL);
    const [current, setCurrent] = useState('');
    const [fileName, setFileName] = useState('');

    const updateLog = async () => await axios.put(`${SERVER_URL}/log/`)
        .then((response)=>{console.log(response); setCurrent(response.data); setFileName(response.headers['content-name']); return 'LOADING';})
        .catch((error)=>error.response ? error.response.status : false);
    useEffect(()=>updateLog(),[]);

    
    return(<div id='sensor-test-container' >
        <SettingsButton title='UPDATE' pendingText='RETRIEVING'
            condense={true}
            verifyLevel={0}
            onUpdate={async(password)=>await updateLog()}
            />
        <strong className='settings-value-title' style={{marginTop: '1.5rem'}}>File: {fileName}</strong>
    <div className='sensor-test-results'>
    {current.split(/(?=\[\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{1,2}:\d{1,2}])/g).reverse().map(entry=>entry.split(/\n/g).map(p=><p style={{color:(/error|fail/i.test(p)) ? 'red' : (/\[\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{1,2}:\d{1,2}]/.test(p)) ? (/severe|high|low/i.test(p)) ? 'orangered' : (/restart/i.test(p)) ? 'goldenrod' : 'whitesmoke' : null}}>{p}</p>))}    </div>
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