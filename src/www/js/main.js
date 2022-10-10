/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Client side - runs the javscript to obtain data from the 
 * server via WebSocket and updates the HTML accordingly
 * Handles as well GUI events
 *
 * -------------------------------------------------------------- */

var data = {};

var loc = window.location;
var wss = new WebSocket((loc.protocol === "https:" ? "wss://" : "ws://") + loc.host + "/event");
wss.onmessage = function (event) {
    data = JSON.parse(event.data);
    console.log(data);

    Object.keys(data).forEach(function(k){
//        console.log(k);
/*
                <thead>
                    <tr>
                      <th>SSID</th>
                      <th>Encryption</th>
                      <th>Selected</th>
                      <th>Bands</th>
                    </tr>
                </thead>
                */


        var bandshtml = "<span>";
        var bandIndex = 0;
        for(band in data[k].bands) {
            ++bandIndex;
            bandshtml += `<span>Ch: ${data[k].bands[band].channel}</span><span>(${data[k].bands[band].band === "2400"? "2.4Ghz" : "5Ghz" })</span><span class="material-symbols-outlined signal-bars">signal_cellular_${data[k].bands[band].bars > 4 ? 4 : data[k].bands[band].bars}_bar</span><span class="${bandIndex < Object.keys(data[k].bands).length ? "channelseparator" : ""}"></span>`;

        }
        bandshtml += "</span>"
        
        var selected = `<span class="material-symbols-outlined wifi-connected">${data[k].selected ? "link" : "link_off"}</span>`




        if($("#row_" + k).length) {


            $("#row_" + k).html(`<td>${data[k].ssid}</td><td>${data[k].security_mode}</td><td>${selected}</td><td>${bandshtml}</td>`);
            $('#ssidTable').find('tr').each(function() { 
                if(!data.hasOwnProperty($(this).attr('data-id'))) {
                    console.log($(this)); 
                    $(this).remove();
                }
            });

        } else {
            $('#ssidTable').append(`<tr id="row_${k}" class="clickable-row" data-id="${k}" data-ssid="${data[k].ssid}"><td>${data[k].ssid}</td><td>${data[k].security_mode}</td><td>${selected}</td><td>${bandshtml}</td></tr>`);
        }

        $(".clickable-row").click(function() {
            $("#configpage-title").text($(this).data("ssid"));
            $("#mainpage").fadeOut(500, () => { $("#configpage").show(); });
        })


    });


}

jQuery(document).ready(function($) {
    $(".clickable-row").click(function() {
        $("#configpage-title").text($(this).data("ssid"));

        $("#mainpage").fadeOut(500, () => { $("#configpage").show(); });

       
        console.log($(this).data("ssid"));
    });


    $("#closeconfig").click(function() {
         $("#configpage").fadeOut(500, () => { $("#mainpage").show(); });
    });
});

