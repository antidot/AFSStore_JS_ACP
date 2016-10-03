/******************************/
/*   Global variables         */
/******************************/

var _serviceId = 50013;
var _serviceStatus = 'alpha';
var _feedName = 'SEARCH';


/******************************/
/*   Event triggers           */
/******************************/

$(document).ready(function() {
	$('#more-options-btn').click(function() {
		$('#more-options').slideToggle('slow');
	});
	$(".add-tag-button").on('click', add_tag);
	$(".checkbox").on('click', checkboxManagement);
	$("#balance-le-biniou").on('click', processValidation);
});


/******************************/
/*   Manual classification    */
/******************************/

function getElementByClass(matchClass) {
	var elems = document.getElementsByTagName('*'), i;
	for (i in elems) {
		if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ') > -1) {
			return elems[i]
		}
	}
}

function add_tag(event) {
	// find content of input of class [gwt-SuggestBox AFSW-keywords-text-box] 
	$search_box = $(".AFSW-keywords-text-box" );
	if($search_box.val() != "") {
		// add it to <ul id="chosen_tags_list" />
		$li = $("<li/>");
		$span = $("<span/>").html($search_box.val()).attr({ class: "checkbox data-classify valid" });
		$img = $("<img/>").attr({ src: "/live/images/checkbox_yes.png", title: "Invalider" });
		$list = $("#chosen_tags_list" );
		$list.append($li.append($span.prepend($img)));
		$search_box.val("");
		$search_box.focus();
	}
	return event.preventDefault();
}


/******************************/
/*   Checkboxes behaviour       */
/******************************/

function checkboxManagement (event) {
	var checkbox = $(this);
	if (checkbox.hasClass('valid')) {
		checkbox.removeClass('valid');
		checkbox.addClass('unvalid').attr('data-status', 'ko');
		$(this).children("img").attr('src', '/live/images/checkbox_no.png').attr('title', 'Valider');
	} else {
		checkbox.removeClass('unvalid');
		checkbox.addClass('valid').attr('data-status', 'ok');
		$(this).children("img").attr('src', '/live/images/checkbox_yes.png').attr('title', 'Invalider');
	}
	return event.preventDefault();
}


/******************************/
/*   Submitting content       */
/******************************/

function getBoAddress (action) {
	return "/bo-ws/service/" + _serviceId + "/instance/" + _serviceStatus + "/paf/" + _feedName + "/" + action;
}

function processValidation(event) {
	event.preventDefault();
	console.log('Validation du document');
	var contentId = getId();
	var articleData = '<article><validate>1</validate><id>' + contentId + '</id>' + getForm(['lang', 'category', 'title', 'teaser', 'content']) + '</article>';
	var enrichData = '<enrich>' + getData(['classify','entities','acc']) + '</enrich>';
	var liveData = '<live xmlns:afs="http://ref.antidot.net/v7/afs#">' + articleData + enrichData +'</live>';
	console.log(liveData);
	if (liveData) {
		var uploadUrl = getBoAddress('process') + "?afs:login=login://presales_live%2540antidot.net:presales_live@LDAP&afs:layers=CONTENTS";
		console.log('Upload URL :' + uploadUrl);
		console.log(liveData);
		$("#submit-dialog").dialog({
			 dialogClass: "no-close",
			 modal: true,
			 draggable: false,
			 resizable: false,
			 title: "Enregistrement et mise en ligne",
			 position: { my: "bottom center", at: "top center", of: "#balance-le-biniou" }
		});
		$.ajax({
			type: "POST",
			url: uploadUrl,
			enctype: 'multipart/form-data',
			data: liveData,
			cache: false,
			contentType: false,
			async: false,
			dataType: 'text',
			processData: false,
			crossDomain: true,
			success: function (code_html, statut) {
				console.log('Success : Status : ' + statut + '\nCode html : ' + code_html);
			},
			error: function (resultat, statut, erreur) {
				console.log('Erreur : Résultat : ' + resultat + '\nStatus : ' + statut + '\nErreur : ' + erreur);
				console.log(resultat);
			},
			complete: function () {
				window.setTimeout( function() { 
					window.location.href = "/live/article.html#search;filter=uri%255C2%2522" + contentId + "%2522";
					//$("#submit-dialog").dialog("close");
					}, 10000);
				
			}
		});
	}
}

function getForm(type) {
    var data = '';
    type = $(type);
    type.each(function ( index, vtype ) {
		element = $(":input[name='" + vtype + "']");
        //data += '<' + vtype + '>' + element.attr('value') + '</' + vtype + '>';
        data += '<' + vtype + '>' + element.val() + '</' + vtype + '>';
	});
    return data;
}

function getId() {
	var id = '';
    var element = $(".data-id[data-status='ok']");
	if (element.length == 0) {
		console.log("Aucun id trouvé");
		return false;
	}
    id = $(element).attr('data-id');
    return id;
}

function getData(type) {
	var data = '';
    type = $(type);
    type.each(function ( index, vtype ) {
		var elements = $(".data-" + vtype + "[data-status='ok']");
		if (elements.length == 0) {
			console.log("Aucune donnée de type " + vtype + " trouvée");
			return false;
		}
        data += '<' + vtype + '>';
        elements.each(function ( index, element ) {
            data += getDataXML(element, vtype);
        });
        data += '</' + vtype + '>';
	});
    return data;
}

function getDataXML(element, vtype) {
    if (vtype == 'id') {
        return contentId_data = $(element).attr('data-id');
    }
    if (vtype == 'classify'){
        return classif_data = '<afs:predict class_name="' + $(element).attr('data-id') + '" proba="' + $(element).attr('data-relevance') + '" />';
    }
    if (vtype == 'entities'){
        return entities_data = '<afs:entity id="' + $(element).attr('data-id') + '" type="' + $(element).attr('data-entity-type') + '" text="' + $(element).attr('data-text') + '" confidence="' + $(element).attr('data-relevance') + '" />';
    }
    if (vtype == 'live_acc'){
        return acc_data = '<live_acc><id>' + $(element).attr('data-id') + '</id>' + '<relevance>' + $(element).attr('data-relevance') + '</relevance></live_acc>';
    }
}

/******************************/
/*     qTip2 tooltip code     */
/******************************/

$('.tooltip_lang_trigger').each(function() {
    $(this).qtip({
        content: { text: $(this).next('div') },
        //style: { def: false, classes: 'qtipCustomClass' },
        position: { my: 'bottom left', at: 'top right', viewport: $(window) },
        style: { classes: 'qtip-green qtip-shadow' }
    });
});

$('.tooltip_trigger').each(function() {
    $(this).qtip({
        content: { text: $(this).next('div') },
        style: { def: false, classes: 'qtipCustomClass' },
        position: { my: 'bottom left', at: 'top right', viewport: $(window) }
    });
});
