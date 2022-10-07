// Helper function to escape HTML, so no XSS is possible

/* var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};
function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}
function addMessage(txt) {
    var messages = document.getElementById('messages');
    messages.innerHTML += txt + '<br>';
    messages.scrollTop = messages.scrollHeight;
}

// Connect via WebSocket
var loc = window.location;
var wss = new WebSocket((loc.protocol === "https:" ? "wss://" : "ws://") + loc.host + "/event");

// Output messages received via WebSocket
wss.onmessage = function (event) {
console.log(event);
    addMessage(escapeHTML(event.data));
}

// Send message via WebSocket
function messageSubmit() {
    var txt = document.getElementById('messageSend').value;
    document.getElementById('messageSend').value = '';

    addMessage('<font color="#999999">' + escapeHTML(txt) + '</font>');
    wss.send(txt);
    return false;
}
console.log("uhhh ?");
*/

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
        if($("#row_" + k).length) {
            $("#row_" + k).html(`<td>${data[k].ssid}</td><td>${data[k].security_mode}</td><td>${data[k].selected}</td><td></td></tr>`);
            $('#ssidTable').find('tr').each(function() { 
                if(!data.hasOwnProperty($(this).attr('data-id'))) {
                    console.log($(this)); 
                    $(this).remove();
                }
            });



        } else {
            $('#ssidTable').append(`<tr id="row_${k}" class="clickable-row" data-id="${k}" data-ssid="${data[k].ssid}"><td>${data[k].ssid}</td><td>${data[k].security_mode}</td><td>${data[k].selected}</td><td></td></tr>`);
        }

        $(".clickable-row").click(function() {
            $("#configpage-title").text($(this).data("ssid"));
            $("#mainpage").fadeOut(500, () => { $("#configpage").show(); });
        })


    });

/*     $('#ssidTable').append(`<tr id="R${++rowIdx}">
          <td class="row-index text-center">
                <p>Row ${rowIdx}</p></td>
           <td class="text-center">
            <button class="btn btn-danger remove" 
                type="button">Remove</button>
            </td>
           </tr>`);
*/

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