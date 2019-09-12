import queries from '../common-sql.js'

function periodWiseMainQ(startdate,
                         enddate,
                         ptype,
                         attroptioncombo,
                         ouGroupWiseDecocStringMap,
                         ouGroupUIDKeys,
                         ouGroupWiseDeListCommaSeparated,
                         ouGroupWiseSourceIDs,
                         aggregationType
                         ){

    
    
    this.makeMainQuery = function(){
                
        var Q = ouGroupUIDKeys.map(key => {
            return getQ(key)
        })

        Q.push( getQ('nogroup') );
        Q = queries.unionize(Q)
        Q = queries.jsonizeKeyValue(Q)        
        Q = queries.unionizeAll([Q,
                                queries.getDateRangeQ(startdate,
                                                      enddate,
                                                      ptype)]);
        Q = queries.jsonize(Q);
      
        return Q;
    }

    function getQ(key){

        if (aggregationType == "raw_report"){
            return queries.getPeriodSelectQ(key).replace("sum(dv.value :: float)","max(dv.value)")
                + queries.getInnerJoinPePtDeCoc(aggregationType)
                + queries.getFiltersPePtDateDeCocAttrOptionValSource_raw(startdate,
                                                                         enddate,
                                                                         ptype,
                                                                         attroptioncombo,
                                                                         ouGroupWiseSourceIDs[key],
                                                                         ouGroupWiseDeListCommaSeparated[key],
                                                                         ouGroupWiseDecocStringMap[key])
                + queries.getPeriodGroupBy();
        }
        
        return queries.getPeriodSelectQ(key)
            + queries.getInnerJoinPePtDeCoc(aggregationType) +
            queries.getFiltersPePtDateDeCocAttrOptionValSource(startdate,
                                                               enddate,
                                                               ptype,
                                                               attroptioncombo,
                                                               ouGroupWiseSourceIDs[key],
                                                               ouGroupWiseDeListCommaSeparated[key],
                                                               ouGroupWiseDecocStringMap[key]) +
            queries.getPeriodGroupBy();
    }

}

module.exports = periodWiseMainQ;
