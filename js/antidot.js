/*! Antidot javascript - V1.1 - 2015-04-27
 */

(function($) {
    window.Antidot = function() {
        this._version = "V1.1";
    };


    //Initialisation des paramètres
    Antidot.init = function(options) {

        this.setParamAcp = function(initParamAcp) {
            if (initParamAcp != undefined) {
                this.AntidotGlobalAcp = initParamAcp; //parameters used by the acp
            } else {
                this.AntidotGlobalAcp = {};
            }
        }

        this.setParamSearch = function(initParamSearch) {
            if (initParamSearch != undefined) {
                this.AntidotGlobalSearch = initParamSearch; //parameters used by simple search used like acp
            } else {
                this.AntidotGlobalSearch = {};
            }
        }

        this.setParamSearchAcp = function(initParamSearchAcp) {
            if (initParamSearchAcp != undefined) {
                this.AntidotGlobalSearchWithAcp = initParamSearchAcp; //parameters used by search on an item focused
            } else {
                this.AntidotGlobalSearchAcp = {};
            }
        }

        if (options.common == undefined) {
            options.common = {};
        }
        this.decode = new DecodeJson.init();
        this.timeOut = options.common.timeOut || 1500; //the timeout in the ajax request
        if (options.common.domain != undefined) {
            this.domain = options.common.domain;
        } else {
            console.log("Error- Add your domain name");
        }
        this.maximum = options.common.maximum || 50;
        this.setParamAcp(options.acp);
        this.setParamSearch(options.search);
        this.setParamSearchAcp(options.searchacp);

        this.BoolSearch = options.common.search || false;
        this.BoolAcp = options.common.acp || false;
        this.BoolSearchAcp = options.common.searchacp || false;

        this.AntidotGlobalParam = {};
        this.AntidotGlobalParam['autofocus'] = options.common.autofocus || false;
        //*****************************************************************
        //Initialiation des paramètres communs à l'acp et aux searchs
        if (options.common.language != undefined) {
            this.AntidotGlobalParam["lang"] = options.common.language;
        } else {
            console.log("No langage is defined, same product in multiple langages may appear");
        }

        if (options.common.siteOrigin != undefined)
            this.AntidotGlobalParam["siteOrigin"] = options.common.siteOrigin;
        if (options.common.serviceId != undefined) {
            this.AntidotGlobalParam["service"] = options.common.serviceId;
        } else {
            console.log('Error- Add your service id');
        }
        if (options.common.status != undefined) {
            this.AntidotGlobalParam["status"] = options.common.status;
        } else {
            console.log('Error - Add your service status');
        }
        if (options.common.key != undefined)
            this.AntidotGlobalParam["key"] = options.common.key;
        if (options.common.sessionId != undefined)
            this.AntidotGlobalParam["sessionId"] = options.common.sessionId;
        if (options.common.userId != undefined)
            this.AntidotGlobalParam["userId"] = options.common.userId;

        //*****************************************************************

        this.getParamAcp = function() {
            return this.AntidotGlobalAcp;
        }
        this.getParamSearch = function() {
            return this.AntidotGlobalSearch;
        }
        this.getParamSearchAcp = function() {
            return this.AntidotGlobalSearchAcp;
        }

        this.getSearch = function() {
            return this.BoolSearch;
        }
        this.getAcp = function() {
            return this.BoolAcp;
        }
        this.getSearchAcp = function() {
            return this.BoolSearchAcp;
        }


        //Method Acp
        this.acp = function(query) {
            var urlCall = this.domain + "/acp?";
            urlCall = this.construct_acp(query, urlCall); //Construction of the url
            var res = this.handle_cache(urlCall); //We look for its presence in the cache
            if (!res) {
                res = this.decode.Json2ToJsonP(this.ajaxCall(urlCall, "GET", "")); //We perform an ajax request, then transform the flow into a jsonp flow
                _Cache_Antidot[urlCall] = res; //We update the cache
            }
            return res;
        };

        //the function buil an acp url with parameters of the object
        this.construct_acp = function(query, urlCall) {
            if (query != undefined && query != "") { //Add the query to the url
                urlCall = urlCall + "afs:query=" + escape(query);
            }
            if (this.AntidotGlobalAcp != undefined) {
                for (param in this.AntidotGlobalAcp) { //We browse every parameters of the acp
                    for (arg in this.AntidotGlobalAcp[param]) { //Add all of them
                        urlCall += "&" + param + "=" + escape(this.AntidotGlobalAcp[param][arg]); // escape to avoid parameters like & or ""
                    }
                }

                if (this.AntidotGlobalParam != undefined) { //Add the common parameters of search and acp
                    for (params in this.AntidotGlobalParam) {
                        urlCall = urlCall + "&afs:" + params + "=" + escape(this.AntidotGlobalParam[params]); // escape to avoid parameters like & or ""
                    }
                }
                urlCall += "&afs:log=liveQuery&afs:output=json,2"; //We log the search and automatically add the output
            }
            return urlCall;
        }

        //Method search
        this.search = function(query, type) { // the type is true if it's a search on a focused item
            var urlCall = this.domain + "/search?";
            if (type) {
                this.AntidotGlobalSearchAcp = this.AntidotGlobalSearchWithAcp;
            } else {
                this.AntidotGlobalSearchAcp = this.AntidotGlobalSearch;
            }
            var DecodeOptions = {};
            this.MajOptions(DecodeOptions);
            DecodeOptions["XPATH"] = this.AntidotGlobalSearchAcp.XPATH;
            DecodeOptions.facets = this.AntidotGlobalSearchAcp.facets;
            DecodeOptions.Flows = this.AntidotGlobalSearchAcp.Flows;
            DecodeOptions.lang = this.AntidotGlobalParam.lang;
            DecodeOptions.maximum = this.maximum;
            urlCall = this.construct_search(query, urlCall); //Construction of the url
            var res = this.handle_cache(urlCall); //Look if the request is already in the cache
            if (!res) {
                this.decode.setOptions(DecodeOptions);
                res = this.decode.getResults(this.ajaxCall(urlCall, "GET", "")); //We perform an ajax request with the url, then we transform the flow into a jsonp flow
                _Cache_Antidot[urlCall] = res; //We update the cache
            }
            return res;
        }

        this.MajOptions = function(DecodeOptions) {
            if (this.AntidotGlobalSearchAcp.OptionSearch != undefined) {
                DecodeOptions.price = this.AntidotGlobalSearchAcp.OptionSearch.indexOf("price");
                DecodeOptions.store_urls = this.AntidotGlobalSearchAcp.OptionSearch.indexOf("store_urls");
            } else {
                DecodeOptions.price = -1;
                DecodeOptions.store_urls = -1;
            }
        }

        //the function build a search's url
        this.construct_search = function(query, urlCall) {
            var first = true;
            if (query != undefined && query != "") { //We add the query to the url
                first = false
                urlCall = urlCall + "afs:query=" + escape(query);
            }
            if (this.AntidotGlobalParam != undefined) { //We add common parameters
                for (params in this.AntidotGlobalParam) {
                    if (first) {
                        first = false;
                        urlCall = urlCall + "afs:" + params + "=" + this.AntidotGlobalParam[params];
                    } else {
                        urlCall = urlCall + "&afs:" + params + "=" + this.AntidotGlobalParam[params];
                    }
                }
            }
            for (param in this.AntidotGlobalSearchAcp) {
                if (param != "OptionSearch" && param != "facets" && param != "Flows" && param != "XPATH") {
                    for (arg in this.AntidotGlobalSearchAcp[param]) { //We add all the parameters specific to the choosen search
                        if (first) {
                            first = false;
                            urlCall = urlCall + "afs:" + params + "=" + escape(this.AntidotGlobalParam[params]);
                        } else {
                            urlCall += "&" + param + "=" + escape(this.AntidotGlobalSearchAcp[param][arg]);
                        }
                    }
                }
            }
            urlCall += "&afs:log=navQuery&afs:output=json"; //We log with navquery
            return urlCall;
        }


        //On effectue la requete ajax vers le serveur antidot
        this.ajaxCall = function(urlCall, method, data) {
            var dataResJson;
            console.log(urlCall + " is sent");
            try {
                var request = $.ajax({
                    url: urlCall,
                    type: method,
                    async: false, //it works only in synchronize
                    data: data,
                    dataType: "json",
                    success: function(result, textStatus, jqXHR) {
                        dataResJson = result;
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        if (textStatus == "timeout") {
                            if (_callbacks != undefined && _callbacks.onTimeOut != undefined) {
                                _callbacks.onTimeOut(xhr, textStatus, errorThrown);
                            }
                        } else {
                            if (_callbacks != undefined && _callbacks.onError != undefined) {
                                _callbacks.onError(xhr, textStatus, errorThrown);
                            }
                        }
                        dataResJson = [];
                    }
                });
                //}
            } catch (err) {
                console.log("exception");
                _callbacks.onError(err);
                dataResJson = [];
            }
            return dataResJson;
        };


        //Check the presence of a result in the cache
        this.handle_cache = function(urlCall, type) {
            if (_Cache_Antidot[urlCall] != undefined) {
                console.log(urlCall + " found in the cache");
                return _Cache_Antidot[urlCall];
            }
            return false;
        }



    };


})(window.jQuery || window.Zepto);