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

module.exports = function EdcatDatasetsController($scope, $state, $sce) {

    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/facets', function(data) {
        allEntities = data.articles[0].entities;
        foundUris = []
        foundEntities = []
        for( var i = 0 ; i < allEntities.length ; i++ ) {
            if( $.inArray(allEntities[i].uri, foundUris) === -1 ) {
                foundEntities.push(allEntities[i]);
                foundUris.push(allEntities[i].uri)
            }
        }

        $scope.entities = foundEntities;
        

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
            path = "http://localhost:8081/edcat/context/search?" + activeEntities.map(function(entity){ return "tagIds[]=" + encodeURIComponent(entity.uri) + ""; }).join("&")
            
            console.log("Requesting " + path);

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
