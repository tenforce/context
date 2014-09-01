// includes
var FacetsProcesser = require('../../modules/FacetsProcesser');

distillEnglish = function(title) {
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
distillEntitiesFromArticles = function( articles ){
    allEntities = []
    for( var i = 0 ; i < articles.length ; i++ )
        for( var j = 0 ; j < articles[i].entities.length ; j++ )
            allEntities.push(articles[i].entities[j]);
    return allEntities;
}

module.exports = function EdcatDatasetsController($scope, $state, $sce) {
    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/facets', function(data) {
        foundUris = []
        foundEntities = []
        var allEntities = distillEntitiesFromArticles( data.articles );
        for( var i = 0 ; i < allEntities.length ; i++ ) {
            if( $.inArray(allEntities[i].uri, foundUris) === -1 ) {
                foundEntities.push(allEntities[i]);
                foundUris.push(allEntities[i].uri)
            }
        }

        $scope.entities = foundEntities;
        
        $scope.baseURL = "localhost:8081"

        $scope.entities.map( function( entity ) {
            entity.active = true;
        } );

        $scope.toggleActive = function( item ) {
            item.active = !item.active;
            $scope.fetchDatasets();
        }

        $scope.itemActive = function( item ) {
            return item.active;
        }

        $scope.fetchDatasets = function() {
            activeEntities = []
            $scope.datasets = []
            $scope.entities.map( function( entity ) {
                if( entity.active )
                    activeEntities.push( entity );
            });
            path = "http://" + $scope.baseURL + "/edcat/context/search?" + activeEntities.map(function(entity){ return "tagIds[]=" + encodeURIComponent(entity.uri) + ""; }).join("&")
            
            console.log("Requesting " + path);

            $.getJSON(path, function(data) {
                $scope.datasets = data;
                for( var i = 0 ; i < data.length ; i++ ){
                    data[i].title = distillEnglish(data[i].title);
                    data[i].description = distillEnglish(data[i].description);
                }
                console.log("Received response for " + path);
                $state.reload();
            });
        };

        $scope.fetchDatasets();

    });
};