graph = {}
mergeData = null
navArray = null
selectEl = document.getElementById("maps")
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
            mapContrl.setFloors(mergeData["floors"])
            setMapOptions(Object.keys(mergeData["floors"]))

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
}

selectEl.addEventListener("change", function() {
  mapContrl.setMap(selectEl.value)
});

function find()
{
  start = document.getElementById('start').value//"0_0_0"
  end = document.getElementById('end').value//"1_1_1"
  navig.find(start, end)
}

function next()
{
  navig.next()
}

function prev()
{
  navig.prev()
}


