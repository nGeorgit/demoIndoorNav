graph = {}
mergeData = null
navArray = null
selectEl = document.getElementById("maps")
startEl = document.getElementById("start")
endEl = document.getElementById("end")
mapContrl = new MapContrl()

fileInp.onchange = evt => {
    const [file] = fileInp.files
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(e) {
            JSONdata = e.target.result
            JSONdata = JSON.parse(JSONdata)
            mergeData = JSONdata
            navig = new Navig(mergeData)
            mapContrl.setFloors(mergeData)
            setMapOptions(Object.keys(mergeData["floors"]))
            setPlacesOptions(Object.keys(mergeData.places))

        }
       
    }
    
}

function setMapOptions(options)
{
  for (i in options)
  {
    optEl = document.createElement("option")
    optEl.value = options[i]
    optEl.innerHTML = options[i]
    selectEl.appendChild(optEl)
  }
  mapContrl.setMap(options[0])
}

function setPlacesOptions(options)
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
  mapContrl.marker(startEl.value)
});

startEl.addEventListener("click", function() {
  mapContrl.marker(startEl.value)
});

endEl.addEventListener("change", function() {
  mapContrl.marker(endEl.value)
});

endEl.addEventListener("click", function() {
  mapContrl.marker(endEl.value)
});

function find()
{
  start = document.getElementById('start').value//"0_0_0"
  end = document.getElementById('end').value//"1_1_1"
  navig.find(start, end)
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
