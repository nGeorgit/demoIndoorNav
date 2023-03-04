
class MapContrl {
    constructor()
    {
      this.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -5
    });
    }
  
    setFloors(data)
    {
        this.data = data
    }

    clearMap()
    {
      let tempMap = this.map
      this.map.eachLayer(function (layer) {
        tempMap.removeLayer(layer);
      });
    }
  
    setMap(floorId)
    {
      this.clearMap()
      var bounds = [[0,0], [this.data.floors[floorId].res.height, this.data.floors[floorId].res.width]];
      var image = L.imageOverlay('maps/'+ floorId +'.png', bounds).addTo(this.map);
      this.map.fitBounds(bounds);
    }

    marker(placeName)
    {
        let place = this.data.places[placeName]
        let floorId = place.floorId
        this.setMap(floorId)
        L.marker(L.latLng((this.data.floors[floorId].rows - place.cords.y) * this.data.floors[floorId].nodeSize, place.cords.x * this.data.floors[floorId].nodeSize)).addTo(this.map).bindPopup(placeName);
    }
  }