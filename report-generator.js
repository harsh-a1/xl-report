import periodWiseProgressiveReport from './periodwise-progressive-report';
import ouWiseProgressiveReport from './ouwise-progressive-report';

function report(state){

    var mapping = state.selectedReport.mapping;

    var ouGroupWiseDecocStringMap = mapping.decoc.reduce((map,obj) => {        
        var str = map[obj.ougroup];
        if (!str) {
            map[obj.ougroup] = "'"+obj.de+"-"+obj.coc+"'"
        }else{
            map[obj.ougroup] = str + ",'"+obj.de+"-"+obj.coc +"'";            
        }
        
        return map;
    },[])

    var ouGroupUIDKeys = Object.keys(ouGroupWiseDecocStringMap).reduce((list,key) =>{
        if (key != 'nogroup'){
            list.push(key);
        }
        return list;        
    },[])


    var ouGroupWiseDeListCommaSeparated = mapping.decoc.reduce((map,obj) => {        
        var str = map[obj.ougroup];
        if (!str) {
            map[obj.ougroup] = "'"+obj.de+"'";
        }else{
            map[obj.ougroup] = str + ",'"+obj.de +"'";            
        }
        
        return map;
    },[])

    var reportParams = {
        selectedOUUID : state.selectedOU.id,
        selectedOUName: state.selectedOU.name,
        selectedOULevel : state.selectedOU.level,
        selectedOUGroupUID : state.selectedOUGroup,
        aggregationType : state.aggregationType,
        startdate : state.startPe,
        enddate : state.endPe,
        ptype : "Monthly",
        attributeOptionComboId : 19,
        ouGroupWiseDecocStringMap : ouGroupWiseDecocStringMap,
        ouGroupUIDKeys : ouGroupUIDKeys,
        ouGroupWiseDeListCommaSeparated : ouGroupWiseDeListCommaSeparated,
        mapping : mapping,
        excelTemplate:state.selectedReport.excelTemplate,
        reportName:state.selectedReport.name + "_"+ state.selectedOU.name+ "_" + state.startPeText+"To"+state.endPeText,
        startdateText : state.startPeText,
        enddateText : state.endPeText
        
    }
    
    this.getReport = function(callback){

        switch(state.selectedReport.reportType){
        case 'OUWiseProgressive' :
            new ouWiseProgressiveReport(reportParams,
                                        callback);
            
            break;

        case 'PeriodWiseProgressive' :
            new periodWiseProgressiveReport(reportParams,
                                            callback);
            break

        default :
            alert(state.selectedReport.reportType+" report type is not yet supported")
            callback()
            return;
        }
        
    }

    
}

module.exports = report;
