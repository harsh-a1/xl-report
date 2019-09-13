import React,{propTypes} from 'react';
import reportGenerator from '../report-generator';
import api from '../lib/dhis2API';

export function ReportSelection(props){
   
    var instance = Object.create(React.Component.prototype);
    instance.props = props;

    var keyToObjMap = props.data.reports.reduce((map,obj) =>{
        map[obj.key] = obj;
        return map;
    },{});
    

    var state = {
        selectedReport : "-1",
        selectedReportKey : "-1",
        reportList : [],
        selectedOUGroup : "-1",
        selectedOU : "-1",
        periodList : [],
        startPe : "-1",
        startPeText : "",
        endPe : "-1",
        endPeText : "",
        aggregationType : "use_captured",
        loading : false,
        reportValidation:"",
        startPeValidation:"",
        endPeValidation:"",
        orgUnitValidation:""
        
    };

    state.reportList = props.data.reports;
    props.services.ouSelectCallback.selected = function(ou){

        state.selectedOU = ou;
        state.orgUnitValidation = ""
        instance.setState(state);
    }
                                   
    
    instance.render = render;

    return instance;
    
    function handleSubmit(event){
        event.preventDefault();

        if (isInValid()){
            instance.setState(state);
            return
        }
                
        if (state.selectedReport.excelTemplate){
            getReport();
        }else{
            var dsService = new api.dataStoreService('XLReport_Data');
            dsService.getValue(state.selectedReportKey).then((data) => {
                state.selectedReport.mapping=data.mapping;
                state.selectedReport.excelTemplate = data.excelTemplate;
                getReport();
            })
        }
        
   

        function getReport(){
            state.loading = true;
            instance.setState(state);
            new reportGenerator(Object.assign({},state)).getReport(function(){
                
                state.loading = false;
                instance.setState(state);
            });
        }
    }

    function isInValid(){
        
        var flag = false;
        if (state.selectedOU == "-1"){
            state.orgUnitValidation = "Please select an Org Unit"
            flag = true;
        }

        if (state.selectedReport == "-1"){
            state.reportValidation = "Please select a report"
            flag = true;
        }

        if (state.startPe == "-1"){
            state.startPeValidation = "Please select a start Period"
            flag = true;
        }
        
        if (state.endPe == "-1"){
            state.endPeValidation = "Please select an end Period"
            flag = true;
        }

        if ((Number(state.endPe) - Number(state.startPe)) == 0){
            alert("You have selected zero periods!");
            flag=true;
        }
        
        if (state.selectedOUGroup != "-1" &&
            state.aggregationType == "raw_report" &&
            state.selectedReport.reportType == "PeriodWiseProgressive"){
            alert("Raw Data Mode does not support Org Unit Group Selection in Period Wise Progress Reports!");
            flag=true;            
        }

        if (state.aggregationType == "raw_report"){
            if ((Number(state.endPe) - Number(state.startPe)) != 1){
                alert("Raw Data Mode does not support Mulitple Period Selection for Org Unit Progressive Reports!");
                flag=true;
            }
        }
        
        return flag;
    }
    
    function getReportOptions(reports){

        var options = [
                <option key="select_report" disabled value="-1"> -- select a report -- </option>
                      ];
        
        reports.forEach(function(report){
            options.push(<option key = {report.key}  value={report.key} >{report.name}</option>);
        });
        
        return options;
        
    }

    function onReportChange(e){
        var reportKey = e.target.selectedOptions[0].value;
        
        var periodList = props.services.peService.getPeriods(keyToObjMap[reportKey].period);
        state.periodList = periodList;
        state.selectedReport = keyToObjMap[reportKey];
        state.selectedReportKey = state.selectedReport.key;
        state.reportValidation = "";
        instance.setState(state)
    }
    
    function getPeriodOptions(periodList){

        var options = [
                <option key="select_period" disabled value="-1"> -- select period -- </option>
        ];
        
        periodList.forEach(function(pe){
            options.push(<option key = {pe.id}  value={pe.id} >{pe.name}</option>);
        });
        
        return options;
        
    }

    function getOrgUnitGroupOptions(ougs){
        var options = [
                <option key="select_ougroup"  value="-1"> -- select a facility group -- </option>
];
        
        ougs.forEach(function(oug){
            options.push(<option key = {oug.id}  value={oug.id} >{oug.name}</option>);
        });
        
        return options;
    }
    
    function render(){

        function onPeChange(type,e){

            if (type == "startPe"){
                state.startPe = e.target.value;
                state.startPeText = e.target.selectedOptions[0].text;
                state.startPeValidation = "";
            }else if (type =="endPe"){
                state.endPe = e.target.value
                state.endPeText = e.target.selectedOptions[0].text;
                state.endPeValidation = "";
            }
            instance.setState(state);
        }

        function onAggregationTypeChange(e){

            state.aggregationType = e.target.value;
            instance.setState(state);
        }
        
        function onOUGroupChange(e){

            state.selectedOUGroup = e.target.value;
            instance.setState(state);
        }

        
        return ( 
                <form onSubmit={handleSubmit} className="formX">
                <h3> Facility/Period  Wise Progressive Report </h3><hr></hr>
            
                <table className="formX">
                <tbody>
                <tr>
                <td>  Select Report<span style={{"color":"red"}}> * </span> : </td><td><select  value={state.selectedReportKey} onChange={onReportChange} id="report">{getReportOptions(props.data.reports)}</select><br></br>                <label key="reportValidation" ><i>{state.reportValidation}</i></label>
                </td>
                <td className="leftM">  Selected Facility<span style={{"color":"red"}}> * </span>  : </td><td><input disabled  value={state.selectedOU.name}></input><br></br><label key="orgUnitValidation" ><i>{state.orgUnitValidation}</i></label></td>
                </tr>
                <tr>
                <td> Select Start Period<span style={{"color":"red"}}> * </span>  :  </td><td><select onChange = {onPeChange.bind(this,"startPe")} value = {state.startPe} id="startPe">{getPeriodOptions(state.periodList)}</select><br></br><label key="startPeValidation" ><i>{state.startPeValidation}</i></label>
                </td>
                <td className="leftM" > Select End Period<span style={{"color":"red"}}> * </span>  : </td><td><select onChange = {onPeChange.bind(this,"endPe")} value = {state.endPe} id="endPe">{getPeriodOptions(state.periodList)}</select><br></br><label key="startPeValidation" ><i>{state.endPeValidation}</i></label>
                </td>
                </tr>              
                <tr>
                <td> Select Org Unit Group : </td><td><select value={state.selectedOUGroup} onChange = {onOUGroupChange} id="ouGroup">{getOrgUnitGroupOptions(props.data.ouGroups)}</select></td>
                <td className="leftM" > Select Aggregation Mode : </td><td><select onChange = {onAggregationTypeChange.bind(this)} value = { state.aggregationType  }  id="aggregationType"> <option key="use_captured"  value="use_captured" > Use Captured </option>
                <option key="agg_descendants" value="agg_descendants" > Generate Aggregated </option>
                <option key="no_agg_use_captured" value="raw_report" > Raw Data </option>
                </select></td>
                </tr>
                <tr></tr><tr></tr>
                <tr><td>  <input type="submit" value="Generate Report" ></input></td>
                <td> <img style = {state.loading?{"display":"inline"} : {"display" : "none"}} src="./images/loader-circle.GIF" alt="loader.." height="32" width="32"></img>  </td></tr>

                </tbody>                
                </table>
                </form>
        )
    }
    
}

