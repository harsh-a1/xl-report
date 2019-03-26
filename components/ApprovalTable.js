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
        selectedSpeciality : props.selectedSpeciality,
        ouMap : []
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
  // https://devtest.hispindia.org/upupgrade/api/organisationUnits.json?filter=id:in:[frUcctRfQiB,PYat3gF9Zqv]&fields=id,name,ancestors
    function getRows(){
      
        return state.events.reduce(function(list,event){
            var eventDVMap = event.dataValues.reduce(function(map,obj){
                map[obj.dataElement] = obj.value;
                return map;                
            },[]);

            list.push(<td key="d_eventdate">{event.eventDate}</td>);
            list.push(<td key="d_name of specilist">{}</td>);
            list.push(<td key="d_ou">{event.orgUnit}</td>);
            
            selectedStage.
                programStageDataElements.
                reduce(function(list,obj){
                    list.push(<td key={"d"+obj.id}>{eventDVMap[obj.dataElement.id]}</td>)
                    return list;
                },list);
            
            return (<tr>{list}</tr>)
        },[])
        
        
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

