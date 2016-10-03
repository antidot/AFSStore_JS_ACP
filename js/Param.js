var initParam={
  domain : "<Your domain's name>",
  acp : false,
  search: true,
  searchacp:true,
  status: "<Your status>",
  serviceId : <Your ID service>,
  maximum :6,
  AffichageMaxPertinence : 4,
  language: "fr",
}

var initParamAcp={

}

var initParamSearch={

}

var initParamSearchAcp={
  first : ["[Hh]itparade*"],
  OptionSearch :[
    "name",
  ]
}

var _AfficheOptions={
  "name": {
    name:"&name"
  },
}

var _name_element={
  "[Cc]atalog*" : {
    url : false,
    SearchFocus : true,
    label : {
      fr : "Produits_francais",
      de : "Produit_allemand",
      en: "Produits_english"
    }
  },
  "featured*" :{
    name : 'product',
    SearchFocus : true,
    label : {
      fr : 'Produits acp français',
      de : "Deutsh product",
    }
  },
  "[aA]rticle*" : {
    name : "Articles",
  },
  "facets_combinations" : {
    SearchFocus: true,
    name : "facets",
  }
}
