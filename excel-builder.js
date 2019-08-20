import XLSX from 'xlsx-populate';
import fileOps from './fileOperation';

function excelBuilder(mapping,
                      data,
                      excelTemplate,
                      reportName,
                      facilityName,
                      startdate,
                      enddate,
                      callback){

    data = JSON.parse(data.rows[0])

    data = data.reduce((map,obj) => {
        map[obj.key] = obj.value
        return map;
    },[]);

    var pivots = data["pivot"]; delete data.pivot;

    var rowDataCellValueList = __getRowDataCellValueList(pivots,
                                                         mapping,
                                                         data,
                                                         facilityName);
    
    var selectionParametersCellValueMap = getSelectionParametersCellValueMap(startdate,
                                                                             enddate,
                                                                             mapping.periodCell,
                                                                             facilityName,
                                                                             mapping.facilityCell)

    XLSX.fromDataAsync(excelTemplate,{base64:true}).then(function(wb){
        
        if (!wb.sheet(mapping.sheetName)){
            alert(mapping.sheetName+"<-Sheet not found. This may be a problem with the configuration of the report excel template. Please contact Admin.");
            callback();
            return;
        }
        var wbOps = new fileOps(wb,mapping.sheetName);
        
        wbOps.write(rowDataCellValueList);
        wbOps.write(selectionParametersCellValueMap);

        wbOps.downloadWB(reportName,"xlsx");
        callback()
    })

}


function __getRowDataCellValueList(pivots,mapping,data,facilityName){
    var cellValueList = [];
    var rowTotalMap = [];
    
    var colNo = getNumber(mapping.pivotStartColumn);

    for (var key in pivots){
        var pivotname = pivots[key];

        cellValueList.push({
            cell : getLetter(colNo) + mapping.pivotStartRow,
            value : pivotname,
            style : [{
                key : "bold",
                value :"true"
            }]
        })

        
        var currentColumnRowValuesMap = mapping.decoc.reduce((map,obj)=>{

            var decoc = obj.ougroup+"-"+ obj.de+"-"+obj.coc;

            if (data[key]){
                if (data[key][decoc]){
                    map[obj.row] = data[key][decoc];
                }
            }
            
            return map;            
        },[]);

        var calcFieldsRowValueMap = makeCalcFieldsRowValueMap(mapping.calc,
                                                              currentColumnRowValuesMap);
        
        
        var rowCellValues = makeCellValueFromRowValueMap(currentColumnRowValuesMap,
                                                         colNo);
        
        var calcCellValues = makeCellValueFromRowValueMap(calcFieldsRowValueMap,
                                                          colNo,
                                                          [{
                                                              key : "bold",
                                                              value :"true"
                                                          }]);

        rowTotalMap = sumMap(rowTotalMap,currentColumnRowValuesMap);
        rowTotalMap = sumMap(rowTotalMap,calcFieldsRowValueMap);
        
        cellValueList.push.apply(cellValueList,rowCellValues)
        cellValueList.push.apply(cellValueList,calcCellValues)
                                 
        colNo = colNo+1;
    }

    cellValueList.push({
        cell : getLetter(colNo) + mapping.pivotStartRow,
        value : facilityName+"_Total",
        style : [{
            key : "bold",
            value :"true"
        }]
    })
    
    cellValueList.
        push.
        apply(cellValueList,
              makeCellValueFromRowValueMap(rowTotalMap,
                                           colNo,
                                           [{
                                               key : "bold",
                                               value :"true"
                                           }]));
    
    return cellValueList;    
}

function sumMap(ref,map){

    for (var key in map){
        if (!ref[key]){
            ref[key] = map[key];
        }else{
            ref[key] = parseInt(ref[key]) + parseInt(map[key]);
        }
    }

    return ref;    
}

function makeCalcFieldsRowValueMap(calc,rowValueMap){

    return calc.reduce((map,obj) =>{
        
        var pattern = /R\d+W/g
        var matches = obj.expression.match(pattern);
        var objExpression = obj.expression ;
        var total = "";
        for (var key in matches){
            var expRow = matches[key];
            expRow = expRow.replace(/R/,"");
            expRow = expRow.replace(/W/,"");
            if (rowValueMap[expRow]){
                objExpression = objExpression.replace(matches[key],rowValueMap[expRow]);
            }else{
                objExpression = objExpression.replace(matches[key],0);
            }
        }                    
        try{                        
            total = eval(objExpression)
        }catch(e){
            console.log("Failed to evaluate calculated expression" +e + objExpression)
        }

        map[obj.row] = total;
        return map;
    },[])
    
}


function makeCellValueFromRowValueMap(map,colNo,style){

    var result = [];
    
    for (var row in map){

        var cell = getLetter(colNo)+row
        var obj = {
            cell : cell,
            value :map[row]
        }
        
        if(style){
            obj.style = style
        }
        
        result.push(obj )
    }
    return result;
}


function getSelectionParametersCellValueMap (startPe,endPe,pcell,facility,fcell){

    var cellValueMap= [];
    
    cellValueMap.push( {
        cell : pcell,
        value :startPe + " To " + endPe,
        style : [{
            key : "bold",
            value :"true"
        }]
    },{
        cell : fcell,
        value :facility,
        style : [{
            key : "bold",
            value :"true"
        }]
    })
    
    return cellValueMap;        
}


// convert A to 1, Z to 26, AA to 27
function getNumber(letters){
    // https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25
    return letters.split('').reduce((r, a) => r * 26 + parseInt(a, 36) - 9, 0);
}

function getLetter(num) {
    /**
     * Takes a positive integer and returns the corresponding column name.
     * @param {number} num  The positive integer to convert to a column name.
     * @return {string}  The column name.
     http://cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name/
    */
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
}

module.exports = excelBuilder;
