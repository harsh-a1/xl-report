
function Queries(){

    this.getOrgUnitIDsFromUIDs = function(uids){
        return `select organisationunitid
        from organisationunit
        where uid in ('${uids}')`
    }

    this.getPeriodSelectQ = function(key){
        return `
        select to_char(pe.startdate , 'yyyy-mm-dd')as pivot,
        concat('${key}','-',de.uid,'-',coc.uid) as decoc ,
        sum(dv.value :: float) as value
        from datavalue dv
        `
    }

    this.getOUGroupSelectQ = function(key){
        return `select dv.sourceid as sourceid,
        concat('${key}','-',de.uid,'-',coc.uid) as decoc ,
        sum(dv.value :: float) as value
        from datavalue dv`        
    }
    
    this.getOUSelectQ = function(key,
                                 oulevel){
        return `
        select ous.uidlevel${oulevel} as pivot,
        concat('${key}','-',de.uid,'-',coc.uid) as decoc ,
        sum(dv.value :: float) as value
        from datavalue dv`
    }

    this.getSelOUSelectQ = function(key){
        return `
        select max(ou.uid) as pivot,
        concat('${key}','-',de.uid,'-',coc.uid) as decoc ,
        sum(dv.value :: float) as value
        from datavalue dv`
    }

    this.getDVFilteredByOUGroupDescendants = function(dv,ouGroupUID){
        return `select groupmemq.pivot as pivot,
        dataq.decoc,
        sum(dataq.value) as value
        from (
            ${dv}
        )dataq
        inner join
        (
            ${getOUsPivotByOugroup(ouGroupUID)}
        )groupmemq
             on dataq.sourceid = groupmemq.ougmid
            group by groupmemq.pivot,dataq.decoc`
        
    }
    
    this.getInnerJoinPePtDeCoc = function(){
        return `
        inner join period as pe on pe.periodid = dv.periodid 
	inner join periodtype as pt on pt.periodtypeid = pe.periodtypeid 
	inner join dataelement as de on de.dataelementid = dv.dataelementid 
	inner join categoryoptioncombo coc on coc.categoryoptioncomboid = dv.categoryoptioncomboid `
    }

    this.getInnerJoinOusOu = function(oulevel){
        return `inner join _orgunitstructure ous on ous.organisationunitid = dv.sourceid 
        inner join organisationunit ou on ou.organisationunitid = ous.idlevel${oulevel}`
    }
    
    this.getFiltersPePtDateDeCocAttrOptionValSource = function(startdate,
                                                               enddate,
                                                               ptype,
                                                               attroptioncombo,
                                                               sourceids,
                                                               deListCommaSeparated,
                                                               decocStr){
        if (!sourceids){
            sourceids = 0;
        }
        var format = "";
        switch(ptype){
        case "Monthly" : format = "yyyymm"
            break
        default : format = "yyyymm"
        }

        return `
        where pe.startdate >= to_date('${startdate}','${format}')
        and pe.startdate <= to_date('${enddate}','${format}')
        and dv.attributeoptioncomboid=${attroptioncombo}
	and dv.value ~'^-?[0-9]+\.?[0-9]*$' and dv.value !='0'
	and dv.sourceid in ( ${sourceids } )
        and dv.dataelementid in  (select dataelementid from dataelement where uid in (${deListCommaSeparated}))
        and concat(de.uid,'-',coc.uid) in (${decocStr}) `

    }
    this.getFiltersPePtDateDeCocAttrOptionValSource_raw = function(startdate,
                                                                   enddate,
                                                                   ptype,
                                                                   attroptioncombo,
                                                                   sourceids,
                                                                   deListCommaSeparated,
                                                                   decocStr){
        if (!sourceids){
            sourceids = 0;
        }
        var format = "";
        switch(ptype){
        case "Monthly" : format = "yyyymm"
            break
        default : format = "yyyymm"
        }

        return `
        where pe.startdate >= to_date('${startdate}','${format}')
        and pe.startdate <= to_date('${enddate}','${format}')
        and dv.attributeoptioncomboid=${attroptioncombo}
	and dv.sourceid in ( ${sourceids } )
        and dv.dataelementid in  (select dataelementid from dataelement where uid in (${deListCommaSeparated}))
        and concat(de.uid,'-',coc.uid) in (${decocStr}) `

    }

    
    this.getPeriodGroupBy = function(){
        return `group by pe.startdate,de.uid,coc.uid`
    }

    this.getOUGroupBySelOUChildren = function(oulevel){
        return `group by ous.uidlevel${oulevel},de.uid,coc.uid`
    }    

    this.getOUGroupBySourceidDeCoc = function(){
        return `group by dv.sourceid,de.uid,coc.uid  `
    }
    
    this.getNoGroupSelectedOU = function(selectedOU){
        return `select 'nogroup' as ougroup,string_agg(ou.organisationunitid::text,',') as sourceids
        from organisationunit ou
        where ou.uid  in ('${selectedOU}')
        group by ougroup`;
    }

    
    this.getNoGroupSelectedOUChildren = function(selectedOU){
        return `select 'nogroup' as ougroup,string_agg(ou.organisationunitid::text,',') as sourceids
        from organisationunit ou
        where ou.organisationunitid  in (${getChildrenIDFromOUUID(selectedOU)})
        group by ougroup`;
    }
    
    this.getNoGroupSelectedOUDescendants = function(selectedOU){
        return `select 'nogroup' as ougroup,string_agg(ou.organisationunitid::text,',') as sourceids
        from organisationunit ou
        where ou.organisationunitid  in (${getOUDescendants(selectedOU)})
        group by ougroup`;
    }
    
    function getOUDescendants (selectedOU){
        return `with recursive org_units as (
	    select ou.organisationunitid
	    from organisationunit ou
	    where ou.uid in ('${selectedOU}')
	    union
	    select ch.organisationunitid
	    from organisationunit ch
	    join org_units p on ch.parentid = p.organisationunitid
	)
	select distinct * from org_units`
    }
    
    this.getNoGroupSelectedOUDescendants = function(selectedOU){
        return `
        select 'nogroup' as ougroup,string_agg(ou.organisationunitid::text,',') as sourceids
        from (

            ${getOUDescendants(selectedOU)}
	    
        )ou`;
    }

    this.getNoGroupSelectedOUDescendantAndOUGroup = function(selectedOU,ouGroupUID){
        return `select 'nogroup' as ougroup,string_agg(ou.organisationunitid::text,',') as sourceids
        from organisationunit ou
        where ou.organisationunitid  in (${getOUDescendants(selectedOU)})
        and ou.organisationunitid in (${getOUGroupMembersIdByOUGroup(ouGroupUID)})
        group by ougroup`;
    }

    this.getNoGroupSelectedOUDescendantAndOUGroupDescendants = function(selectedOU,ouGroupUID){
        return `select 'nogroup' as ougroup,string_agg(ou.organisationunitid::text,',') as sourceids
        from organisationunit ou
        where ou.organisationunitid  in (${getOUDescendants(selectedOU)})
        and ou.organisationunitid in (${getOUGroupMembersIdByOUGroupDescendants(ouGroupUID)})
        group by ougroup`;
    }
    
    this.getOUGroupMembersFilteredBySelectedOUDescendants = function(selectedOU,ouGroupKey,ouGroupUIDs){
        
        return `select ${ouGroupKey} as ougroup,string_agg(ougm.organisationunitid::text,',') as sourceids
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in (${ouGroupUIDs})
        and ougm.organisationunitid in ( ${getOUDescendants(selectedOU)} )
        group by ougroup`;
        
        
    }

    this.getOUGroupMembersFilteredBySelectedOU = function(selectedOU,ouGroupKey,ouGroupUIDs){
        
        return `select ${ouGroupKey} as ougroup,string_agg(ougm.organisationunitid::text,',') as sourceids
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in (${ouGroupUIDs})
        and ougm.organisationunitid in ((select ou.organisationunitid
                                         from organisationunit ou
                                         where ou.uid in( '${selectedOU}')))
        group by ougroup`;
        
    }

    this.getOUGroupMembersFilteredBySelectedOUChildren = function(selectedOU,ouGroupKey,ouGroupUIDs){
        
        return `select ${ouGroupKey} as ougroup,string_agg(ougm.organisationunitid::text,',') as sourceids
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in (${ouGroupUIDs})
        and ougm.organisationunitid in ((${getChildrenIDFromOUUID(selectedOU)}))
        group by ougroup`;        
    }

    this.getOUGroupMembersFilteredBySelectedOUChildrenDescendants = function(selectedOU,ouGroupKey,ouGroupUIDs){
        
        return `select ${ouGroupKey} as ougroup,string_agg(ougm.organisationunitid::text,',') as sourceids
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in (${ouGroupUIDs})
        and ougm.organisationunitid in ((${getOUDescendants(selectedOU)}))
        group by ougroup`;        
    }
    
    this.getOUGroupMembersFilteredBySelectedOUDescendantsAndOUGroup = function(selectedOU,
                                                                               ouGroupKey,
                                                                               ouGroupUIDs,
                                                                               selectedOUGroupUID){

        return `select ${ouGroupKey} as ougroup,string_agg(ougm.organisationunitid::text,',') as sourceids
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in (${ouGroupUIDs})
        and ougm.organisationunitid in ( ${getOUDescendants(selectedOU)} )
        and ougm.organisationunitid in (${getOUGroupMembersIdByOUGroup(selectedOUGroupUID)})
        group by ougroup`;
        
        
    }

    this.getOUGroupMembersFilteredBySelectedOUDescendantsAndOUGroupDescendants = function(selectedOU,
                                                                                          ouGroupKey,
                                                                                          ouGroupUIDs,
                                                                                          selectedOUGroupUID){

        return `select ${ouGroupKey} as ougroup,string_agg(ougm.organisationunitid::text,',') as sourceids
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in (${ouGroupUIDs})
        and ougm.organisationunitid in ( ${getOUDescendants(selectedOU)} )
        and ougm.organisationunitid in (${getOUGroupMembersIdByOUGroupDescendants(selectedOUGroupUID)})
        group by ougroup`;
        
        
    }

    function getChildrenIDFromOUUID(ouUID){
        return `select ou.organisationunitid
        from organisationunit ou
        where ou.parentid in(select organisationunitid
                             from organisationunit
                             where uid in ( '${ouUID}' ))`;
    }
    
    function getOUGroupMembersIdByOUGroup(ouGroupUIDs){
        return `select ougm.organisationunitid        
        from orgunitgroupmembers ougm
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in ('${ouGroupUIDs}')`
    }

    function getOUGroupMembersIdByOUGroupDescendants(ouGroupUIDs){
        return  `with recursive org_units as (
            select ou.organisationunitid
            from orgunitgroupmembers ougm
            join organisationunit ou on ou.organisationunitid =  ougm.organisationunitid
            join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
            where oug.uid in ('${ouGroupUIDs}')
            
            union all
            
            select ch.organisationunitid
            from organisationunit ch 
            join org_units p on ch.parentid = p.organisationunitid
            
        )
        select organisationunitid from org_units` 
        
    }

    function getOUsPivotByOugroup(ouguid){
        return `with recursive org_units as (
            select ougm.organisationunitid as ougmid,ou.uid as pivot,ou.name as pivotname
            from orgunitgroupmembers ougm
            join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
	    join organisationunit ou on ou.organisationunitid = ougm.organisationunitid
            where oug.uid in ('${ouguid}')
            
            union all
            
            select ch.organisationunitid as ougmid,p.pivot as pivot,p.pivotname as pivotname
            from organisationunit ch 
            join org_units p on ch.parentid = p.ougmid
            
        )
        select * from org_units`
    }
    
    function getChildrenIDAndNameFromOUUID(uid){
        
        return `
        select * 
            from (
                (select ou.uid as uid,ou.name as name
                from organisationunit ou
                where ou.parentid in (select organisationunitid
                                      from organisationunit
                                      where uid in ( '${uid}' ))
                order by ou.name )
                union all
                select ou.uid as uid,concat(ou.name,'_ONLY') as name
                from organisationunit ou
                where ou.uid in ('${uid}')
            )main`
    }

    function getOUGroupMembersUIDAndNameFilteredByOUDescendants(ouGroupUIDs,ouUID){
        return `select ou.uid,ou.name        
        from orgunitgroupmembers ougm
        inner join organisationunit ou on ou.organisationunitid = ougm.organisationunitid
        inner join orgunitgroup oug on oug.orgunitgroupid = ougm.orgunitgroupid
        where oug.uid in ('${ouGroupUIDs}')
        and ou.organisationunitid in ( ${getOUDescendants(ouUID)} )
        group by ou.uid,ou.name
        order by ou.name`
    }
    
    this.getDateRangeQ = function(startdate,enddate,ptype){

        var format = "", interval = "", formatPP="";
        switch(ptype){
        case 'Monthly' :
            format = "yyyymm";
            interval = "month" ;
            formatPP="Mon yyyy"
            break
            
        }
        
        return `
        select 'pivot' as key,
	format('{%s}' ,
	       string_agg(format('"%s":"%s"',
			         to_char(date,'yyyy-mm-dd'),
			         to_char(date,'${formatPP}')), 
			  ','))::json as value
        from generate_series(
	    to_date('${startdate}','${format}'),
	    to_date('${enddate}','${format}'),
	    '1 ${interval}'::interval
        ) date`
    }

    this.getOURangeSelOUChildrenQ = function(ouUID){

        return ` select 'pivot' as key,
	format('{%s}' ,
	       string_agg(format('"%s":"%s"',
			         uid,
			         name), 
			  ','))::json as value
        from (
            ${getChildrenIDAndNameFromOUUID(ouUID) }
        )main`
        
    }

    this.getOUGroupMembersUIDAndNameRangeQ = function(ougroupUID,
                                                      selOUUID){

        return ` select 'pivot' as key,
	format('{%s}' ,
	       string_agg(format('"%s":"%s"',
			         uid,
			         name), 
			  ','))::json as value
        from( 
            ${getOUGroupMembersUIDAndNameFilteredByOUDescendants(ougroupUID,
                                                                 selOUUID) }
        )main`
        
    }
    
    this.unionize = function(list){
        return list.reduce((str,q) => {
            if (str == ""){
                str = q;
            }else{
                str =` ${str}

                union 

                ${q}`;
            }
            
            return str;
        },"");
    }

    this.unionizeAll = function(list){
        return list.reduce((str,q) => {
            if (str == ""){
                str = q;
            }else{
                str =` ${str}

                union all

                ${q}`;
            }
            
            return str;
        },"");
    }
    
    this.jsonize = function(q){
        return `select json_agg(main.*) from (

            ${q}
            
        )main`;
    }
    
    this.jsonizeKeyValue = function(q){
        return `select  pivot as key,
        format('{%s}',string_agg(format('"%s":"%s"',
                                        decoc,
                                        value), ',')):: json as value
        from
        (
            ${q}

        )main
        group by main.pivot`
        
    }
    
}

module.exports = new Queries();
