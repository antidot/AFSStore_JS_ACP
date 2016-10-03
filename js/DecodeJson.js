/*! Antidot javascript - V1.1 - 2015-04-27
 */

(function($) {
    window.DecodeJson = function() {
        this._version = "V1.1";
    };

    DecodeJson.init = function() {

        this.setOptions = function(DecodeOptions) {
            this.facets = DecodeOptions.facets || [];
            this.Flows = DecodeOptions.Flows || [];
            this.XPATH = DecodeOptions.XPATH || {};
            if (DecodeOptions.price > -1) {
                this.price = true;
            } else {
                this.price = false;
            }

            if (DecodeOptions.store_urls > -1) {
                this.store_urls = true;
            } else {
                this.store_urls = false;
            }
            this.lang = DecodeOptions.lang || undefined;
            this.maximum = DecodeOptions.maximum || 200;
        }

        this.Handle_Prices = function(nodeattr, attribut) {
            if (nodeattr.childNodes != undefined && nodeattr.childNodes[0] != undefined && nodeattr.childNodes[0].attributes != undefined) {
                var temp = nodeattr.childNodes[0];
                var type = temp.getAttribute("type");
                if (attribut[type] == undefined || attribut[type] > nodeattr.childNodes[0].textContent) {
                    attribut['currency'] = temp.getAttribute("currency");
                    attribut[type] = nodeattr.childNodes[0].textContent;
                    for (var i = 1; i < nodeattr.childNodes.length; i++) {
                        temp = nodeattr.childNodes[i];
                        type = temp.getAttribute("type");
                        attribut[type] = nodeattr.childNodes[i].textContent;
                    }
                }
            }
        }


        this.get_item = function(attribut, xmlDoc, node, type, feed) {
            var LookForStores = false;
            if (this.store_urls && node.tagName == "store" && (attribut['store_url'] == undefined || attribut['store_url_thumbnail'] == undefined))
                var LookForStores = true;
            for (var j = 0; j < node.childNodes.length; j++) {
                var boolprice = false;
                var nodeattr = node.childNodes[j];
                var tagname = nodeattr.tagName;
                if (type == "ALL") {
                    if (nodeattr.childNodes.length > 0 && nodeattr.childNodes[0].nodeValue) {
                        attribut[tagname] = nodeattr.childNodes[0].nodeValue;
                        if (tagname == "name" && feed['types'] != "article") {
                            attribut["label"] = nodeattr.childNodes[0].nodeValue;
                        } else if (nodeattr.tagName == "title" && feed['types'] == "article") {
                            attribut["label"] = nodeattr.childNodes[0].nodeValue;
                            attribut["title"] = nodeattr.childNodes[0].nodeValue;
                        }
                    } else if (tagname == "classification") {
                        var categoryeval = nodeattr.childNodes[0];
                        while (categoryeval.childNodes.length > 0) {
                            categoryeval = categoryeval.childNodes[0];
                        }
                        attribut["category"] = categoryeval.getAttribute("label");
                    } else if (tagname == "variants") {
                        var variants = nodeattr;
                    } else if (tagname == "stores") {
                        var stores = nodeattr;
                    } else if (tagname == "prices") {
                        this.Handle_Prices(nodeattr, attribut);
                        boolprice = true;
                    } else if (tagname == "feedback") {
                        var customer = nodeattr.childNodes[0];
                        for (var j in customer) {
                            if (customer[j].tagName == "customers_rating")
                                attribut["customers_rating"] = customer[j].nodeValue;
                        }
                    }
                } else if (type == "PRICE") {
                    if (tagname == "variants") {
                        var variants = nodeattr;
                    } else if (tagname == "stores") {
                        var stores = nodeattr;
                    } else if (tagname == "prices") {
                        this.Handle_Prices(nodeattr, attribut);
                        boolprice = true;
                    }
                }
                if (LookForStores) {
                    if (tagname == "url") {
                        attribut['store_url'] = nodeattr.childNodes[0].nodeValue;
                    } else if (tagname == "url_thumbnail") {
                        attribut['store_url_thumbnail'] = nodeattr.childNodes[0].nodeValue;
                    }
                }

            }
            if (this.price) {
                if (!boolprice && variants != undefined) {
                    for (var k = 0; k < variants.childNodes.length; k++) {
                        this.get_item(attribut, xmlDoc, variants.childNodes[k], "PRICE", feed);
                    }
                } else if (!boolprice && stores != undefined) {
                    for (var k = 0; k < stores.childNodes.length; k++) {
                        this.get_item(attribut, xmlDoc, stores.childNodes[k], "PRICE", feed);
                    }
                }
            }
        }

        //the function recover the data from the xml file of a search
        this.Transform = function(strxml, type) {
            strxml = strxml.replace("<afs:trunc/>", ""); //We remove all the </trunc> because of parsing's problems
            var xmlDoc = $.parseXML(strxml); //We parse the text into xml
            var attribut = {};
            var feed = this.find_root(type); //We find the name root according to the feed
            if (!feed)
                console.log("xml error");
            for (var i = 0; i < xmlDoc.childNodes.length; i++) {
                var noderoot = xmlDoc.childNodes[i];
                this.get_item(attribut, xmlDoc, noderoot, "ALL", feed);
            }
            if (this.XPATH != undefined && window.navigator.userAgent.indexOf("MSIE") == -1 && window.navigator.userAgent.indexOf("trident/")) {
                for (var xpaths in this.XPATH) {
                    var xpath = xmlDoc.evaluate(this.XPATH[xpaths], xmlDoc, this.nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
                    var iterator = xpath.iterateNext();
                    if (iterator) {
                        attribut[xpaths] = iterator.textContent;
                    } else {
                        console.log(xpaths + " is not found for " + attribut.name);
                    }
                }
            }
            return attribut
        }

        //this function finds namespace and root name according to a feed
        this.find_root = function(type) {
            if (type == 'Catalog')
                return {
                    'types': 'product',
                    'namespace': 'store:'
                }
            if (type == "Articles")
                return {
                    'types': 'article',
                    'namespace': 'store:'
                }
            if (type == "Categories")
                return {
                    "types": 'category',
                    'namespace': 'store:'
                }
            if (type == "Stores")
                return {
                    'types': 'store',
                    'namespace': 'store:'
                }
            if (type == 'Brands')
                return {
                    'types': "brands",
                    'namespace': 'store:'
                }
            return false;
        }

        //Promote flow is specific
        this.XmlPromote = function(xml_text, name, uri, docId, res) {
            xml_text = '<root>' + xml_text + '</root>'; //the xml is bad, so we have to add a root
            console.log(xml_text);
            var xmlDoc = $.parseXML(xml_text); //Parsing of the xml
            var produit = {};
            var banner = false;
            for (var i = 0; i < xmlDoc.childNodes.length; i++) {
                var images = xmlDoc.childNodes[i];
                for (var j = 0; j < images.childNodes.length; j++) {
                    var image = images.childNodes[j];
                    if (image.tagName == "afs:type") {
                        produit['_type'] = image.textContent;
                        if (produit['_type'] != 'banner') {
                            return produit;
                        }
                    }
                    if (image.tagName == "afs:images") {
                        for (var k = 0; k < image.childNodes.length; k++) { //We browse all the children, there may have multiples product into one xml file
                            var im = image.childNodes[k];
                            if (im.hasChildNodes) {
                                for (var attr = 0; attr < im.childNodes.length; attr++) {
                                    var attributes = im.childNodes[attr];
                                    if (attributes.tagName == "afs:url")
                                        produit['url'] = attributes.childNodes[0].nodeValue;
                                    if (attributes.tagName == "afs:imageUrl")
                                        produit['imageUrl'] = attributes.childNodes[0].nodeValue;
                                }
                                console.log(produit);
                                return produit; //But we want to return only the first one
                            }
                        }
                    }
                }
            }
        }

        //add all the facets to the result table
        this.getFacets = function(json, result) {
            var facets = json.facet;
            var length = this.facets.length;
            var j = 0;
            if (this.lang != undefined)
                var lang = this.lang.toUpperCase(); // language is encoded with uppercase
            for (var param in this.facets) { //We browse the resulting facets
                var i = 0;
                while (i < facets.length && j < length) { // We browse the wanted facets, the order is important to keep the client's order
                    var facet = facets[i];
                    if (this.facets[param] == facet.id) { //We compare the id's
                        var lab = facet.labels;
                        var found = false;
                        if (lang != undefined) { //We recover the language
                            for (var k in lab) {
                                if (lab[k]['lang'] != undefined && lab[k]['lang'] == lang) { // The language is present
                                    var _category = lab[k]['label'];
                                    found = true;
                                }
                            }
                        }
                        if (!found) {
                            var _category = lab[0].label; //Default case, we take the first label
                        }
                        var node = facet.node;
                        var deep = 0; //First step, node may be a tree
                        var facetstree = []
                        var deepmax = this.nodefacet(node, facetstree, _category, deep, lang, facet.id); //The function return the max depth
                        for (var facetsnode = 0; facetsnode < facetstree.length; facetsnode++) { //We add the depth in every object returned
                            facetstree[facetsnode]["_deepmax"] = deepmax;
                            result.push(facetstree[facetsnode]); //Finally we add objects in results table
                        }
                        j++;
                    }
                    i++;
                }
            }
        }

        //recursive function to get all the facet from a facet tree, with the their depth
        this.nodefacet = function(node, result, _category, deep, lang, id) {
            if (node == undefined)
                return deep - 1; //the deepmax is the one the the calling function
            var temp = [];
            var deepfinal = deep;
            var k = 0;
            while (k < node.length && result.length < this.maximum) {
                var element = node[k];
                var obj = {};
                if (element.items != undefined)
                    obj['items'] = element.items; //We recover the number of item
                if (element.key != undefined)
                    obj['key'] = element.key; //we recover the key, usefull tu use the filter mode for search/search mode
                if (element.labels != undefined) {
                    var found = false;
                    if (lang != undefined) {
                        for (var tag in element.labels) {
                            if (element.labels[tag].lang == lang) { //the same as before, we first want a label specifid to language
                                var labelitem = element.labels[tag].label;
                                found = true;
                            }
                        }
                    }
                    if (!found) {
                        var labelitem = element.labels[0].label; //default's case
                    }
                    obj['_feedId'] = id; //its Id
                    obj['label'] = labelitem;
                    obj['name'] = labelitem;
                    obj['_category'] = _category;
                    obj['_deep'] = deep; //the depth of the object in the entire tree
                    result.push(obj);
                    var deepmax = this.nodefacet(element.node, result, _category, deep + 1, lang, id); //call of the recursive function
                    if (deepmax > deepfinal) //we update deepmax if it's greater
                        deepfinal = deepmax
                }
                k++;
            }
            return deepfinal;
        }


        //browse the result hierarchy
        this.getResults = function(json) {
            var result = [];
            console.log(json);
            if (json && json.replySet != undefined) {
                var replySet = json.replySet;
                var boolall = false;
                if (this.Flows.length != 0 && this.Flows.indexOf('AllFacets') > -1) {
                    boolall = true;
                    var resultfacet = []; //In case we want all the facets before/after all items
                } else {
                    var resultfacet = result; //In case, we want facets mixed with items
                }
                for (var object in replySet) {
                    if (replySet[object].meta != undefined && replySet[object].meta.uri != undefined) {
                        var name = replySet[object].meta.uri;
                        var reps = replySet[object].content.reply;
                        var reply = 0;
                        var floworder = false;
                        if (this.Flows != 0 && this.Flows[0] == "facets") {
                            if (this.facets.length > 0 && replySet[object].facets != undefined)
                                this.getFacets(replySet[object].facets, resultfacet); //If we want facet before his feed
                            floworder = true;
                        }
                        if (this.Flows.length == 0 || this.Flows.indexOf("feeds") > -1) {
                            while (reply < reps.length && result.length < this.maximum) { //every product content
                                if (reps[reply]['uri'] != undefined)
                                    var uri = reps[reply]['uri'];
                                if (reps[reply]['docId'] != undefined)
                                    var docId = reps[reply]['docId'];
                                var re = reps[reply].client_XML_data_ext //recovering of the xml data
                                if (re != undefined) {
                                    if (name == 'Promote') {
                                        var abrege = reps[reply];
                                        var produit = this.XmlPromote(re.contents); //Promote feed has a specific option
                                        if (abrege.abstract != undefined && abrege.abstract[0] != undefined && abrege.abstract[0].text != undefined)
                                            produit['description'] = abrege.abstract[0].text;
                                        if (abrege.abstract != undefined && abrege.title[0] != undefined && abrege.title[0].text != undefined) {
                                            produit['title'] = abrege.abstract[0].text;
                                            produit['label'] = abrege.abstract[0].text;
                                        }
                                        reply++;
                                    } else {
                                        var produit = this.Transform(re.contents, name); //We recover datas
                                    }
                                    produit._category = name; // _category contains the feed name
                                    produit.uri = uri;
                                    produit.docId = docId;
                                    result.push(produit); // add object in the result table
                                }
                                reply++;
                            }
                        }
                        if (!floworder) {
                            if (this.facets.length > 0 && replySet[object].facets != undefined)
                                this.getFacets(replySet[object].facets, resultfacet); //If we want each facet after his own feed
                        }

                    }
                }
                if (boolall) {
                    console.log()
                    if (this.Flows[0] == "AllFacets") {
                        return resultfacet.concat(result); //Facet appear before items
                    } else {
                        return result.concat(resultfacet); //facets appear after items
                    }

                }
            }
            return result;
        }

        //Handle the namespace of xpath
        this.nsResolver = function(prefix) {
            if (prefix === 'store') {
                return 'http://ref.antidot.net/store/afs#';

            } else {
                return 'http://ref.antidot.net/7.3/bo.xsd';
            }
        }


        //The function transform the json2 into an object's table
        this.Json2ToJsonP = function(json2) {
            var jsonp = [];
            var feeds = json2.feeds;
            for (var feed in json2.feeds) { //For every feed
                for (var reply in json2.feeds[feed].replies) { //Every object from every feed
                    var item = json2.feeds[feed].replies[reply];
                    var object = {
                        label: item.reply, //add a label
                        name: item.reply, //add the label as name, in order to be render in every templates
                        _category: json2.feeds[feed].name //_category is the feed name
                    };
                    if (item.metadata != undefined) {
                        for (var key in item.metadata) { //all the attributes of the acp
                            object[key] = item.metadata[key][0];
                        }
                    }
                    jsonp.push(object);
                }
            }
            return jsonp;
        }


    }
})(window.jQuery || window.Zepto);