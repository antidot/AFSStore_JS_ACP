 //template 1 order the result with categories ( feed with customize name )
$.widget("custom.catcomplete1", $.ui.autocomplete, {
    _create: function() {
        this._super();
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        this.menu._isDivider = function(item) { //remove the dividers even when there is just a picture
            return false;
        }
    },
    _renderItem: function(ul, item) {
        var li = $("<li>");
        li.text(item.label);
        return li;
    },
    _renderMenu: function(ul, items) {
        ul.addClass('ulAcp');
        var tabcategory = {}; //Stores categories which already exist, it allows to avoid to see multiple times the name of one category when the default case language activates
        var that = this;
        var currentCategory;
        var nombre = 0;
        $.each(items, function(index, item) {
            if (initParam['maximum'] != undefined && nombre >= initParam['maximum']) //Useless, maximum is already handle when the API extract data
                return false;
            var li;
            var temp = LanguageFind(item._category, item.uri);
            _Globallang = temp.lang; //We recover the language
            var matchs = temp.matchs; //We recover the matching
            var category = FeedName(_Globallang, matchs); //The name of the feed according to the match
            if (tabcategory[category]) {
                li = that._renderItemData(ul, item) //The category already exists, we add after it
                if (Display_facet(item._feedId, item._deep, item._deepmax)) //If the facet value has to be rendered or not, true if it's not a facet
                    $("#Antidot-category-id-" + item._category + "-" + category).after(li);
            } else {
                if (category != undefined && category != currentCategory) { //The category doesn't exist, we create it
                    ul.append("<li class='ui-autocomplete-category' id='Antidot-category-id-" + item._category + "-" + category + "''>" + category + "</li>");
                    tabcategory[currentCategory] = true;
                }
                li = that._renderItemData(ul, item)
                if (Display_facet(item._feedId, item._deep, item._deepmax)) //If the facet value has to be rendered or not, true if it's not a facet
                    ul.append(li);
            }
            currentCategory = category;
            if (category == "Meilleurs résultats") { //the css change if it's the hitparade
                li.addClass("Antidot-LiHitParade");
            }
            nombre++;
        });
    },
    _resizeMenu: function() {
        this.menu.element.outerWidth(350); // Size of the window
    }
});




//Template 2 show attributes
$.widget("custom.catcomplete2", $.ui.autocomplete, {
    _create: function() {
        this._super();
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        this.menu._isDivider = function(item) {
            return false;
        }
    },
    _renderItem: function(ul, item) {
        var x = $("<li>");
        var z1 = "<div class='attributesli'>";
        var attr = RenderAttributes(item, z1, x); //render the attributes set in _Affiche_Options with attributesli class
        if (!attr) {
            x.text(item.label);
        }
        return x;
    },
    _renderMenu: function(ul, items) {
        ul.addClass('ulAcp');
        var that = this;
        var tabcategory = {};
        var currentCategory;
        var nombre = 0;
        $.each(items, function(index, item) {
            if (initParam['maximum'] != undefined && nombre >= initParam['maximum'])
                return false;
            var li;
            var temp = LanguageFind(item._category, item.uri);
            _Globallang = temp.lang;
            var matchs = temp.matchs;
            var category = FeedName(_Globallang, matchs);
            if (tabcategory[category]) {
                li = that._renderItemData(ul, item)
                if (Display_facet(item._feedId, item._deep, item._deepmax)) //If the facet value has to be rendered or not, true if it's not a facet
                    $("#Antidot-category-id-" + item._category + "-" + category).after(li);
            } else {
                if (category != undefined && category != currentCategory) {
                    tabcategory[currentCategory] = true;
                    ul.append("<li class='ui-autocomplete-category' id='Antidot-category-id-" + item._category + "-" + category + "''>" + category + "</li>");
                    currentCategory = category;
                }
                li = that._renderItemData(ul, item)
                if (Display_facet(item._feedId, item._deep, item._deepmax)) //If the facet value has to be rendered or not, true if it's not a facet
                    ul.append(li);
            }
            if (category == "Meilleurs résultats") {
                li.addClass("Antidot-LiHitParade");
            }
            nombre++
        });
    },
    _resizeMenu: function() {
        this.menu.element.outerWidth(350); // Size of the window
    }
});



// Improve render, particularly add pictures of object
$.widget("custom.catcomplete3", $.ui.autocomplete, {
    _create: function() {
        this._super();
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        this.menu._isDivider = function(item) {
            return false;
        }
    },
    _renderItem: function(ul, item) {
        var x = $("<li>");
        var z = $("<div class='Antidot-LiItem Antidot-LiTexte'></div>");
        var z1 = "<div class='Antidot-attributesli'>";
        if (item["url_thumbnail"] != undefined || item["imageUrl"] != undefined || item["store_url_thumbnail"] != undefined) {
            var y = $("<div></div>");
            x.append(y);
            y.addClass('Antidot-ItemSearchAcp');
            if (item["url_thumbnail"] != undefined) {
                var image = item["url_thumbnail"];
            } else if (item["imageUrl"] != undefined) {
                var image = item["imageUrl"];
            } else {
                var image = item["store_url_thumbnail"];
            }
            if (item._type != "banner") {
                y.append("<div class='Antidot-LiItem Antidot-LiImage'><img class='Antidot-picture' alt='img' src='" + image + "'/></div>");
                y.append(z);
            } else {
                y.append("<div class='Antidot-LiItem Antidot-LiBanner'><img class='Antidot-picture' alt='img' src='" + image + "'/></div>");
            }
        } else {
            x.append(z);
        }
        var attr = RenderAttributes(item, z1, z); //
        if (!attr) {
            z.text(item.label);
        }

        return x;
    },
    _renderMenu: function(ul, items) {
        ul.addClass('ulAcp');
        var that = this;
        var tabcategory = {};
        var currentCategory;
        var nombre = 0;
        $.each(items, function(index, item) {
            if (initParam['maximum'] != undefined && nombre >= initParam['maximum'])
                return false;
            if (item != undefined) {
                var li;
                var temp = LanguageFind(item._category, item.uri);
                _Globallang = temp.lang;
                var matchs = temp.matchs;
                var category = FeedName(_Globallang, matchs);
                if (tabcategory[category]) {
                    li = that._renderItemData(ul, item);
                    if (Display_facet(item._feedId, item._deep, item._deepmax)) //If the facet value has to be rendered or not, true if it's not a facet
                        $("#Antidot-category-id-" + item._category + "-" + category).after(li);
                } else {
                    if (category != undefined && category != currentCategory) {
                        tabcategory[currentCategory] = true;
                        ul.append("<li class='ui-autocomplete-category' id='Antidot-category-id-" + item._category + "-" + category + "''>" + category + "</li>");
                        currentCategory = category;
                    }
                    li = that._renderItemData(ul, item);
                    if (Display_facet(item._feedId, item._deep, item._deepmax)) //If the facet value has to be rendered or not, true if it's not a facet
                        ul.append(li).data("ui-selectmenu-item", item);
                }
                if (category == "Meilleurs résultats") {
                    li.addClass("Antidot-LiHitParade");
                }
            }
            nombre++;
        });
    },
    _resizeMenu: function() {
        this.menu.element.outerWidth(350);
    }
});

// the fourth template enables columns mode
$.widget("custom.catcomplete4", $.ui.autocomplete, {
    _create: function() {
        this._super();
        this.widget().menu("option", "items", "> div > div > :not(.ui-autocomplete-category)");
        this.menu._isDivider = function(item) {
            return false;
        }
    },
    _renderItem: function(ul, item) {
        var x = $("<li>");
        var z = $("<div class='Antidot-LiItem Antidot-LiTexte'></div>");
        var z1 = "<div class='Antidot-attributesli'>";
        if (item["url_thumbnail"] != undefined || item["imageUrl"] != undefined || item["store_url_thumbnail"] != undefined) {
            var y = $("<div class='Antidot-ItemSearchAcp'></div>");
            x.append(y);
            if (item["url_thumbnail"] != undefined) {
                var image = item["url_thumbnail"];
            } else if (item["imageUrl"] != undefined) {
                var image = item["imageUrl"];
            } else {
                var image = item["store_url_thumbnail"];
            }
            if (item._type != "banner") {
                y.append("<div class='Antidot-LiItem Antidot-LiImage'><img class='Antidot-picture' alt='img' src='" + image + "'/></div>");
                y.append(z);
            } else {
                y.append("<div class='Antidot-LiItem Antidot-LiBanner'><img class='Antidot-picture' alt='img' src='" + image + "'/></div>");
            }

        } else {
            x.append(z);
        }
        var attr = RenderAttributes(item, z1, z); //
        if (!attr) {
            console.log("No customize render for " + item.label + ", default display applied");
            z.text(item.label);
        }
        return x;
    },
    _renderMenu: function(ul, items) {
        if (items.length < 1)
            return false;
        ul.addClass('ulAcp');
        var ulid = ul[0].attributes.id.value;
        var that = this;
        var tabcategory = {};
        var currentCategory;
        var nombre = 0;
        var number_columns = Determine_Number_Columns();
        if (number_columns < 1)
            return false;
        for (var compte = 1; compte <= number_columns; compte++) {
            ul.append("<div class='Antidot-Columns' id='Antidot-columns-id-" + compte + "-" + ulid + "'></div>");
        }
        $.each(items, function(index, item) {
            if (initParam['maximum'] != undefined && nombre >= initParam['maximum'])
                return false;
            if (item != undefined) {
                var li;
                var temp = LanguageFind(item._category, item.uri);
                _Globallang = temp.lang;
                var matchs = temp.matchs;
                var category = FeedName(_Globallang, matchs);
                if (tabcategory[category] == undefined && category != undefined && category != currentCategory) {
                    tabcategory[currentCategory] = true;
                    var column = FindColumn(item._category);
                    if (!column) {
                        console.log(item._category + " hasn't any column.");
                        return;
                    }
                    var categ = $("<div class='Antidot-category'></div>").attr('id', 'Antidot-category-id-' + item._category + "-" + ulid);
                    categ.append("<li class='ui-autocomplete-category'>" + category + "</li>");
                    $("#Antidot-columns-id-" + column + "-" + ulid).append(categ);
                    currentCategory = category;
                }
                li = that._renderItemData(ul, item);
                if (Display_facet(item._feedId, item._deep, item._deepmax)) { //If the facet value has to be rendered or not, true if it's not a facet
                    $("#Antidot-category-id-" + item._category + "-" + ulid).append(li);
                }
                if (category == "Meilleurs résultats") {
                    li.addClass("Antidot-LiHitParade");
                }
            }
            nombre++;
        });
    },
});

$.widget("custom.catcomplete5", $.ui.autocomplete, {
    _create: function() {
        this._super();
        console.log(this.widget().menu("option", "items"));
        this.widget().menu("option", "items", "> div > :not(.ui-autocomplete-category)");
        this.menu._isDivider = function(item) {
            return false;
        }
    },
    _renderItem: function(ul, item) {
        var x = $("<li>");
        var z = $("<div class='Antidot-LiItem Antidot-LiTexte'></div>");
        var z1 = "<div class='Antidot-attributesli'>";
        if (item["url_thumbnail"] != undefined || item["imageUrl"] != undefined || item["store_url_thumbnail"] != undefined) {
            var y = $("<div></div>");
            x.append(y);
            y.addClass('Antidot-ItemSearchAcp');
            if (item["url_thumbnail"] != undefined) {
                var image = item["url_thumbnail"];
            } else if (item["imageUrl"] != undefined) {
                var image = item["imageUrl"];
            } else {
                var image = item["store_url_thumbnail"];
            }
            if (item._type != "banner") {
                y.append("<div class='Antidot-LiItem Antidot-LiImage'><img class='Antidot-picture' alt='img' src='" + image + "'/></div>");
                y.append(z);
            } else {
                y.append("<div class='Antidot-LiItem Antidot-LiBanner'><img class='Antidot-picture' alt='img' src='" + image + "'/></div>");
            }
        } else {
            x.append(z);
        }
        var attr = RenderAttributes(item, z1, z); //
        if (!attr) {
            z.text(item.label);
        }

        return x;
    },
    _renderMenu: function(ul, items) {
        ul.addClass('ulAcp');
        var ulid = ul[0].attributes.id.value;
        var that = this;
        var tabcategory = {};
        var currentCategory;
        var nombre = 0;
        $.each(items, function(index, item) {
            if (initParam['maximum'] != undefined && nombre >= initParam['maximum'])
                return false;
            if (item != undefined) {
                var li;
                var temp = LanguageFind(item._category, item.uri);
                _Globallang = temp.lang;
                var matchs = temp.matchs;
                var category = FeedName(_Globallang, matchs);
                if (tabcategory.category == undefined && category != undefined && category != currentCategory) {
                    tabcategory[currentCategory] = true;
                    var categ = $("<div class='Antidot-category'></div>").attr('id', 'Antidot-category-id-' + item._category + "-" + ulid);
                    categ.append("<li class='ui-autocomplete-category'>" + category + "</li>");
                    ul.append(categ);
                    currentCategory = category;
                }
                li = that._renderItemData(ul, item);
                if (Display_facet(item._feedId, item._deep, item._deepmax)) { //If the facet value has to be rendered or not, true if it's not a facet
                    $(" #Antidot-category-id-" + item._category + "-" + ulid).append(li);
                }
                if (category == "Meilleurs résultats") {
                    li.addClass("Antidot-LiHitParade");
                }
            }
            nombre++;
        });
    },
});