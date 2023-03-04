class pathNode {
    constructor(name, floorId, cords)
    {
      this.name = name
      this.floorId = floorId
      this.cords = cords
    }
  }
  
class pathEntryNode extends pathNode {
    constructor(code, floorId, cords, level, id)
    {
      super(code, floorId, cords)
      this.level = level
      this.id = id
    }
}
