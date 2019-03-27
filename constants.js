exports.DHIS_URL_BASE = "https://uphmis.in/uphmis";
exports.username = "admin";
exports.password = "";

exports.program_doc_diary = "Bv3DaiOd5Ai";
exports.root_ou = "v8EzhiynNtf";
exports.attr_user = "fXG73s6W4ER";


exports.views = {
    login : "login",
    calendar : "calendar",
    entry : "entry",
    loading : "loader",
    settings: "settings"
};

exports.approval_status = {

    approved : "Approved",
    autoapproved : "Auto-Approved",
    rejected : "Rejected",
    resubmitted : "Re-submitted",
    pending2 : "Pending2",
    pending1 : "Pending1"
    
}

exports.approval_usergroup_level2_code="approval2ndlevel";
exports.approval_usergroup_level1_code="approval1stlevel";

exports.report_types = {

    approved: "approved",
    pending:"pending",
    rejected : "rejected"
}

exports.approval_status_de = "OZUfNtngt0T";
exports.approval_rejection_reason_de = "CCNnr8s3rgE";

exports.query_teiWiseAttrValue = function(teis){

    
    return `select json_agg(attrvalues) as attrvals
        from(
	    select json_build_object(
                'tei',tei.uid,'attrs',
	        json_agg(
	            json_build_object(
			'attr' , tea.uid,
			'value' , teav.value
		        
		    )
	        )) as attrvalues

	    from trackedentityattributevalue teav
	    inner join trackedentityinstance tei on tei.trackedentityinstanceid = teav.trackedentityinstanceid
	    inner join trackedentityattribute tea on tea.trackedentityattributeid = teav.trackedentityattributeid
	    where tei.uid in (${teis} )	
	    group by tei.uid
        )endofQ`
}

exports.cache_curr_user = "dd_current_user";
exports.cache_user_prefix = "dd_user_";
exports.cache_program_metadata = "dd_program_metadata";

exports.disabled_fields = [
    'OZUfNtngt0T',
    'CCNnr8s3rgE'
];

exports.required_fields = [
    'x2uDVEGfY4K'
]

