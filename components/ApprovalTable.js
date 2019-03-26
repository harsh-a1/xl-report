import React,{propTypes} from 'react';
import reportGenerator from '../report-generator';
import api from '../lib/dhis2API';

export function ApprovalTable(props){
   
    var instance = Object.create(React.Component.prototype);
    instance.props = props;
    
    var state = {
        user : props.user,
        program : props.program,
        events : props.events,
        teiWiseAttrVals : props.teiWiseAttrVals,
        selectedSpeciality : props.selectedSpeciality
    };

    var programStageMap = state.program.programStages.reduce(function(map,obj){
        map[obj.id] = obj;
        return map;
    },[]);

    var selectedStage = programStageMap[state.selectedSpeciality];
    
    instance.render = render;
    return instance;

    
    function getHeader(){
        var list = [];
        list.push(<th key="h_eventdate">Event Date</th>);
        list.push(<th key="h_name of specilist">Name of Specialist</th>);
        list.push(<th key="h_ou">Org Unit</th>);
        
        selectedStage.
            programStageDataElements.
            reduce(function(list,obj){
                list.push(<th key={obj.id}>{obj.dataElement.name}</th>)
                return list;
            },list);

        return list;
    }

    function getRows(){
        state.events.reduce(function(list,event){

// https://devtest.hispindia.org/upupgrade/api/organisationUnits.json?filter=id:in:[frUcctRfQiB,PYat3gF9Zqv]&fields=id,name,ancestors
        },[])
        
        var list = [];
        list.push(<td key="d_eventdate">{}</td>);
        list.push(<td key="d_name of specilist">Name of Specialist</td>);
        list.push(<td key="d_ou">Org Unit</td>);
        
        selectedStage.
            programStageDataElements.
            reduce(function(list,obj){
                list.push(<td key={obj.id}>{obj.dataElement.name}</td>)
                return list;
            },list);
        
        return list;
        
    }
    
    function render(){
      
        return ( 
                <div>
                <h5> Record List </h5>

                <table >
                <thead>
                {getHeader()}
                </thead>

            </table>

                <table>
                <tbody>
                {getRows()}
                </tbody>
                </table>
            
            
                
            
                </div>
        )
    }
    
}

