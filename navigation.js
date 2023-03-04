
class Navig {
    constructor(data)
    {
        this.data = data
        this.graph = data.graph
        this.navArray
        this.pathD
        this.curNode = 0
        this.graphD = new GraphD(this.graph);
    }

    find(start, end)
    {
        //start = document.getElementById('start').value//"0_0_0"
       // end = document.getElementById('end').value//"1_1_1"

        this.addPlacesToGraph(start, end)

        
        this.pathD = this.graphD.findShortestPath(start, end)
        this.navArray = this.makeNav(this.getPathWithNodes(this.pathD))
        this.curNode = 0
        this.navArray[this.curNode].show()

    }

    getPathWithNodes(pathD)
    {
        let nodePath = new Array()
        start = this.data["places"][pathD[0]]
        nodePath[0] = new pathNode(pathD[0], start.floorId, start.cords)
        
        let entry
        for(i = 1; i < pathD.length -1; i++)
        {
            entry = this.data["entries"][pathD[i]]
            nodePath[i] = new pathEntryNode(pathD[i], entry.floorId, entry.cords, entry.level, entry.id)
        }

        end = this.data["places"][pathD[pathD.length - 1]]
        nodePath[pathD.length - 1] = new pathNode(pathD[pathD.length - 1], end.floorId, end.cords)

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
            navArray[k] = new navPath(mapContrl, curFloor.id, curFloor.rows, curFloor.res, curFloor.nodeSize, "Start", nodePath[l], "", nodePath[l + 1], curFloor.grid)
            l++
            k++
            } else
            {
            while(nodePath[l].floorId != nodePath[l + 1].floorId)
            {
                l++
            }
            curFloor = this.data["floors"][nodePath[l].floorId]
            navArray[k] = new navPoint(mapContrl, curFloor.id, curFloor.rows, curFloor.res, curFloor.nodeSize, "", nodePath[l])
            k++
            }
        }

        return navArray
    }

    addPlacesToGraph(start, end)
    {
        this.updateGraph(start)
        this.updateGraph(end)
    }

    updateGraph(name)
    {
        let place = this.data["places"][name]
        let costs = {}
        
        let entries = Object.keys(this.data["floors"][place.floorId]["entries"])
        let entry
        let cost
        for(let entName in entries)
        {
            entry = this.data["entries"][entries[entName]]
            cost = findPath(this.data["floors"][place.floorId].grid, place.cords.x, place.cords.y, entry.cords.x, entry.cords.y).length

            if (this.graph[name] == undefined)
            {
                this.graph[name] = {}
            }
            
            this.graph[name][entries[entName]] = cost
            this.graph[entries[entName]][name] = cost

        }

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