var hookurl;

hookurlfunction = function() {
  hookurl = document.getElementById("webhookurlstuff").value + "/slack";
};

var username;

setUser = function() {
  username = document.getElementById("user").value;
};

var avatar;

setAvatar = function() {
  avatar = document.getElementById("avatar").value;
}


function send() {
   if (document.getElementById("content").value.length === 0) {
      return;
   }

   var msgJson = {
      username: username,
      icon_url: avatar,
      text: document.getElementById("content").value,
   };
   post(hookurl, msgJson);
   document.getElementById("content").value = "";
   alert("You have sent a message!");
}

function post(url, jsonmsg) {
   xhr = new XMLHttpRequest();
   xhr.open("POST", url, true);
   xhr.setRequestHeader("Content-type", "application/json");
   var data = JSON.stringify(jsonmsg);
   console.log("jsonmsg = ", jsonmsg);
   console.log("data = " + data);
   xhr.send(data);
   xhr.onreadystatechange = function() {
      if (this.status != 200) {
         alert(this.responseText);
      }
   };
}

$("#content").keydown(function(e) {
   if (e.keyCode == 13) {
      if (e.shiftKey) {
         // alert("Enter was pressed")
         send();
      } else {
         $(this).val($(this).val() + "\n");
      }
      return false;
   }
});
