
class Navig {
    constructor(data)
    {
        this.data = data
        this.graph = JSON.parse(JSON.stringify(data.graph));
        this.curNode = 0
        this.graphD = new GraphD(this.graph)
        this.navArray
        this.pathD
        this.start
        this.end
    }

    find()
    {
        this.graph = JSON.parse(JSON.stringify(this.data.graph));
        this.graphD = new GraphD(this.graph)
        this.addStartAndEnd()
        
        this.pathD = this.graphD.findShortestPath(this.start.type, this.end.type)
        this.navArray = this.makeNav(this.getPathWithNodes(this.pathD))
        this.curNode = 0
        this.navArray[this.curNode].show()
    }
    
    getPathWithNodes(pathD)
    {
        let nodePath = new Array()
        nodePath[0] = new pathNode(pathD[0], this.start.floorId, this.start.cords, this.start.name)

        let entry
        for(i = 1; i < pathD.length -1; i++)
        {
            entry = this.data["entries"][pathD[i]]
            nodePath[i] = new pathEntryNode(pathD[i], entry.floorId, entry.cords, entry.level, entry.id, entry.type)
        }
        nodePath[pathD.length - 1] = new pathNode(pathD[pathD.length - 1], this.end.floorId, this.end.cords, this.end.name)

        return nodePath
    }



    makeNav(nodePath)
    {
        navArray = new Array()

        let curFloor
        let k = 0
        let l = 0
        while (l < nodePath.length - 1)
        {
            if(k%2==0)
            {
                curFloor = this.data["floors"][nodePath[l].floorId]
                let text = "Go from " + nodePath[l].text + " to " + nodePath[l + 1].text
                navArray[k] = new navPath(mapContrl, curFloor.id, curFloor.rows, curFloor.res, curFloor.nodeSize, text, nodePath[l], nodePath[l + 1], curFloor.grid)
                l++
                k++
            } else
            {
                let direction
                if(nodePath[l].floorId > nodePath[l + 1].floorId)
                {
                    direction = "down"
                } else
                {
                    direction = "up"
                }
                let nFloors = 0
                while(nodePath[l].floorId != nodePath[l + 1].floorId)
                {
                    l++
                    nFloors++
                }

                curFloor = this.data["floors"][nodePath[l].floorId]
                let text = "Go " + direction + " " + nFloors  + " floor/s"
                navArray[k] = new navPoint(mapContrl, curFloor.id, curFloor.rows, curFloor.res, curFloor.nodeSize, text, nodePath[l])
                k++
            }
        }
        return navArray
    }

    addStartAndEnd()
    {
        this.updateGraph(this.start)
        this.updateGraph(this.end)
        if (this.end.floorId == this.start.floorId)
        {
            let cost = findPath(this.data["floors"][this.start.floorId].grid, this.start.cords.x, this.start.cords.y, this.end.cords.x, this.end.cords.y).length
            this.graph[this.start.type][this.end.type] = cost
            this.graph[this.end.type][this.start.type] = cost
        }
    }

    updateGraph(place)
    {
        let costs = {}
        
        let entries = Object.keys(this.data["floors"][place.floorId]["entries"])
        let entry
        let cost
        for(let entName in entries)
        {
            entry = this.data["entries"][entries[entName]]
            cost = findPath(this.data["floors"][place.floorId].grid, place.cords.x, place.cords.y, entry.cords.x, entry.cords.y).length

            if (this.graph[place.type] == undefined)
            {
                this.graph[place.type] = {}
            }
            
            this.graph[place.type][entries[entName]] = cost
            this.graph[entries[entName]][place.type] = cost

        }
    }

    getText()
    {
        return this.navArray[this.curNode].text
    }

    next()
    {
        if (this.curNode != this.navArray.length - 1)
        {
            this.curNode++
            this.navArray[this.curNode].show()
        }
    }

    prev()
    {
        if (this.curNode != 0)
        {
            this.curNode--
            this.navArray[this.curNode].show()
        }
    }
}