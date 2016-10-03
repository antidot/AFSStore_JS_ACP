 //Error handling functions
_callbacks = {
    onError: onError,
    onTimeOut: onTimeOut
};

function onError(jqXHR, textStatus, errorThrown) { // Handle ajax errror
    console.log(textStatus);
    console.log(errorThrown);
}

function onTimeOut(xhr, textStatus, errorThrown) { // handle ajax timeout
    console.log("onTimeOut-" + textStatus);
}
var SearchLaunch = function(request) { //what happens when a search is launch
    console.log('Search is running');
    if (request != undefined && request.url != undefined) {
        window.location.href = request.url;
        return;
    }
    if (request != undefined && request.store_url != undefined)
        window.location.href = request.store_url;
}

//we look the parameters associated with the regular expression that matchs the name
Matching = function(nom) {
    if (nom != undefined && window._Feeds_Name) {
        for (key in _Feeds_Name) { //We browse every expression from the table
            if (nom.match(key)) { //If the regular expression matchef the feed, we return his parameters
                return _Feeds_Name[key];
            }
        }
    }
    console.log("there is no customize display for " + nom + " , add a regex in _Feeds_Name");
    return false;
}

//This function handle the possibility of displaying non initialized options with the defaultvalue option
GetValue = function(item, SpecialWord) {
    if (item[SpecialWord] == undefined) {
        if (_Render_Options[SpecialWord] != undefined && _Render_Options[SpecialWord].defaultvalue != undefined) {
            return CutString(_Render_Options[SpecialWord].defaultvalue, item);
        } else {
            console.log(SpecialWord + "You need to have a defaultvalue parameter for " + SpecialWord + ", there is nothing to display");
            return SpecialWord;
        }
    }
    return item[SpecialWord];
}

//the function replace &nameoftheoption by his item's value
CutString = function(text, item) {
    var index = text.indexOf("&");
    var index2 = 0;
    var Res = "";
    var Finalres;
    var Spaceindex = 0;
    while (index > -1) {
        Spaceindex = text.indexOf(" ", index + 1);
        if (Spaceindex == -1)
            Spaceindex = text.length;
        var SpecialWord = text.substring(index + 1, Spaceindex);
        var temp = text.slice(index2, index) + GetValue(item, SpecialWord);
        Res += temp;
        var index2 = Spaceindex;
        index = text.indexOf("&", Spaceindex);
    }
    if (Spaceindex > 0)
        Res += text.substring(Spaceindex);
    var ResFinal;
    (Res == "") ? ResFinal = text: ResFinal = Res;
    return ResFinal;
}

//It's a customize name for options
OptionName = function(lang, option, item) {
    if (_Render_Options[option] == undefined) {
        console.log(option + " don't have any display");
        return "";
    }

    if (_Render_Options[option].label != undefined && _Render_Options[option].label[lang] != undefined) {
        var first = _Render_Options[option].label[lang]; // the first part is specific to the language
    } else {
        var first = _Render_Options[option].name || ""; // default case
    }

    if (typeof(first) == "string") {
        var firstRes = CutString(first, item);
    } else if (typeof(first) == "function") {
        firstRes = first(item);
    } else {
        console.log("The parameter's type for " + option + " isn't handle, it must be string or function(item)");
        return item[option];
    }

    //var value = item[option] || "" ;
    return $.parseHTML(firstRes);
}

RenderAttributes = function(item, div, x) {
    if (window._Render_Options) {
        var test = false;
        for (key in _Render_Options) { //we look the parameters options
            if (item[key] != undefined) {
                z1 = $(div);
                var op = OptionName(_Globallang, key, item);
                z1.append(op);
                x.append(z1);
                test = true;
            }
        }
        if (!test) {
            x.append(item.label);
            console.log(item.label + " has nothing to display, add options on attributes in _Render_Options");
        }
        return true;
    } else {
        return false;
    }
}

FeedName = function(lang, feed) {
    if (lang != undefined && feed != undefined && feed.label != undefined && feed.label[lang] != undefined) {
        return feed.label[lang]; /// the feed name is specific to the language
    } else if (feed.name != undefined) {
        return feed.name; //if langage name isn't defined, we return the default case
    } else {
        return false;
    }
}

//Look for the language of a feed
LanguageFind = function(nom, uri) {
    var nom2 = Matching(nom); //We perform the matching
    var res;
    if (nom2 != undefined) {
        var length = nom.length;
        var name = nom2.name;
        if (nom.charAt(length - 3) == "_") { //We check if there is a specific language ( acp )
            var lang = nom.slice(length - 2, length); //We recover the language
            res = {
                matchs: nom2,
                lang: lang
            };
        } else if (uri != undefined && uri.charAt(uri.length - 3 == "_")) { //We check if there is a specific language ( acp )
            var lang = uri.slice(uri.length - 2, uri.length); //We recover the language
            res = {
                matchs: nom2,
                lang: lang
            };
        } else {
            res = {
                    matchs: nom2,
                    lang: "default"
                } //Default case
        }
        if (res.matchs['name'] == undefined) { //No parameter display
            console.log("no default display name for feed " + nom);
            res.matchs['name'] = nom;
        }
        return res;
    }
    console.log('HERE');
    res = {
            matchs: {
                name: nom
            },
            lang: "default"
        } //We build a fictional parameter
    return res; // No matching
}

//the function is useful in order to know what is the filter name of a feed
FilterFeedName = function(feed, id) {
    if (feed.match("property*")) { //A property is like property_NAMEFILTER_lang
        var temp = feed.slice(feed.search("_") + 1);
        var num = temp.search("_");
        if (num < 0)
            return temp;
        return temp.slice(0, num); //We return the name
    } else if (feed.match("[bB]rand*")) { //It's look like brand, so we return brand
        return "brand";
    } else if (feed.match("[cC]at[ée]gor*")) { //It looks like category, so we return category
        return "classification";
    } else if (feed.match("[Mm]arque")) {
        return "brand";
    } else if (feed.match("[Cc]atalog*")) {
        return "product";
    } else {
        return feed; //default case, we return the simple name of the feed
    }
}

Display_facet = function(name, deep, maxdeep) {
    if (name == undefined)
        return true;
    if (_facet_hierarchy[name] != undefined && deep != undefined && maxdeep != undefined) {
        var beginning = _facet_hierarchy[name].beginning;
        var end = _facet_hierarchy[name].end;
        if (beginning < 0) // negativity represents a count from the last object
            beginning = maxdeep + beginning + 1;
        if (end < 0)
            end = maxdeep + end + 1;
        if (deep <= end && deep >= beginning)
            return true;
        return false;

    } else {
        console.log('There is no display rules for ' + name);
        return true
    }
}

Determine_Number_Columns = function() {
    var compte = 0;
    for (var i in _Columns) {
        compte++;
    }
    return compte;
}

FindColumn = function(category) {
    for (var column in _Columns) {
        for (var i in _Columns[column]) {
            if (_Columns[column][i] == category)
                return column;
        }
    }
    return false;

}