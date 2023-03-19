
class navPath extends navPoint {
    constructor(mapContrl, floorId, rows, res, nodeSize, text, pathNode1, pathNode2, grid)
    {
      super(mapContrl, floorId, rows, res, nodeSize, text, pathNode1)
      this.pathNode2 = pathNode2
      this.grid = grid
      this.path = this.findPath()
    }
  
    findPath(){
      var graphA = new Graph(invers(this.grid), { diagonal: true });
      var start = graphA.grid[this.pathNode1.cords.x][this.pathNode1.cords.y]
      var end = graphA.grid[this.pathNode2.cords.x][this.pathNode2.cords.y]
      var result = astar.search(graphA, start, end)
      result.unshift(start);
      
      return result
    }
  
    pathToPol(result){
      var pol = new Array()
      
      for (i = 0; i < result.length; i++) {
        pol[i] = L.latLng((this.rows - result[i].y) * this.nodeSize, result[i].x * this.nodeSize )
      }
    
      L.polyline(pol, {"weight": 15, "opacity": 0.8}).addTo(this.mapContrl.map)
    }
  
    show()
    {
      this.mapContrl.setMap(this.floorId)
      this.pathToPol(this.path)
    }
  
  }