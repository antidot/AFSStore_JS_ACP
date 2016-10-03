


// Globals parameters used by all methods
var initParam = {
	acp: false,								//Use of a simple acp
	search: true,							//Use of a simple search
	searchacp: true,						//use of a search on a focused item, don't forget to add a search focus into _name_element
	serviceId: 7195,						//Id magento Pprod
	status: "rc",							//magen pprod
	//domain: "http://magento-demo-pprod.afs-antidot.net",//Domain name
	language : "fr",
	//domain : "http://localhost/afs1",
	domain : "http://localhost/afs1",
	timeOut: 100,							//Response delay
	AffichageMaxPertinence : true,			//maximum number of product in order to know if we display the items
	maximum : 7,							// Limit the number of product rendered
}

//Attributes to render with customize name
_AfficheOptions={					//the order is important
	"name" : { 
		name: "&name",
	},
	"stock" : {
		name : "Stocks : &stock", // default name for option "stock"
		label: {
			fr : function(item){
				if(item.stock < 5){
					return "Plus que "+item.stock+" en stock !";
				}
			},
			de : "Deutsch stock",	// name if the language if deusch
		}
	},
	"PRICE_FINAL" : {
		//name: "&PRICE_FINAL &currency <s>&PRICE_CUT &currency </s>",  // & indicate that's a reference to an object from _AfficheOptions, it has to end after keyword
		name : function(item){
			if(item.PRICE_CUT != undefined && item.PRICE_FINAL < item.PRICE_CUT){
				return item.PRICE_FINAL+" "+item.currency+" instead of <s>"+item.PRICE_CUT+" "+item.currency+"</s>" ;
			}
			return item.PRICE_FINAL+" "+item.currency ;
		},
	},
	"title" : {
		name:"&title",
	},
	"text" : {
		name: ""
	},
	"docId":{
		//name : "The Id document is ",
	},
	"key":{
		name : "Key of the facet is &key"
	},
	"currency" :{
		defaultvalue : "&currency",
	},
	"PRICE_CUT" :{
		defaultvalue : "&PRICE_FINAL &currency",
	},
}

// _name_element associate a regular expression of a feed to an objet
_name_element={
	"[Cc]atalog*" : { 
		name : "Produits",				//Default name
		SearchFocus : true,				//we perform a search if an item of catalog match feed is focused
		filter : false,					//the result is filtered on the item's name, default is  : filter : false, query : true
		query : true,					//the item's name is in the query parameter
		label : {						//Labels specidif to language
			fr: "Produits",				//Label for french language
			de : "Produits_de",			//Label for deutsch language
		}			
	},
	"[Hh]itparade*": { 
		name : "Meilleurs résultats",
		SearchFocus : true					
	},
	"[Cc]at[ée]gorie*" : { 
		name : "Catégories",
		SearchFocus : true,
		filter : true,
		query : false					
	},
	"featured*": {
		name : "Produits",
		SearchFocus : true 
	},
	"[Pp]ropert*": {
		name : "Propriétés",
		filter : true,
		query : false,
		SearchFocus : true
	},
	"brand*": {
		name : "Marques",
		SearchFocus : true,
		filter:true ,
		query:false
	},
	"[Pp]romote": {
		name : "",
		SearchFocus : false
		
	},
	"stores*":{
		name : "Magasins",
	},
	"[Aa]rticle*":{
		name : "Articles",
	},
	"facet*":{
		name : "Facette",
	},
	"Marque":{
		SearchFocus :true ,
		filter: true ,
	},
	"Couleur":{
		SearchFocus:true ,
		filter: true
	},
	"format":{
		SearchFocus:true ,
		filter: true,
	},
}

//What hierarchy of a facet we want to render
_facet_hierarchy={
	"format" : {
		beginning : 0, //The root to the second stage
		end : 2,
	},
	"classification" :{
		beginning : -1, // The last but one to the last one, -1 represents the greater depth of a facet
		end :-1,	
	},
	"brand": {
		beginning : 0, // All the node of the tree
		end : -1,
	},
}

//Options used by acp method
var initParamAcp={
	"afs:feedOrder": ["hitparade_fr"], //pprod hitparade_fr, hitparade_exactQuery eliquide
	"afs:feed": ["hitparade_fr","featured_products_2_fr","stores_fr","categories_fr", "brands_fr"],
	"afs:replies": [3],							
}

//options used by search on focuse's items
var initParamSearchAcp={
	"afs:feed": ["Catalog"],									
	"afs:output": ["json"],												
	"afs:replies": [5],										
	"afs:filter":['store="2"'],
	//filter: 'RsistancesModles="Simba"'
	first : ["[Hh]it*", "[Cc]atalog*"],				//The order of regulars expression's feed we want to examinate in order to perform a search as soon as the first window is opened
	OptionSearch: [									//More attibute we want to find
	  "price",										//price will find the minimum price available
	  "store_urls",									//store_urls will find url and urlimage of the first store found
	],
	XPATH : {
	  	gender : "/store:product/store:audience/store:genders/store:gender",
	  },
}

//Parameters used for simple search
var initParamSearch={
	"afs:replies": [3],
	//Available data for Flows : AllFacets, facets, feeds
	Flows : ["feeds","facets"],					//order of a feed/flow, if Flow is initialized with without "feeds" inside, only facets will appear
	facets : ["format", "classification","brand" ], // the order of the facets wanted is important
	"afs:facetDefault" : ["replies=1","maxDepth=1"],
	"afs:facet" : ["classification,replies=2"],
	XPATH : {
	  	gender : "/store:product/store:audience/store:genders/store:gender",
	  },
	 OptionSearch:[
	 	"price",
	 ]
}


