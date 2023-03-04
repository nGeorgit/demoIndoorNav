
class MapContrl {
    constructor()
    {
      this.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -5
    });
    }
  
    setFloors(floors)
    {
        this.floors = floors
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
      var bounds = [[0,0], [this.floors[floorId].res.height, this.floors[floorId].res.width]];
      var image = L.imageOverlay('maps/'+ floorId +'.png', bounds).addTo(this.map);
      this.map.fitBounds(bounds);
    }
  }