function showRoute(){

    let source =
    document.getElementById("source").value;

    let destination =
    document.getElementById("destination").value;

    if(source === destination){
        document.getElementById("result").innerHTML =
        "Please choose different locations.";
        return;
    }

    document.getElementById("result").innerHTML =
    `
    <strong>Route Found!</strong><br><br>
    From: ${source}<br>
    To: ${destination}<br><br>

    Estimated Distance:
    650 meters<br>

    Estimated Walking Time:
    8 minutes
    `;
}