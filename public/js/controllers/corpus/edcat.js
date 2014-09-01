// includes
var FacetsProcesser = require('../../modules/FacetsProcesser');

var distillEnglish = function(title) {
    if( !title )
        return ""
    for( var i = 0 ; i < title.length ; i++ ) {
        if( (typeof title[i] != "string")
            && title[i]["en"] ){
            return title[i]["en"];
        }
    }
    for( var i = 0 ; i < title.length ; i++ ) {
        if( typeof title[i] == "string" )
            return title[i];
    }
    return title;
}

// returns all entities for the supplied array of articles
var distillEntitiesFromArticles = function( articles ){
    var allEntities = []
    for( var i = 0 ; i < articles.length ; i++ )
        for( var j = 0 ; j < articles[i].entities.length ; j++ )
            allEntities.push(articles[i].entities[j]);
    return allEntities;
}

// removes duplicate entities from an array of entities
var removeDuplicateEntities = function( entities ){
    var foundEntities = [];
    var foundUris = [];
    for( var i = 0 ; i < entities.length ; i++ ) {
        if( $.inArray(entities[i].uri, foundUris) === -1 ) {
            foundEntities.push(entities[i]);
            foundUris.push(entities[i].uri);
        }
    }
    return foundEntities;
}

// filters all active entities from a set of entities.
var filterActive = function( entities ){
    var activeEntities = [];
    entities.map( function( entity ) {
        if( entity.active )
            activeEntities.push( entity );
    });
    return activeEntities;
}

// activates a set of entities
var activateEntity = function( entity ){
    entity.active = true;
}

// Constructs the query URL based on the base host and the currently active entities.
var buildEdcatUrl = function( baseURL, activeEntities ) {
    var optionString = activeEntities.map(function(entity){
        return "tagIds[]=" + encodeURIComponent(entity.uri) + "";
    }).join("&");
    var basePath = "http://" + baseURL + "/edcat/context/search";
    return basePath + "?" + optionString;
}

module.exports = function EdcatDatasetsController($scope, $state, $sce) {
    $scope.toggleActive = function( item ) {
        item.active = !item.active;
        $scope.fetchDatasets();
    }

    $scope.itemActive = function( item ) {
        return item.active;
    }

    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/facets', function(data) {
        var foundEntities = removeDuplicateEntities( distillEntitiesFromArticles( data.articles ) );

        $scope.entities = foundEntities;
        $scope.baseURL = "localhost:8081"
        $scope.entities.map( activateEntity );

        $scope.fetchDatasets = function() {
            $scope.datasets = []
            path = buildEdcatUrl( $scope.baseURL ,  filterActive( $scope.entities ) );
            $.getJSON(path, function(data) {
                $scope.datasets = data;
                for( var i = 0 ; i < data.length ; i++ ){
                    data[i].title = distillEnglish(data[i].title);
                    data[i].description = distillEnglish(data[i].description);
                }
                $state.reload();
            });
        };

        $scope.fetchDatasets();

    });
};
