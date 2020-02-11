
var JSON_responce;
var id_mongo;

function toggleSidebar()
 {
   document.getElementById("sidebar").classList.toggle('active');

 }

 function adjust_textarea(h) {
    h.style.height = "20px";
    h.style.height = (h.scrollHeight)+"px";
}


window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers

var DBDeleteRequest = indexedDB.deleteDatabase("LocalDB");
var open = indexedDB.open("LocalDB", 3);


document.addEventListener('DOMContentLoaded', function() {
	pogoda_form();
	show_logged_off();
 }, false);

open.onupgradeneeded = function () {
	db = open.result;
	var objectStore = db.createObjectStore("pogoda", { keyPath: "id", autoIncrement: true });
	objectStore.createIndex("dzien", "dzien");
	objectStore.createIndex("temp", "temp");
	objectStore.createIndex("opad", "opad");
	
}

open.onsuccess = function(event) {
	var db = open.result;
}
var request;

function show_logged_in()
{
	document.getElementById('menu_login').style.display = "none";
	document.getElementById('menu_reg').style.display = "none";
	document.getElementById('menu_localdb').style.display = "none";
	document.getElementById('menu_chart').style.display = "block";
	document.getElementById('menu_form').style.display = "block";
	document.getElementById('menu_sync').style.display = "block";
	document.getElementById('menu_logout').style.display = "block";
}

function show_logged_off()
{
	document.getElementById('menu_login').style.display = "block";
	document.getElementById('menu_reg').style.display = "block";
	document.getElementById('menu_localdb').style.display = "block";
	document.getElementById('menu_chart').style.display = "none";
	document.getElementById('menu_form').style.display = "block";
	document.getElementById('menu_sync').style.display = "none";
	document.getElementById('menu_logout').style.display = "none";
}


function pogoda_form(){
document.getElementById("chartContainer").style.display="none";
	

	var form = "<div class='form-style-8'><form method='post' class = 'input'>";
	form += "<h2>Dodaj dane pogodowe</h2><input type='date' name='dzien'> Data<br>"+
			"<input type='number' name='temp'> Temperatura [°C]<br>"+
			"<input type='number' name='opad'> Opad [mm]<br>";
		
	var sID=getSessionID();	
	if(sID==""){
		form += "<input type='button' value='Dodaj' onclick='insert_local(this.form)'></div>";
		document.getElementById('content').innerHTML = form;}

	else{
		form += "<input type='button' value='Dodaj' onclick='insert_db(this.form)'></div>";
		document.getElementById('content').innerHTML = form;
	}
	
}
function insert_db(form) {
	
		var data = {};
		data.dzien = form.dzien.value;
		data.temp = form.temp.value;
		data.opad = form.opad.value;
		
		stringifiedData = JSON.stringify(data);
		requestObj = getRequestObject();
		requestObj.onreadystatechange = function () {
			if (requestObj.readyState == 4 && requestObj.status == 200) {
				JSON_responce = JSON.parse(requestObj.response);
				if (JSON_responce['status'] == 'ok') {
					alert("Pomyślnie dodano dane.");
				}
				else {
					alert("Błąd bazy danych. Nie dodano danych.");
				}
			}
			else if (requestObj.readyState == 4 && requestObj.status == 400) {
				alert("Wprowadzone dane sa niepoprawne");
			}

		}
		requestObj.open("POST", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/save", true);
		requestObj.send(stringifiedData);
	}


function insert_local(form) {
	
		var data = {};
		data.dzien = form.dzien.value;
		data.temp = form.temp.value;
		data.opad = form.opad.value;
		if(data.dzien==""||data.temp==""||data.opad==""){
			alert("Uzupełnij wszystkie okienka");
		}
		else{

		var trans = db.transaction("pogoda", "readwrite");
		var obj = trans.objectStore("pogoda");

		if(obj.put(data)){
			alert("Dodano dane do bazy przeglądarki");
		}
	}


	
}



function main_form(){

	var trans = db.transaction("pogoda");
	objectStore = trans.objectStore("pogoda");
	request = objectStore.openCursor();

	table = "<div class='table-wrapper'><table class='fl-table'>"+
	"<thead><tr><th>ID pomiaru</th><th>Data</th><th>Temperatura</th><th>Opad</th></tr></thead><tbody>";


	request.onsuccess = function(){
		let cursor = request.result;
		if (cursor) {
			let key = cursor.primaryKey;
			let dzien = cursor.value.dzien;
			let temp = cursor.value.temp;
			let opad = cursor.value.opad;
			table+="<tr><td>"+key+"</td><td>"+dzien+"</td><td>"+temp+"</td><td>"+opad+"</td></tr>";
			cursor.continue();

		}
		else{
					
			table+="</tbody></table></div>";
			document.getElementById('content').innerHTML = table;
		}
	}

	
	
}

function send_data() {
		document.getElementById("chartContainer").style.display="none";

        var trans = db.transaction("pogoda", "readwrite");
        var obj = trans.objectStore("pogoda");
        obj.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                        var data = {};
                        data.dzien = cursor.value.dzien;
                        data.temp = cursor.value.temp;
                        data.opad = cursor.value.opad;

                        stringifiedData = JSON.stringify(data);
                        requestObj = getRequestObject();

                        requestObj.onreadystatechange = function () {
                                if (requestObj.readyState == 4 && requestObj.status == 200) {
                                        JSON_responce = JSON.parse(requestObj.response);
                                        if (JSON_responce['status'] == 'ok') {
                                                alert("Dodano ");
                                        }

                                }
     					}
                        requestObj.open("POST", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/save", true);
                        requestObj.send(stringifiedData);
                        cursor.delete();
                        cursor.continue();

                }
                pogoda_form();
        };

}


function reg_form() {

   var form = "<div class='form-style-8'><form method='post' class = 'input'>";
   form += "<h2>Zarejestruj nowego użytkownika</h2><input type = 'text' name = 'nazwa' placeholder = 'login' required ><br>";
   form += "<input type = 'password' name = 'haslo' placeholder = 'hasło' required><br>";
   form += "<input type='button' value='Zarejestruj' onclick='add_user(this.form)'>";
   form += "</form>"
   document.getElementById('content').innerHTML = form;

}

function login_form(){


   var form = "<div class='form-style-8'><form method='post' class = 'input'>";
   form += "<h2>Zaloguj się</h2><input type = 'text' name = 'nazwa' placeholder = 'login' required ><br>";
	   form += "<input type = 'password' name = 'haslo' placeholder = 'hasło' required><br>";
	   form += "<input type='button' value='Zaloguj' onclick='log_user(this.form)'>";
	form += "</form>";
	   document.getElementById('content').innerHTML = form;


	  

}

function add_user(form) {

           var user = {};
           user.username = form.nazwa.value;
           user.password = form.haslo.value;
           stringifiedData = JSON.stringify(user);
           requestObj = getRequestObject();
           requestObj.onreadystatechange = function () {
                   if (requestObj.readyState == 4 && requestObj.status == 200) {
                           JSON_responce = JSON.parse(requestObj.response);
                           if (JSON_responce['status'] == 'ok') {
                                   alert("Zarejestrowano");
                           }
                           else {
                                   alert("Wprwadzony login już istnieje.");
                           }
                   }
                   
           }
           requestObj.open("POST", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/register", true);
           requestObj.send(stringifiedData);

}

function log_user(form) {

	if (form.nazwa.value == "" || form.haslo.value == "") {
		alert("Wprowadź dane.");
		return;
	}
	var user = {};
	user.username = form.nazwa.value;
	user.password = form.haslo.value;
	stringifiedData = JSON.stringify(user);
	requestObj = getRequestObject();
	requestObj.onreadystatechange = function () {
		if (requestObj.readyState == 4 && requestObj.status == 200) {
			JSON_responce = JSON.parse(requestObj.response);
			if (JSON_responce['status'] == 'ok') {
				show_logged_in();
				setSessionID(JSON_responce['sessionID']);
				alert("zalogowano");
				document.getElementById('content').innerHTML = "";
				document.getElementById("content").style.padding="0";
				pogoda_form();
			}
			else
				alert("Podano złe dane.");
		}
	}
	requestObj.open("POST", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/login", true);
	requestObj.send(stringifiedData);

}

function log_out() {
document.getElementById("chartContainer").style.display="none";
	
	document.getElementById("content").innerHTML="";
	var sID = getSessionID();
	var cookies = {};
	cookies.sessionID = sID;
	stringifiedData = JSON.stringify(cookies);
	requestObj = getRequestObject();
	requestObj.onreadystatechange = function () {
		if (requestObj.readyState == 4 && requestObj.status == 200) {
			JSON_responce = JSON.parse(requestObj.response);
			if (JSON_responce['status'] == 'ok') {
				show_logged_off();
				setSessionID('');
				alert("wylogowano");
				login_form();
			}
		}
	}
	requestObj.open("POST", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/logout", true);
	requestObj.send(stringifiedData);

}




function getdata(form) {

	document.getElementById("content").innerHTML="";
	document.getElementById("content").style.padding="0";
	document.getElementById("chartContainer").style.display="inline";

	requestObj = getRequestObject();
	requestObj.onreadystatechange = function(){
		if (requestObj.readyState == 4 && requestObj.status == 200) {
			JSON_responce = JSON.parse(requestObj.response);

			temp_arr = [];
			opad_arr = [];

			
			for (var id in JSON_responce) {

				new_date = new Date(JSON_responce[id]['dzien']); 
				date_zero = new Date(new_date.getFullYear(),new_date.getMonth(),new_date.getDate());

				temp_arr.push({ x: date_zero, y: Number(JSON_responce[id]['temp']) });
				opad_arr.push({ x: date_zero , y: Number(JSON_responce[id]['opad']) });
			}

			draw_chart(temp_arr, opad_arr);

		}
	}

	requestObj.open("GET", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/list", true);
	requestObj.send(null);
}



function draw_chart(t_data, o_data) {

	document.getElementById("chartContainer").style.display="inline";
	var trans = db.transaction("pogoda");
	objectStore = trans.objectStore("pogoda");
	request = objectStore.openCursor();


	request.onsuccess = function(){
		let cursor = request.result;
		if (cursor) {
			let key = cursor.primaryKey;
			let dzien = cursor.value.dzien;
			let temp = cursor.value.temp;
			let opad = cursor.value.opad;

			cursor.continue();

		}
	}

var chart = new CanvasJS.Chart("chartContainer", {
	animationEnabled: true,
	title:{
		text: "Średnia dzienna temperatura oraz opad"
	},
	axisX: {
		valueFormatString: "DD MMM,YY"
	},
	axisY: {
		title: "",
		includeZero: false,
		suffix: " °C/(mm/m^2)"
	},
	legend:{
		cursor: "pointer",
		fontSize: 16,
		itemclick: toggleDataSeries
	},
	toolTip:{
		shared: true
	},
	data: [{
		name: "Temperatura",
		type: "spline",
		yValueFormatString: "#0.## °C",
		showInLegend: true,
		dataPoints: t_data
	},
	{
		name: "Opad",
		type: "spline",
		yValueFormatString: "#0.## mm/m^2",
		showInLegend: true,
		dataPoints: o_data
	}]
});
chart.render();

function toggleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	}
	else{
		e.dataSeries.visible = true;
	}
	chart.render();
}

}


session();
function getRequestObject(){
   if ( window.ActiveXObject)  {
      return ( new ActiveXObject("Microsoft.XMLHTTP")) ;
   } else if (window.XMLHttpRequest)  {
      return (new XMLHttpRequest())  ;
   } else {
      return (null) ;
   }
}
function getSessionID() {
	var tmp;
	var cookies;
	cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; i++) {
		tmp = cookies[i];
		while (tmp.charAt(0) == ' ') {
			tmp = tmp.substring(1, tmp.length);
		}
		if (tmp.indexOf("sessionID=") == 0) {
			return tmp.substring("sessionID=".length, tmp.length);
		}
	}
	return '';
}


function session() {
	var arr = {};
	var sID = getSessionID();
	arr.sessionID = sID;
	stringifiedData = JSON.stringify(arr);
	requestObj = getRequestObject();
	requestObj.onreadystatechange = function () {
		if (requestObj.readyState == 4 && (requestObj.status == 200 || requestObj.status == 400)) {
			JSON_responce = JSON.parse(requestObj.response);
			if (JSON_responce['status'] == 'ok') {
				show_logged_in();
			}
			else {
			}
		}
	}
	requestObj.open("POST", "http://pascal.fis.agh.edu.pl/~7radon/projekt_TI_2/rest/session", true);
	requestObj.send(stringifiedData);
}

function setSessionID(value) {
	document.cookie = "sessionID=" + value + "; path=/";
}

