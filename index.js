var d3 = require('d3'),
    topojson = require('topojson');

module.exports = function(geojson) {

  var colors = ['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6'];

  geojson.features.map(function(d) {
    if (d.properties === undefined) { d.properties = {}; }
    return d;
  });

  function propertyTransform(feature) {
    return feature.properties;
  }

  var topology = topojson.topology({ 'collection': geojson }, { 'property-transform': propertyTransform });

  var neighbors = topojson.neighbors(topology.objects.collection.geometries),
      removed = [];

  var initialCheck = true;

  while (neighbors.length > 0) {

    var degrees = neighbors.map(function(d) {
      return d.length;
    });

    if (initialCheck && loose >= d3.min(degrees)) {
      throw 'No region has less than 5 neighbors. Therefore, this version of the five color thereom cannot be applied.';
    }

    var loose = degrees.indexOf(d3.min(degrees));

    removed.push(topology.objects.collection.geometries.splice(loose, 1)[0]);

    neighbors = topojson.neighbors(topology.objects.collection.geometries);
    initialCheck = false;

  }

  var colorsRequired = [];
  while (removed.length > 0) {

    topology.objects.collection.geometries.push(removed.pop());

    neighbors = topojson.neighbors(topology.objects.collection.geometries);

    var index = neighbors.length - 1;

    colorsRequired.push(neighbors[index].length);

    var contiguous = neighbors[index];

    var taken = [];
    contiguous.map(function(i) {
      if (topology.objects.collection.geometries[i].properties.fill) {
        taken.push(topology.objects.collection.geometries[i].properties.fill);
      }
    });
    var available = colors.filter(function(d) {
      return taken.indexOf(d) == -1;
    })

    topology.objects.collection.geometries[index].properties.fill = available[Math.floor(Math.random() * available.length)]; // assign a random fill from those colors not used by any neighbors

  }

  return topojson.feature(topology, topology.objects.collection);

}
