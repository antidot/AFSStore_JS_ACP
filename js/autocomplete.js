
var Antidot_Initialize = function(input, antidot, button) {
    $.support.cors = true;
    var inputname = input.slice(1);
    var results_Antidot = undefined // A result global variable
    _Cache_Antidot = {} //The variable stores requests which are already done, it's like a cache


    if (input != undefined) { //We check the input parameter
        var find = $(input);
        if (find.length == 0) {
            console.log("input not found"); //The element doesn't exist
            return;
        } else if (find[0].nodeName != "INPUT") { //We check it's an input
            console.log('The field has to be an input');
            return;
        } else {
            $(find).append('<input type="hidden" id="antidot-autocomplete2-' + inputname + '")/>'); //If it exists, we add an hidden input in order to use the second widget
            console.log('Link established between input and widget');
        }
    } else {
        console.log("An input must be given : initParam.input");
        return;
    }

    if (button) {
        $(button).click(function() { //Do the search
            console.log("keyword ressarch");
        });
    }

    $(input).catcomplete1({ //catcomplete1 a simple template
        source: function(request, response) {
            _Cache_Antidot = {}; //We reinitialize the cache every time the is a new window
            var first_time = Date.now(); //Usefull to calculate performances
            if (antidot.getSearch()) { //Method search
                console.log("Use of web-service search")
                results_Antidot = antidot.search(request.term, false);
                console.log("Time of search reception : " + (Date.now() - first_time));
            } else if (antidot.getAcp()) { //Method Acp
                console.log("Use of web-service acp");
                results_Antidot = antidot.acp(request.term);
                console.log("Time of acp reception : " + (Date.now() - first_time));
            }
            if (results_Antidot != undefined) { // We check we used a web-service
                console.log(results_Antidot);
                response(results_Antidot);
                results_Antidot = undefined;
            } else {
                console.log("no web-service is configured, add one in initParam");
            }
        },
        focus: function(event, ui) { //When one of the items is focused
            if (antidot.getSearchAcp() && ui.item._category) { //We check searchacp is activated and look if there is a feed associated to the item
                var item = ui.item;
                var category = item.category;
                var focus = Matching(item._category); //We get the matching of the item : the parameters associated to the feed
                if (focus && focus.SearchFocus) { //We check the searchfocus option is activated for this feed
                    if (focus.filter != undefined && focus.filter) { //We want to do a request with the filter mode : we want items which belong to this item (Category and brand only)
                        var query;
                        if (focus.query != undefined && focus.query) { //We check if we still want the name of the item with query's parameter
                            query = item.label;
                        } else {
                            query = "";
                        }
                        console.log("Mode Filter used");
                        var feed = item._feedId || FilterFeedName(item._category); //we recover the name used by the filter, the name is different from the one as feed
                        if (item.key != undefined) {
                            var ItemForFilter = item.key;
                        } else {
                            var ItemForFilter = item.name;
                        }
                        if (antidot.AntidotGlobalSearchWithAcp["afs:filter"] != undefined) { //If there already is some filter parameters
                            antidot.AntidotGlobalSearchWithAcp["afs:filter"].push(feed + '="' + ItemForFilter + '"'); // We add an other filter to the parameters
                            $("#antidot-autocomplete2-" + inputname).catcomplete4("search", query); //We perform the search request
                            antidot.AntidotGlobalSearchWithAcp["afs:filter"].pop(); //And return the old filter
                        } else {
                            antidot.AntidotGlobalSearchWithAcp["afs:filter"] = [];
                            antidot.AntidotGlobalSearchWithAcp["afs:filter"].push(feed + '="' + ItemForFilter + '"'); //If there is no filter, we create a filter
                            $("#antidot-autocomplete2-" + inputname).catcomplete4("search", query);
                            delete antidot.AntidotGlobalSearchWithAcp["afs:filter"]; //Finally we destroy it
                        }

                    } else {
                        $("#antidot-autocomplete2-" + inputname).catcomplete4("search", item.label); //if there is no filter mode for this feed, we do a search with the name as query

                    }
                } else {
                    $("#antidot-autocomplete2-" + inputname).catcomplete4("close"); //We manually close the second window
                }
            }
        },
        close: function(event, ui) {
            $("#antidot-autocomplete2-" + inputname).catcomplete4("close"); //We manually close the window
        },
        minLength: 2, //Minimum size of the string
        select: function(event, ui) {
            SearchLaunch(ui.item);
        },
        autoFocus: antidot.AntidotGlobalParam.autofocus,
    });

    //Used to display the searchs on the acp
    $("#antidot-autocomplete2-" + inputname).catcomplete4({
        source: function(request, response) {
            var search;
            var first_time = Date.now();
            console.log("Use of web-service search on " + request.term);
            search = antidot.search(request.term, true); //search on an acp element
            console.log("time of search reception : " + (Date.now() - first_time));
            console.log(search);
            if (search.length > 0 && search != undefined) {
                if (antidot.AntidotGlobalParam.AffichageMaxPertinence === undefined || (typeof antidot.AntidotGlobalParam.AffichageMaxPertinence === 'boolean' && initParam.AffichageMaxPertinence))
                    response(search); //if it's a true boolean, no display for the render
                if (typeof antidot.AntidotGlobalParam.AffichageMaxPertinence === 'number' && antidot.AntidotGlobalParam.AffichageMaxPertinence >= search.length)
                    response(search); //If it's a number lower than the limit, we display
            } else {
                response([]);
            }

        },
        select: function(event, ui) {
            SearchLaunch(ui.item.label);
        },
        minLength: 0, //Important in order to launch an empty request with filter mode
        position: {
            of: $("#ui-id-1"),
            my: "left top",
            at: "right top"
        }, //Position right relative to first widget
        select: function(event, ui) {
            SearchLaunch(ui.item);
        },
    });
}