let mapLoaded = false;

function loadMap(){

    document.getElementById("placeholder").style.display = "none";

    document.getElementById("map").style.display = "block";

    if(!mapLoaded){
       initMap();
        mapLoaded = true;
    }
}

async function initMap(){

    const coordinates = {
        lat: 6.5170,
        lng: 3.3760
    };

    const map = new google.maps.Map(
        document.getElementById("map"),
        {
            zoom:17,
            center:coordinates
        }
    );

    new google.maps.Marker({
        position:coordinates,
        map:map,
        title:"YABATECH"
    });

    
}






