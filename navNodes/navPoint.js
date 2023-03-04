
class navPoint {
    constructor(mapContrl, floorId, rows, res, nodeSize, text, pathNode)
    {
      this.mapContrl = mapContrl
      this.floorId = floorId
      this.rows = rows
      this.res = res
      this.nodeSize = nodeSize
      this.text = text
      this.pathNode1 = pathNode
    }
  
    show() 
    {
      this.mapContrl.setMap(this.floorId)
      L.marker(L.latLng((this.rows - this.pathNode1.cords.y) * this.nodeSize, this.pathNode1.cords.x * this.nodeSize)).addTo(this.mapContrl.map).bindPopup(this.text);
    }
  
  }