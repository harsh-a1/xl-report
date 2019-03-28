import React from 'react';
import ReactDOM from 'react-dom';

import {ApprovalI} from './components/ApprovalI';
import {TreeComponent} from './lib/ous'
import api from './dhis2API';
import constants from './constants'

window.onload = function(){
/* Menu Bar */
    try {
        if ('Dhis2HeaderBar' in window) {
            Dhis2HeaderBar.initHeaderBar(document.querySelector('#header'), '../../../api', { noLoadingIndicator: true });
        }
    } catch (e) {
        if ('console' in window) {
            console.error(e);
        }
    }
    
/********/


    var select = {}
    select.selected = function(callback){
        debugger
    }
      
    ReactDOM.render(<TreeComponent  onSelectCallback={select}/>, document.getElementById('treeComponent'));


    var apiWrapper = new api.wrapper();
    
    var Pprogram = apiWrapper.getObj(`programs\\${constants.program_doc_diary}?fields=id,name,programStages[id,name,programStageDataElements[id,name,sortOrder,dataElement[id,name,displayName,shortname,optionSet[id,name,code,options[id,name,code]]]]]`)
    var Pme = apiWrapper.getObj(`me.json?fields=id,name,displayName,organisationUnits[id,name],userGroups[id,name,code]`);
    
    
    Promise.all([Pprogram,Pme]).then(function(values){
        
        ReactDOM.render(<ApprovalI data ={
            {
                program : values[0],
                user : values[1]
            }
        }  services = {
            {
                ouSelectCallback :select

            }
        }/>, document.getElementById('form'));

    }).catch(reason => {
//        console.log(reason);
        // TODO
        ReactDOM.render(<div>No reports exist.</div>,document.getElementById('form'))
    });

}

