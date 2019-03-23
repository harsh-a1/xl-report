import React,{propTypes} from 'react';
import reportGenerator from '../report-generator';
import api from '../lib/dhis2API';

export function ApprovalI(props){
   
    var instance = Object.create(React.Component.prototype);
    instance.props = props;
    
    var state = {

        program : props.data.program,
        user : props.data.user,
        selectedOU : "-1",
        ouMode : "descendants",
        sdate : new Date().toISOString().substr(0,10),
        edate : new Date().toISOString().substr(0,10),
        selectedSpeciality : "All"
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

    function onAggregationTypeChange(e){
        state.aggregationType = e.target.value;
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
    
    
    function render(){
        
        
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
                <td>  Select Speciality<span style={{"color":"red"}}> * </span> : </td><td><select  value={state.selectedSpeciality} onChange={onSpecialityChange} id="report">{getSpeciality(props.data.program)}</select><br></br> <label key="reportValidation" ><i>{state.reportValidation}</i></label>
                </td>
                <td className="leftM">  Selected Facility<span style={{"color":"red"}}> * </span>  : </td><td><input disabled  value={state.selectedOU.name}></input><br></br><label key="orgUnitValidation" ><i>{state.orgUnitValidation}</i></label></td>
                
            </tr>
                <tr>
                <td> Select Start Period<span style={{"color":"red"}}> * </span>  :  </td><td><input type="date" value={state.sdate} onChange = {onStartDateChange} ></input><br></br><label key="startPeValidation" ><i>{state.startPeValidation}</i></label>
                </td>
                <td className="leftM" > Select End Period<span style={{"color":"red"}}> * </span>  : </td><td><input type="date" value={state.edate} onChange = {onEndDateChange} ></input><br></br><label key="startPeValidation" ><i>{state.endPeValidation}</i></label>
                </td>
                <td></td>
                </tr>
                <tr>
                <td className="" > Select OU Mode : </td><td><select  value = { state.aggregationType  }  id="aggregationType"> <option key="selected"  value="selected" > Selected </option> <option key="descendants" value="descendants" > Descendants </option> </select></td>

                </tr>
                <tr></tr><tr></tr>
                <tr><td>  <input type="submit" value="Submit" ></input></td>
                <td> <img style = {state.loading?{"display":"inline"} : {"display" : "none"}} src="./images/loader-circle.GIF" alt="loader.." height="32" width="32"></img>  </td></tr>

                </tbody>                
                </table>
            
                </div>
        )
    }
    
}

