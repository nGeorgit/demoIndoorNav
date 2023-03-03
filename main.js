pathD = new Array()
curNode = null
graph = {}
node = null
curFloorId = null
mergeData = null
navArray = null

fileInp.onchange = evt => {
    const [file] = fileInp.files
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(e) {
            JSONdata = e.target.result
            JSONdata = JSON.parse(JSONdata)
            floorsN = JSONdata.floors.length
            graph = JSONdata.graph
            mergeData = JSONdata

        }
       
    }
    
}

const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5
});

///

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

class navPoint {
  constructor(floorId, rows, res, nodeSize, text, pathNode)
  {
    this.floorId = floorId
    this.rows = rows
    this.res = res
    this.nodeSize = nodeSize
    this.text1 = text
    this.pathNode1 = pathNode
  }

  setMap()
  {
    clearMap()
    var bounds = [[0,0], [this.res.height, this.res.width]];
    var image = L.imageOverlay('demoMaps/'+ this.floorId +'.png', bounds).addTo(map);
    map.fitBounds(bounds);
  }

  show() 
  {
    this.setMap()
    L.marker(L.latLng((this.rows - this.pathNode1.cords.y) * this.nodeSize, this.pathNode1.cords.x * this.nodeSize)).addTo(map).bindPopup(this.text1);
  }

}

class navPath extends navPoint {
  constructor(floorId, rows, res, nodeSize, text1, pathNode1, text2, pathNode2, grid)
  {
    super(floorId, rows, res, nodeSize, text1, pathNode1)
    this.text2 = text2
    this.pathNode2 = pathNode2
    this.grid = grid
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
    
    console.log(result)
    for (i = 0; i < result.length; i++) {
      pol[i] = L.latLng((this.rows - result[i].y) * this.nodeSize, result[i].x * this.nodeSize )
    }
  
    //L.marker(L.latLng((formY(result[0].y)) * floor.nodeSize, result[0].x * floor.nodeSize)).addTo(map).bindPopup('a');
    L.polyline(pol).addTo(map)
  }

  show()
  {
    this.setMap()
    this.pathToPol(this.findPath())
  }

}

function getPathWithNodes(pathD)
{
  nodePath = new Array()
  start = mergeData["places"][pathD[0]]
  nodePath[0] = new pathNode(pathD[0], start.floorId, start.cords)
  
  for(i = 1; i < pathD.length -1; i++)
  {
    entry = mergeData["entries"][pathD[i]]
    nodePath[i] = new pathEntryNode(pathD[i], entry.floorId, entry.cords, entry.level, entry.id)
  }

  end = mergeData["places"][pathD[pathD.length - 1]]
  nodePath[pathD.length - 1] = new pathNode(pathD[pathD.length - 1], end.floorId, end.cords)

  return nodePath
}

function makeNav(nodePath)
{
  navArray = new Array()

  k = 0
  //curFloor = mergeData["floors"][nodePath[0].floorId]
  //navArray[k] = new navPath(nodePath[0].floorId, curFloor.rows, curFloor.res, curFloor.nodeSize, "Start", nodePath[0], "", nodePath[1], curFloor.grid)

  i = 0
  while (i < nodePath.length - 1)
  {
    if(k%2==0)
    {
      curFloor = mergeData["floors"][nodePath[i].floorId]
      navArray[k] = new navPath(curFloor.id, curFloor.rows, curFloor.res, curFloor.nodeSize, "Start", nodePath[i], "", nodePath[i + 1], curFloor.grid)
      i++
      k++
    } else
    {
      while(nodePath[i].floorId != nodePath[i + 1].floorId)
      {
        i++
      }
      curFloor = mergeData["floors"][nodePath[i].floorId]
      navArray[k] = new navPoint(curFloor.id, curFloor.rows, curFloor.res, curFloor.nodeSize, "", nodePath[i])
      k++
    }
  }

  return navArray
}

///

function find()
{
  start = document.getElementById('start').value//"0_0_0"
  end = document.getElementById('end').value//"1_1_1"

  addPlacesToGraph(start, end)

  graphD = new GraphD(graph);
  pathD = graphD.findShortestPath(start, end)
  navArray = makeNav(getPathWithNodes(pathD))
  console.log(graph)
  curNode = 0
  navArray[curNode].show()
};

function next()
{
  if (curNode != navArray.length - 1)
  {
    curNode++
    navArray[curNode].show()
  }
}

function prev()
{
  if (curNode != 0)
  {
    curNode--
    navArray[curNode].show()
  }
}

function addPlacesToGraph(start, end)
{
  updateGraph(start)
  updateGraph(end)
}

function updateGraph(name)
{
  place = mergeData["places"][name] //getPlaceFromName(name, floor)
  costs = {}
  
  entries = Object.keys(mergeData["floors"][place.floorId]["entries"])
  for(entName in entries)
  {
    entry = mergeData["entries"][entries[entName]]
    console.log(entName)
    cost = findPath(mergeData["floors"][place.floorId].grid, place.cords.x, place.cords.y, entry.cords.x, entry.cords.y).length

    if (graph[name] == undefined)
    {
      graph[name] = {}
    }
    
    graph[name][entries[entName]] = cost
    graph[entries[entName]][name] = cost 
    console.log(graph)

  }

}

function nav2D(floorId, startX, startY, endX, endY)
{
  clearMap()
  curFloor = getFloorData(floorId)
  var bounds = [[0,0], [curFloor.res.height,curFloor.res.width]];
  var image = L.imageOverlay('demoMaps/'+ floorId +'.png', bounds).addTo(map);
  map.fitBounds(bounds);
  pathToPol(findPath(curFloor.grid, startX, startY, endX, endY), floor)
}

function nav()
{
  console.log(curNode)

  if (curNode != 0 && (curNode != pathD.length - 1))
  {
    curFloorId = getFloorFromCode(pathD[curNode])
    floor = getFloorData(curFloorId)
    node = getEntry(pathD[curNode], floor)
  } else
  {
    floor = getFloorData(getFloorFromPlace(pathD[curNode]))
    node = getPlaceFromName(pathD[curNode], floor)
    curFloorId = floor.id
  }
  

  next = pathD[curNode + 1] || -1
  if (next != -1)
  {

    if (curFloorId == getFloorFromCode(next) || curNode == pathD.length-2)
    {
      nextNode = getNextNode(next)
      nav2D(curFloorId, node.cords.x, node.cords.y, nextNode.cords.x, nextNode.cords.y)
    } else
    {
      showPoint(floor, node, curNode)
    }
  } else
  {
    showPoint(floor, node, "Finish")
  }
}

function front()
{
  curNode++
  updateCurNode()
  if (pathD[curNode]!= undefined)
  {
    next = pathD[curNode + 1]
    nextNode = getNextNode(next)
    while(curNode == pathD.length-2)
    {
      
      if (curFloorId != getFloorFromCode(next))
      {
        curNode++
        updateCurNode()
        next = pathD[curNode + 1] || -1
      }else{ break}
    }
    
    nav()
  }
}

function updateCurNode()
{
  if (curNode != 0 && (curNode != pathD.length - 1))
  {
    curFloorId = getFloorFromCode(pathD[curNode])
    floor = getFloorData(curFloorId)
    node = getEntry(pathD[curNode], floor)
  } else
  {
    floor = getFloorData(getFloorFromPlace(pathD[curNode]))
    node = getPlaceFromName(pathD[curNode], floor)
    curFloorId = floor.id
  }
}

function getNextNode(next)
{
  if (curNode == pathD.length-2)
  {
    floor = getFloorData(curFloorId)
    return getPlaceFromName(pathD[curNode], floor)
  } else
  {
    floor =getFloorData(getFloorFromCode(next))
    return getEntry(next, floor)
  }
}

function clearMap()
{
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });
}

function showPoint(floor, curEnt, text)
{
  clearMap()
  var bounds = [[0,0], [floor.res.height,floor.res.width]];
  var image = L.imageOverlay('demoMaps/'+ curFloorId +'.png', bounds).addTo(map);
  map.fitBounds(bounds);
  L.marker(L.latLng((floor.rows - curEnt.cords.y) * floor.nodeSize, curEnt.cords.x * floor.nodeSize)).addTo(map).bindPopup(text);
}

function getFloorData(floorId)
{
  for (i = 0; i < floorsN; i++)
  {
    if (JSONdata.floors[i].id == floorId)
    {
      return JSONdata.floors[i]
    }
  }
}

function getFloorFromCode(code)
{
  return code.split('_')[2]
}

function getEntry(code, floor)
{
  for (i = 0; i < floor.entries.length; i++)
  {
    if ( floor.entries[i].code == code)
    {
      return floor.entries[i]
    }
  }
}

function getFloorFromPlace(name)
{
  for (i = 0; i < JSONdata.places.length; i++)
  {
    if (name == JSONdata.places[i].name)
    {
      return JSONdata.places[i].floorId
    }
  }
}

function getPlaceFromName(name, floor)
{
  //console.log(floor)
  for (i = 0; i < floor.places.length; i++)
  {
    if (name == floor.places[i].name)
    {
      return floor.places[i]
    }
  }
}

//////////
function pathTo(node) {
  var curr = node;
  var path = [];
  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }
  return path;
}

function getHeap() {
  return new BinaryHeap(function(node) {
    return node.f;
  });
}

var astar = {
  /**
  * Perform an A* Search on a graph given a start and end node.
  * @param {Graph} graph
  * @param {GridNode} start
  * @param {GridNode} end
  * @param {Object} [options]
  * @param {bool} [options.closest] Specifies whether to return the
             path to the closest node if the target is unreachable.
  * @param {Function} [options.heuristic] Heuristic function (see
  *          astar.heuristics).
  */
  search: function(graph, start, end, options) {
    graph.cleanDirty();
    options = options || {};
    var heuristic = options.heuristic || astar.heuristics.manhattan;
    var closest = options.closest || false;

    var openHeap = getHeap();
    var closestNode = start; // set the start node to be the closest if required

    start.h = heuristic(start, end);
    graph.markDirty(start);

    openHeap.push(start);

    while (openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        return pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node.
      var neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        var neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        var gScore = currentNode.g + neighbor.getCost(currentNode);
        var beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {

          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          graph.markDirty(neighbor);
          if (closest) {
            // If the neighbour is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode);
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  },
  // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
  heuristics: {
    manhattan: function(pos0, pos1) {
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    },
    diagonal: function(pos0, pos1) {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
  },
  cleanNode: function(node) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  }
};

/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 * @param {Object} [options]
 * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
 */
function Graph(gridIn, options) {
  options = options || {};
  this.nodes = [];
  this.diagonal = !!options.diagonal;
  this.grid = [];
  for (var x = 0; x < gridIn.length; x++) {
    this.grid[x] = [];

    for (var y = 0, row = gridIn[x]; y < row.length; y++) {
      var node = new GridNode(x, y, row[y]);
      this.grid[x][y] = node;
      this.nodes.push(node);
    }
  }
  this.init();
}

Graph.prototype.init = function() {
  this.dirtyNodes = [];
  for (var i = 0; i < this.nodes.length; i++) {
    astar.cleanNode(this.nodes[i]);
  }
};

Graph.prototype.cleanDirty = function() {
  for (var i = 0; i < this.dirtyNodes.length; i++) {
    astar.cleanNode(this.dirtyNodes[i]);
  }
  this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
  this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function(node) {
  var ret = [];
  var x = node.x;
  var y = node.y;
  var grid = this.grid;

  // West
  if (grid[x - 1] && grid[x - 1][y]) {
    ret.push(grid[x - 1][y]);
  }

  // East
  if (grid[x + 1] && grid[x + 1][y]) {
    ret.push(grid[x + 1][y]);
  }

  // South
  if (grid[x] && grid[x][y - 1]) {
    ret.push(grid[x][y - 1]);
  }

  // North
  if (grid[x] && grid[x][y + 1]) {
    ret.push(grid[x][y + 1]);
  }

  if (this.diagonal) {
    // Southwest
    if (grid[x - 1] && grid[x - 1][y - 1]) {
      ret.push(grid[x - 1][y - 1]);
    }

    // Southeast
    if (grid[x + 1] && grid[x + 1][y - 1]) {
      ret.push(grid[x + 1][y - 1]);
    }

    // Northwest
    if (grid[x - 1] && grid[x - 1][y + 1]) {
      ret.push(grid[x - 1][y + 1]);
    }

    // Northeast
    if (grid[x + 1] && grid[x + 1][y + 1]) {
      ret.push(grid[x + 1][y + 1]);
    }
  }

  return ret;
};

Graph.prototype.toString = function() {
  var graphString = [];
  var nodes = this.grid;
  for (var x = 0; x < nodes.length; x++) {
    var rowDebug = [];
    var row = nodes[x];
    for (var y = 0; y < row.length; y++) {
      rowDebug.push(row[y].weight);
    }
    graphString.push(rowDebug.join(" "));
  }
  return graphString.join("\n");
};

function GridNode(x, y, weight) {
  this.x = x;
  this.y = y;
  this.weight = weight;
}

GridNode.prototype.toString = function() {
  return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function(fromNeighbor) {
  // Take diagonal weight into consideration.
  if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
    return this.weight * 1.41421; // = sqr(2)
  }
  return this.weight;
};

GridNode.prototype.isWall = function() {
  return this.weight === 0;
};

function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },
  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {
    var i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    var end = this.content.pop();

    if (i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  },
  size: function() {
    return this.content.length;
  },
  rescoreElement: function(node) {
    this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];

    // When at 0, an element can not sink any further.
    while (n > 0) {

      // Compute the parent element's index, and fetch it.
      var parentN = ((n + 1) >> 1) - 1;
      var parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },
  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length;
    var element = this.content[n];
    var elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) << 1;
      var child1N = child2N - 1;
      // This is used to store the new position of the element, if any.
      var swap = null;
      var child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N];
        var child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};

//////////

function formY(y){
  return JSONdata.rows - y
}

function findPath(matrix, startX, startY, endX, endY){
  var graphA = new Graph(invers(matrix), { diagonal: true });
  var start = graphA.grid[startX][startY]
  var end = graphA.grid[endX][endY]
  var result = astar.search(graphA, start, end)
  result.unshift(start);
  

  return result
}


function pathToPol(result, floor){
  var pol = new Array()
  
  for (i = 0; i < result.length; i++) {
    pol[i] = L.latLng((floor.rows - result[i].y) * floor.nodeSize, result[i].x * floor.nodeSize )
  }

  //L.marker(L.latLng((formY(result[0].y)) * floor.nodeSize, result[0].x * floor.nodeSize)).addTo(map).bindPopup('a');
  L.polyline(pol).addTo(map)
}


function invers(matrix) {
  invMatr = new Array()

  for (i = 0; i < matrix[0].length; i++){
    invMatr[i] = new Array()
  }
  for (i = 0; i < matrix.length; i++){
    for (j = 0; j < matrix[0].length;  j++){
      invMatr[j][i] = matrix[i][j]
    }
  }
  return invMatr
}

////// dij


var GraphD = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};/////////////////////////

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],///////////////////////////////////////
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var GraphD = function (map) {
		this.map = map;
	}

	GraphD.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	GraphD.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return GraphD;

})();



//////