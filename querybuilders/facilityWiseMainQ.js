import queries from '../common-sql.js'

function ouWiseMainQ(
    ouuid,
    ouname,
    oulevel,
    selougroupuid,
    startdate,
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
                                 queries.getOURangeSelOUChildrenQ(ouuid)]);
        Q = queries.jsonize(Q);
        console.log(Q);
        return Q;

        function getQ(key){
            return queries.unionize([getSelOuQ(key),
                                    getQQ(key)])
        }
        
        function getSelOuQ(key){

            if (aggregationType == "raw_report"){
                return queries.getSelOUSelectQ(key).replace("sum(dv.value :: float)","max(dv.value)")
                    + queries.getInnerJoinPePtDeCoc()
                    + queries.getInnerJoinOusOu(oulevel)
                    + queries.getFiltersPePtDateDeCocAttrOptionValSource_raw(startdate,
                                                                             enddate,
                                                                             ptype,
                                                                             attroptioncombo,
                                                                             queries.getOrgUnitIDsFromUIDs(ouuid),
                                                                             ouGroupWiseDeListCommaSeparated[key],
                                                                             ouGroupWiseDecocStringMap[key])
                    + queries.getOUGroupBySourceidDeCoc();
                
            }
            
            return queries.getSelOUSelectQ(key)
                + queries.getInnerJoinPePtDeCoc()
                + queries.getInnerJoinOusOu(oulevel)
                + queries.getFiltersPePtDateDeCocAttrOptionValSource(startdate,
                                                                     enddate,
                                                                     ptype,
                                                                     attroptioncombo,
                                                                     queries.getOrgUnitIDsFromUIDs(ouuid),
                                                                     ouGroupWiseDeListCommaSeparated[key],
                                                                     ouGroupWiseDecocStringMap[key])
                + queries.getOUGroupBySourceidDeCoc();            
        }
        
        function getQQ(key){

            if (aggregationType == "raw_report"){
                
                return queries.getOUSelectQ(key,
                                            oulevel+1).replace("sum(dv.value :: float)","max(dv.value)")
                    + queries.getInnerJoinPePtDeCoc()
                    + queries.getInnerJoinOusOu(oulevel+1)
                    + queries.getFiltersPePtDateDeCocAttrOptionValSource_raw(startdate,
                                                                             enddate,
                                                                             ptype,
                                                                             attroptioncombo,
                                                                             ouGroupWiseSourceIDs[key],
                                                                             ouGroupWiseDeListCommaSeparated[key],
                                                                             ouGroupWiseDecocStringMap[key])
                    + queries.getOUGroupBySelOUChildren(oulevel+1);
            }
            
            
            return queries.getOUSelectQ(key,
                                        oulevel+1)
                + queries.getInnerJoinPePtDeCoc()
                + queries.getInnerJoinOusOu(oulevel+1)
                + queries.getFiltersPePtDateDeCocAttrOptionValSource(startdate,
                                                                     enddate,
                                                                     ptype,
                                                                     attroptioncombo,
                                                                     ouGroupWiseSourceIDs[key],
                                                                     ouGroupWiseDeListCommaSeparated[key],
                                                                     ouGroupWiseDecocStringMap[key])
                + queries.getOUGroupBySelOUChildren(oulevel+1);
        }
        
    }


    this.makeGroupMainQuery = function(){
        var Q = ouGroupUIDKeys.map(key => {
            return getQ(key)
        })
        
        Q.push( getQ('nogroup') );
        Q = queries.unionize(Q)
        Q = queries.jsonizeKeyValue(Q)        
        Q = queries.unionizeAll([Q,
                                 queries.getOUGroupMembersUIDAndNameRangeQ(selougroupuid,ouuid)]);
        Q = queries.jsonize(Q);
        console.log(Q);
        return Q;

        function getQ(key){

            if (aggregationType == "raw_report"){
                return queries.getDVFilteredByOUGroupDescendants( getQQ(key ),
                                                               selougroupuid
                                                                ).replace("sum(dataq.value) as value","max(dataq.value) as value");
            }
            
            return  queries.getDVFilteredByOUGroupDescendants( getQQ(key ),
                                                               selougroupuid
                                                             );
        }
        
        function getQQ(key){

            if (aggregationType == "raw_report"){
                return queries.getOUGroupSelectQ(key).replace("sum(dv.value :: float)","max(dv.value)")
                    + queries.getInnerJoinPePtDeCoc()
                    + queries.getFiltersPePtDateDeCocAttrOptionValSource_raw(startdate,
                                                                             enddate,
                                                                             ptype,
                                                                             attroptioncombo,
                                                                             ouGroupWiseSourceIDs[key],
                                                                             ouGroupWiseDeListCommaSeparated[key],
                                                                             ouGroupWiseDecocStringMap[key])
                    + queries.getOUGroupBySourceidDeCoc();
            }

            
            return queries.getOUGroupSelectQ(key)
                + queries.getInnerJoinPePtDeCoc()
                + queries.getFiltersPePtDateDeCocAttrOptionValSource(startdate,
                                                                     enddate,
                                                                     ptype,
                                                                     attroptioncombo,
                                                                     ouGroupWiseSourceIDs[key],
                                                                     ouGroupWiseDeListCommaSeparated[key],
                                                                     ouGroupWiseDecocStringMap[key])
                + queries.getOUGroupBySourceidDeCoc();
        }
    }   
}

module.exports = ouWiseMainQ;
