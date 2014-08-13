// includes
var FacetsProcesser = require('../../modules/FacetsProcesser');

//renders the d3 graph
module.exports = function EdcatDatasetsController($scope, $state, $sce) {
    // get data
    console.log('scope: ' + $scope);
    console.log('state: ' + $state);
    console.log('sce: ' + $sce);

    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/facets', function(data) {
        facetsData = FacetsProcesser.processData(data);
        // types
        types = facetsData.types;
        console.log('types: ' + types);
        // entities
        entities = facetsData.entities;
        console.log('entities: ' + entities);
        // articles
        articles = facetsData.articles;
        console.log('articles: ' + articles);
    });
};
