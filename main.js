graph = {}
mergeData = null
navArray = null
selectEl = document.getElementById("maps")
startEl = document.getElementById("start")
endEl = document.getElementById("end")
mapEl = document.getElementById("map")
mapContrl = new MapContrl()

mergeData = JSON.parse(strMergeData)
navig = new Navig(mergeData)
mapContrl.setNavig(navig)
setMapOptions(mergeData["floors"])
setPlacesOptions(Object.keys(mergeData.places))


function setMapOptions(options) //set floors on the drop down menu and show [0] map
{
  for (i in Object.keys(options))
  {
    console.log(options[i])
    optEl = document.createElement("option")
    optEl.value = options[i].id
    optEl.innerHTML = options[i].name
    selectEl.appendChild(optEl)
  }
  mapContrl.setMap(0)
}

function setPlacesOptions(options) //set places on the drop down menu
{
  for (i in options)
  {
    optEl = document.createElement("option")
    optEl.value = options[i]
    optEl.innerHTML = options[i]
    endEl.appendChild(optEl)
    startEl.appendChild(optEl.cloneNode(true))
  }
}

selectEl.addEventListener("change", function() {
  mapContrl.setMap(selectEl.value)
});

startEl.addEventListener("change", function() {
  eventOption(startEl)
  if (startEl.value == "setPoint") {
    mapContrl.start = true
    mapContrl.newPoint = true
  }
});

startEl.addEventListener("click", function() {
  eventOption(startEl)
});

endEl.addEventListener("change", function() {
  eventOption(endEl)
  if (endEl.value == "setPoint") {
    mapContrl.start = false
    mapContrl.newPoint = true
  }
});

endEl.addEventListener("click", function() {
  eventOption(endEl)
});

function eventOption(selEl)
{
  if(selEl.id == "start")
  {
    mapContrl.start = true
  } else
  {
    mapContrl.start = false
  }
  if (selEl.value != "setPoint")
  {
    mapContrl.markerFromPlace(selEl.value)
  }
  selectEl.value = mapContrl.curFloor
}

function find()
{
  start = document.getElementById('start').value//"0_0_0"
  end = document.getElementById('end').value//"1_1_1"
  navig.find()
  setOrder(navig.getText())
}

function next()
{
  navig.next()
  setOrder(navig.getText())
}

function prev()
{
  navig.prev()
  setOrder(navig.getText())
}

function setOrder(text)
{
  orderEl = document.getElementById("order")
  orderEl.innerHTML = text
}

map.addEventListener("click", function(e) {
  mapContrl.setMarker(e)
})