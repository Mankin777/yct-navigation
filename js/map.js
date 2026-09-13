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
    const YCT_college = {
        lat: 6.5170,
        lng: 3.3760
    };
    const YCT_Library = {
    lat: 6.5182,
    lng: 3.3752
};

const YCT_Toilet1 = {
    lat: 6.5163,
    lng: 3.3750
};

const YCT_toilet2 = {
    lat: 6.5178,
    lng: 3.3772
};

const YCT_toilet3 = {
    lat: 6.5167,
    lng: 3.3768
};

const YCT_toilet4 = {
    lat: 6.5158,
    lng: 3.3775
};

const YCT_Engineering_Building = {
    lat: 6.5180,
    lng: 3.3778
};

const YCT_Science_Complex = {
    lat: 6.5158,
    lng: 3.3748
};

const YCT_New_Building = {
    lat: 6.5190,
    lng: 3.3765
};

const YCT_ArtsComplex = {
    lat: 6.5150,
    lng: 3.3760
};

const YCT_Front_Gate = {
    lat: 6.5162,
    lng: 3.3738
};

const YCT_Back_Gate = {
    lat: 6.5188,
    lng: 3.3782
};

const YCT_sports_complex = {
    lat: 6.5145,
    lng: 3.3745
};

const YCT_Sports_Complex_FrontGate = {
    lat: 6.5140,
    lng: 3.3755
};

const YCT_Sports_Complex_BackGate = {
    lat: 6.5150,
    lng: 3.3738
};

const YCT_FoodTechBuilding = {
    lat: 6.5138,
    lng: 3.3770
};

const YCT_FoodVillage = {
    lat: 6.5160,
    lng: 3.3790
};

const YCT_Bashirus_cafe = {
    lat: 6.5190,
    lng: 3.3748
};

const YCT_BuzyMan_cafe = {
    lat: 6.5148,
    lng: 3.3785
};

const YCT_Female_Hostel = {
    lat: 6.5195,
    lng: 3.3775
};

const YCT_Male_Hostel = {
    lat: 6.5138,
    lng: 3.3758
};

const YCT_bursary = {
    lat: 6.5175,
    lng: 3.3740
};

const YCT_college_building = {
    lat: 6.5165,
    lng: 3.3780
};

const YCT_chapel_centers = {
    lat: 6.5185,
    lng: 3.3738
};

const YCT_MultiPurpose_Hall = {
    lat: 6.5155,
    lng: 3.3778
};

const YCT_Microfinance_Bank = {
    lat: 6.5178,
    lng: 3.3790
};

const YCT_ETF_building = {
    lat: 6.5190,
    lng: 3.3785
};

    var options = {
        zoom:17,
        center:YCT_college
    }

    const map = new google.maps.Map(document.getElementById("map"), options);

    // listen to clicks on the map and create automatic markers wherever clicked on the map
    google.maps.event.addListener(map, 'click', function(event){
        addMarker({coordinates: event.latLng});
    });

    //this works but was commmented out for a better idea of creating various markers, than manually being DRY

    /*
    var marker1 = new google.maps.Marker({
        position:YCT_college,
        map:map,
        title:"YABATECH",
        icon:"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
    });

    var infoWindow = new google.maps.infoWindow({content: "<h1>YABATECH</h1>"});

    marker1.addListener(onclick, function(){
    infoWindow.open(map, marker1);
     });
     */

     //array of markers
     var markers = [
{coordinates: YCT_college, iconImage: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", title: "YABATECH", content: "<h1>YABA_TECH</h1>"},
{coordinates: YCT_Library},
{coordinates: YCT_Toilet1},
{coordinates: YCT_toilet2},
{coordinates: YCT_toilet3},
{coordinates: YCT_toilet4},
{coordinates: YCT_Engineering_Building},
{coordinates: YCT_Science_Complex},
{coordinates: YCT_New_Building},
{coordinates: YCT_ArtsComplex},
{coordinates: YCT_Front_Gate},
{coordinates: YCT_Back_Gate},
{coordinates: YCT_sports_complex},
{coordinates: YCT_Sports_Complex_FrontGate},
{coordinates: YCT_Sports_Complex_BackGate},
{coordinates: YCT_FoodTechBuilding},
{coordinates: YCT_FoodVillage},
{coordinates: YCT_Bashirus_cafe},
{coordinates: YCT_BuzyMan_cafe},
{coordinates: YCT_Female_Hostel},
{coordinates: YCT_Male_Hostel},
{coordinates: YCT_bursary},
{coordinates: YCT_college_building},
{coordinates: YCT_chapel_centers},
{coordinates: YCT_MultiPurpose_Hall},
{coordinates: YCT_Microfinance_Bank},
{coordinates: YCT_ETF_building}
];

for (var i = 0; i< markers.length; i++){
    addMarker(markers[i]);
}



function addMarker(props){
var marker1 = new google.maps.Marker({
        position:props.coordinates,
        map:map,
      //  title: props.title,
        //icon: props.iconImage
    });
//clears and prevents undefined variables and checks for custom icon
    if(props.iconImage){
        marker1.setIcon(props.iconImage);
    }
//checks for custom title and if absent...
    if(props.title){
        marker1.setTitle(props.title);
    }
    //check content
    if(props.content){
        var infoWindow = new google.maps.InfoWindow({content: props.content});
    marker1.addListener('click', function(){
    infoWindow.open(map, marker1);
     });
        // why not marker1.setContent(props.content);
    }
}






//call addMarker functions for various markers, it relaxes variable coordinate, in addMarker function created below
/*
addMarker({coordinates: YCT_college, iconImage: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", title: "YABATECH", content: "<h>YABA_TECH</h>"} );
addMarker({coordinates: YCT_Library});
addMarker({coordinates: YCT_Toilet1});
addMarker({coordinates: YCT_toilet2});
addMarker({coordinates: YCT_toilet3});
addMarker({coordinates: YCT_toilet4});
addMarker({coordinates: YCT_Engineering_Building});
addMarker({coordinates: YCT_Science_Complex});
addMarker({coordinates: YCT_New_Building});
addMarker({coordinates: YCT_ArtsComplex});
addMarker({coordinates: YCT_Front_Gate});
addMarker({coordinates: YCT_Back_Gate});
addMarker({coordinates: YCT_sports_complex});
addMarker({coordinates: YCT_Sports_Complex_FrontGate});
addMarker({coordinates: YCT_Sports_Complex_BackGate});
addMarker({coordinates: YCT_FoodTechBuilding});
addMarker({coordinates: YCT_FoodVillage});
addMarker({coordinates: YCT_Bashirus_cafe});
addMarker({coordinates: YCT_BuzyMan_cafe});
addMarker({coordinates: YCT_Female_Hostel});
addMarker({coordinates: YCT_Male_Hostel});
addMarker({coordinates: YCT_bursary});
addMarker({coordinates: YCT_college_building});
addMarker({coordinates: YCT_chapel_centers});
addMarker({coordinates: YCT_MultiPurpose_Hall});
addMarker({coordinates: YCT_Microfinance_Bank});
addMarker({coordinates: YCT_ETF_building});

// add marker function
function addMarker(props){
var marker1 = new google.maps.Marker({
        position:props.coordinates,
        map:map,
      //  title: props.title,
        //icon: props.iconImage
    });
//clears and prevents undefined variables and checks for custom icon
    if(props.iconImage){
        marker1.setIcon(props.iconImage);
    }
//checks for custom title and if absent...
    if(props.title){
        marker1.setTitle(props.title);
    }

    //check content
    if(props.content){
        var infoWindow = new google.maps.InfoWindow({content: "<h1>YABATECH</h1>"});

    marker1.addListener(onclick, function(){
    infoWindow.open(map, marker1);
     });
        // why not marker1.setContent(props.content);
    }
}*/
}






