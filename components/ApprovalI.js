import React,{propTypes} from 'react';
import reportGenerator from '../report-generator';
import api from '../dhis2API';
import {ApprovalTable} from './ApprovalTable';
import constants from '../constants'

export function ApprovalI(props){
    
    var instance = Object.create(React.Component.prototype);
    instance.props = props;
    
    var state = {

        program : props.data.program,
        user : props.data.user,
        selectedOU : {name : ""},
        ouMode : "DESCENDANTS",
        sdate : new Date("2018-01-01").toISOString().substr(0,10),
        edate : new Date().toISOString().substr(0,10),
        selectedSpeciality : "FkNlQ5arLjv",
        events : null,
        teiWiseAttrVals : null,        
    };

    props.services.ouSelectCallback.selected = function(ou){

        state.selectedOU = ou;
        state.orgUnitValidation = ""
        instance.setState(state);
    }
    
    instance.render = render;
    return instance;

    function onSpecialityChange(e){
        state.selectedSpeciality = e.target.value;
        instance.setState(state);
    }

    function onOuModeChange(e){
        state.ouMode = e.target.value;
        instance.setState(state);
    }

    function onStartDateChange(e){
        state.sdate = e.target.value;
        instance.setState(state);
    }

    function onEndDateChange(e){
        state.edate = e.target.value;
        instance.setState(state);
    }

    function getApprovalEvents(e){
        
        // validation

        var apiWrapper = new api.wrapper();
        var url = `events?program=${constants.program_doc_diary}&status=COMPLETED&startDate=${state.sdate}&endDate=${state.edate}&orgUnit=${state.selectedOU.id}&ouMode=${state.ouMode}&skipPaging=true`;

        if (state.selectedSpeciality != 'All'){
            url = url + "&programStage="+state.selectedSpeciality;
        }

        apiWrapper.getObj(url,function(error,body,response){
            if (error){
                alert("An unexpected error occurred." + error);
                return;
            }

            var events = response.events;
            state.events = events;

            getTEIFromEvents(events,function(error,body,response){
                if (error){

                }

                var attrVals = JSON.parse(response.
                                          listGrid.
                                          rows[0][0]?response.
                                          listGrid.
                                          rows[0][0].value:null);
                
                state.teiWiseAttrVals = attrVals;
                state.loading=false;
                instance.setState(state)
            })
            
        })
        
        function getTEIFromEvents(events,callback){

            var teis = events.reduce(function(list,obj){
                if (!list.includes(obj.trackedEntityInstance)){
                    list.push(obj.trackedEntityInstance)
                }
                return list;
            },[]);

            
            teis = teis.reduce(function(str,obj){
                if (!str){
                    str =  "'" + obj + "'"
                }else{
                   str = str + ",'" + obj + "'"
                }
                
                return str; 
            },null);

            var sqlViewService = new api.sqlViewService();
            
            console.log(constants.query_teiWiseAttrValue(teis))
            sqlViewService.dip("Approval_App",
                               constants.query_teiWiseAttrValue(teis),
                               callback);
            
        }
     

    }


function render(){        

    function getApprovalTable(){
        if(!(state.events || state.teiWiseAttrVals)){
            return (<div></div>)
        }else{
            
            return (<ApprovalTable key="approvaltable"  events={state.events} program={state.program} user={state.user} teiWiseAttrVals={state.teiWiseAttrVals} selectedSpeciality={state.selectedSpeciality} />
               );
        }
    }
    
    function getSpeciality(program){
        
        var options = [
                <option key="select_speciality" value="-1"> -- All -- </option>
        ];
        
        program.programStages.forEach(function(ps){
            options.push(<option key = {ps.id}  value={ps.id} >{ps.name}</option>);
        });
        
        return options;
    }
    
    return ( 
            <div>
            <h3> Approval I </h3>
            
            <table className="formX">
            <tbody>
            <tr>
            <td>  Select Speciality<span style={{"color":"red"}}> * </span> : </td><td><select  value={state.selectedSpeciality} onChange={onSpecialityChange} id="report">{getSpeciality(props.data.program)}</select><br></br> <label key="reportValidation" ><i>{}</i></label>
            </td>
            <td className="leftM">  Selected Facility<span style={{"color":"red"}}> * </span>  : </td><td><input disabled  value={state.selectedOU.name}></input><br></br><label key="orgUnitValidation" ><i>{}</i></label></td>
            
        </tr>
            <tr>
            <td> Select Start Period<span style={{"color":"red"}}> * </span>  :  </td><td><input type="date" value={state.sdate} onChange = {onStartDateChange} ></input><br></br><label key="startPeValidation" ><i>{}</i></label>
            </td>
            <td className="leftM" > Select End Period<span style={{"color":"red"}}> * </span>  : </td><td><input type="date" value={state.edate} onChange = {onEndDateChange} ></input><br></br><label key="startPeValidation" ><i>{}</i></label>
            </td>
            <td></td>
            </tr>
            <tr>
            <td className="" > Select OU Mode : </td><td><select  value = { state.ouMode  }  id="ouMode" onChange = {onOuModeChange}> <option key="selected"  value="SELECTED" > Selected </option> <option key="descendants" value="DESCENDANTS" > Descendants </option> </select></td>

        </tr>
            <tr></tr><tr></tr>
            <tr><td>  <input type="submit" value="Submit" onClick={getApprovalEvents} ></input></td>
            <td> <img style = {state.loading?{"display":"inline"} : {"display" : "none"}} src="./images/loader-circle.GIF" alt="loader.." height="32" width="32"></img>  </td></tr>

        </tbody>                
            </table>
            {
                    getApprovalTable()
            }
            
        </div>
    )
}

}

