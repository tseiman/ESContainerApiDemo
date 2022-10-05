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