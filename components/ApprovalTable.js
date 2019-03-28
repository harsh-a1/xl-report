import React,{propTypes} from 'react';
import api from '../dhis2API';
import constants from '../constants'


export function ApprovalTable(props){
    
    var instance = Object.create(React.Component.prototype);
    instance.props = props;
    
    var state = {
        user : props.user,
        program : props.program,
        events : props.events,
        teiWiseAttrVals : props.teiWiseAttrVals,
        selectedSpeciality : props.selectedSpeciality,
        ous : props.ous,
        type : props.type,
        callMeWhenInPain : props.callMeWhenInPain,
        userAuthority : props.userAuthority
    };

    var programStageMap = state.program.programStages.reduce(function(map,obj){
        map[obj.id] = obj;
        return map;
    },[]);

    var teiAttrValMap = state.teiWiseAttrVals.reduce(function(map,tei){

        return tei.attrs.reduce(function(map,obj){

            map[tei.tei+obj.attr] = obj.value;
            
            return map;
        },[]);
        
    },[]);

    var ouMap = state.ous.reduce(function(map,obj){
        map[obj.id] = obj;
        return map;
    },[]);
    
    var selectedStage = programStageMap[state.selectedSpeciality];
    
    instance.render = render;
    return instance;


    function approveRecord(eventuid,e){        

        var approveDeVal = state.userAuthority==constants.approval_usergroup_level1_code?constants.approval_status.pending2:constants.approval_status.approved;
        //        approveDeVal="Pending1";
        saveDV(eventuid,
               constants.approval_status_de,
               approveDeVal,
               constants.approval_rejection_reason_de,
               "",
               "COMPLETED",
               state.callMeWhenInPain);

    }

    function saveDV(eventuid,
                    approvalDe,
                    approvalDeVal,
                    rejectionDe,
                    rejectionDeVal,
                    status,callback){
        
        var apiWrapper = new api.wrapper();
        var url = `events/${eventuid}/${approvalDe}`;
        var obj = {
            dataValues : [
                {dataElement : approvalDe,
                 value:approvalDeVal}
            ],
            status :status
        }
        apiWrapper.updateObj(url,obj,function(error,body,response){
            if (error){
                alert("An unexpected error occurred." + error);
                return;
            }

            var url = `events/${eventuid}/${rejectionDe}`;
            var obj = {
                dataValues : [
                    {dataElement : rejectionDe,
                     value:rejectionDeVal}
                ],
                status :status
            }


            apiWrapper.updateObj(url,obj,function(error,body,response){
                if (error){
                    alert("An unexpected error occurred." + error);
                    return;
                }
                
                callback();            
            })
            
        })
    }
    
    function rejectRecord(eventuid,e){
        var reason = prompt("Please enter reason for rejection", "");
        if (!reason){return}
        
        saveDV(eventuid,
               constants.approval_status_de,
               constants.approval_status.rejected,
               constants.approval_rejection_reason_de,
               reason,
               "ACTIVE",
               state.callMeWhenInPain);
    }
    
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
        list.push(<th className = "" key="h_operation">#</th>);

        return list;
    }

    function getRows(){
        
        return state.events.reduce(function(list,event){
            var eventDVMap = event.dataValues.reduce(function(map,obj){
                map[obj.dataElement] = obj.value;
                return map;                
            },[]);

            var _list = [];
            _list.push(<td key="d_eventdate">{event.eventDate.substring(0,10)}</td>);
            _list.push(<td key="d_name of specilist">{teiAttrValMap[event.trackedEntityInstance+"U0jQjrOkFjR"]}</td>);
            _list.push(<td key="d_ou">{makeFacilityStrBelowLevel(ouMap[event.orgUnit],2)}</td>);
            
            selectedStage.
                programStageDataElements.
                reduce(function(_list,obj){
                    _list.push(<td key={"d"+obj.id+event.event}>{eventDVMap[obj.dataElement.id]}</td>)
                    return _list;
                },_list);

            _list.push(getButtons(event.event))

            list.push([<tr key={event.event}>{_list}</tr>]);
            return list;
        },[]);
        
        function getButtons(eventuid){
            return (<td className = "" key={"b_"+eventuid}><div className="approvalOperationDiv">
                    <input hidden={state.type == constants.report_types.pending?false:true} className= "approvalButton" type="button" value="Approve" onClick={approveRecord.bind(null,eventuid)}></input>
                    <input hidden={state.type == constants.report_types.pending?false:true} className= "approvalButton" type="button" value="Reject" onClick={rejectRecord.bind(null,eventuid)}></input>
                    </div></td>)
        }
    }
    
    function makeFacilityStrBelowLevel(ou,level){        
        return ou.ancestors.reduce(function(str,obj){
            if(obj.level>level){
                str = str + obj.name + " / " ;
            }
            return str;
        },"")  + ou.name;                
    }
    
    function render(){
        
        return ( 
                <div>
                <h5> Record List </h5>

                <table className="approvalTable">
                <thead>
                <tr>
                <th colSpan="3">Attributes</th>
                <th colSpan={  selectedStage.programStageDataElements.length+1}>{selectedStage.name}</th>
                </tr>
                <tr>
                {getHeader()}
            </tr>
                </thead>

            </table>

                <table className="approvalTable">
                <tbody>
                
            {getRows()}
            </tbody>
                </table>
                
            
            
            
            </div>
        )
    }
    
}

