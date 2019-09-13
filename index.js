import React from 'react';
import ReactDOM from 'react-dom';


import {ReportSelection} from './components/app';
import {TreeComponent} from './lib/ous'
//import api from './dhis2API';

//import {TreeComponent} from 'dhis2ou'
import api from 'dhis2api';

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

     
    var dsService = new api.dataStoreService('XLReport_Metadata');
    var ouService = new api.organisationUnitService();
    var peService = new api.periodService();
    
    var Preports = dsService.getAllKeyValues();
    var PouGroups = ouService.getOUGroups("id,name");

    Promise.all([Preports,PouGroups]).then(function(values){
        
        ReactDOM.render(<ReportSelection data ={
            {
                reports : values[0],
                ouGroups : values[1].organisationUnitGroups
            }
        }  services = {
            {
                peService : peService,
                ouSelectCallback :select

            }
        }/>, document.getElementById('form'));

    }).catch(reason => {
        // TODO
        ReactDOM.render(<div>No reports exist.</div>,document.getElementById('form'))
    });

}

