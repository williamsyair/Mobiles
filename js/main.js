// JavaScript Document

/* 
* sistema de logs 
*/
var i_log = 0;
function mkLog(text){
	var date = new Date();
	var txt = i_log + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + text;
	i_log++;
	console.log(txt);
	//$("#log").append(txt  + "<br>");
}



/* 
* variables de la aplicación
*/
	var existe_db
	var db
	


/* 
* carga inicial de la app
*/
function onBodyLoad() {    
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady(){
	mkLog("Aplicación cargada y lista");
    //navigator.notification.alert("PhoneGap is working");
	
	if(!detectDevice()){
	  navigator.notification.alert("El sistema operativo de su dispositivo no permite ejecutar esta aplicación");
  }else{
	  
			existe_db = window.localStorage.getItem("existe_db");
			db = window.openDatabase("agenda_curso", "1.0", "DB del curso Phonegap", 200000);
			if(existe_db == null){
				creaDB();
			}else{
				cargaDatos();
			}
			
			
			$("#b_guardar").click(function(e){
				if($.id != -1){
					saveEditForm();
				 }else{
					saveNewForm();
				 }
			 });
			 
			 
			  $("#btn_buscar").click(function(e){
				findContact();
			 });
			 
			 //preparamos los elementos activos de la app
			  $("#btnGetCamara").click(function(e){
				e.stopPropagation();
					navigator.camera.getPicture( cameraSuccess, cameraError, { quality : 50,
																destinationType : Camera.DestinationType.FILE_URI,
																sourceType : Camera.PictureSourceType.CAMERA,
																allowEdit : true,
																encodingType: Camera.EncodingType.JPEG,
																			  saveToPhotoAlbum: true 
				} );
			});
			
			$("#btnGetLibrary").click(function(e){
				e.stopPropagation();
					navigator.camera.getPicture( cameraSuccess, cameraError, { quality : 50,
																destinationType : Camera.DestinationType.FILE_URI,
																sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
																allowEdit : true,
																encodingType: Camera.EncodingType.JPEG,
																saveToPhotoAlbum: true 
				} );
			});
			
			$("#btn_enviar_mail").click(function(e){
				sendMail();
			 });
  }
}


function detectDevice(){
	var plataforma = device.platform;
	var modelo = device.model;
	var version = device.version;
	mkLog(plataforma + " montado sobre " + modelo + " con SO " + version);
	if(plataforma == "Android"){
		if(version < 2.2){
			return false;
		}
	}else if(plataforma == "iOS"){
		if(version < 4){
			return false;
		}
	}else if(plataforma.indexOf("Win") != -1){
		
	}
	return true;
}




/* 
* creación de ña base de datos
*/
function creaDB(){
	db.transaction(creaNuevaDB, errorDB, creaSuccess);
	
}

function creaNuevaDB(tx){
	mkLog("Creando base de datos");
	
	tx.executeSql('DROP TABLE IF EXISTS agenda_curso');
	
	var sql = "CREATE TABLE IF NOT EXISTS agenda_curso ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"nombre VARCHAR(50), " +
		"apellidos VARCHAR(50), " +
		"telefono VARCHAR(30), " +
		"categoria VARCHAR(30), " +
		"foto VARCHAR(200), " + 
		"email VARCHAR(30) )";
		
	tx.executeSql(sql);
	
	tx.executeSql("INSERT INTO agenda_curso (id,nombre,apellidos,telefono,categoria,foto,email) VALUES (1,'José','Pérez','+34566222666','amigo','','paco@paco.com')");
	tx.executeSql("INSERT INTO agenda_curso (id,nombre,apellidos,telefono,categoria,foto,email) VALUES (2,'Siro','González','+34555434567','familia','','siro@test.com')");
	tx.executeSql("INSERT INTO agenda_curso (id,nombre,apellidos,telefono,categoria,foto,email) VALUES (3,'Julio','Rodríguez','+34756222666','trabajo','','julio@test.com')");
	
}


function creaSuccess(){
	window.localStorage.setItem("existe_db", 1);
	cargaDatos();
}

function errorDB(err){
	mkLog("Error procesando SQL " + err.code);
	navigator.notification.alert("Error procesando SQL " + err.code);
}



/* 
* carga de datos desde la base de datos
*/
function cargaDatos(){
	db.transaction(cargaRegistros, errorDB);
}

function cargaRegistros(tx){
	mkLog("Cargando registros de la base de datos");
	tx.executeSql('SELECT * FROM agenda_curso', [], cargaDatosSuccess, errorDB);
}

function cargaDatosSuccess(tx, results){
	mkLog("Recibidos de la DB " + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros");
		navigator.notification.alert("No hay contactos en la base de datos");
	}
	
	for(var i=0; i<results.rows.length; i++){
		var persona = results.rows.item(i);
		var selector = $("#lista_" + persona.categoria + " ul");
		var foto = persona.foto;
		if(foto == ""){
			foto = "assets/no_foto.png";
		}
		selector.append('<li id="li_'+persona.id+'"><a href="#detalle" data-uid='+persona.id+' class="linkDetalles"><div class="interior_lista"><img src="'+ foto +'" class="img_peq"/><span>' + persona.nombre + ' ' + persona.apellidos+ '</span></div></a><a href="#form"  data-theme="a" data-uid='+persona.id+'  class="linkForm">Predet.</a></li>').listview('refresh');
	}
	
	$(".linkDetalles").click(function(e){
		$.id = $(this).data("uid");
	});
	
	$(".linkForm").click(function(e){
		$.id = $(this).data("uid");
	});
}




/*
* vista detalle
*/

$(document).on("pagebeforeshow", "#detalle", function(){
	if(db != null){
		db.transaction(queryDBFindByID, errorDB);
	}
});



function queryDBFindByID(tx) {
    tx.executeSql('SELECT * FROM agenda_curso WHERE id='+$.id, [], queryDetalleSuccess, errorDB);
}

function queryDetalleSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista detalle" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista detalle");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	$("#categoria").html($.registro.categoria);
		var _foto = $.registro.foto;
		if(_foto == ""){
			_foto = "assets/no_foto.png";
		}
		$("#foto_img").attr("src", _foto);
		$("#nombre").html($.registro.nombre + " " + $.registro.apellidos);
		$("#num_tel").html($.registro.telefono);
		$("#telefono").attr("href", "tel:" + $.registro.telefono);
		$("#label_mail").html("Mail: " + $.registro.email);
}





/*
* vista detalle
*/
//vista de la página de edición
$(document).on('pagebeforeshow', '#form', function(){ 
	mkLog('ID recuperado en vista form: ' + $.id);
	
	initForm();
	if(db != null && $.id != -1){
		db.transaction(queryDBFindByIDForm, errorDB);
	}else if($.idContact != -1 && $.id == -1){
		$.registro = $.contacts[$.idContact];
		$("#ti_nombre").val($.contacts[$.idContact].nombre);
		 $("#ti_telefono").val($.contacts[$.idContact].telefono);
		$("#ti_mail").val($.contacts[$.idContact].email);
		$.idContact = -1;
	}
});
	
	
	
function queryDBFindByIDForm(tx) {
    tx.executeSql('SELECT * FROM agenda_curso WHERE id='+$.id, [], queryFormSuccess, errorDB);
}

function queryFormSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista Form" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista form");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	
		$.imageURL = $.registro.foto;
		if($.imageURL == ""){
			$.imageURL = "assets/no_foto.png";
		}
		$("#fotoEdit_img").attr("src", $.imageURL);
		$("#ti_nombre").val($.registro.nombre);
		$("#ti_apellidos").val($.registro.apellidos);
		$("#ti_telefono").val($.registro.telefono);
		$("#ti_mail").val($.registro.email);
		
		$("#cat_"+$.registro.categoria).trigger("click").trigger("click");	//$("#cat_"+$.registro.categoria).attr("checked",true).checkboxradio("refresh");
}
$(document).on('pagebeforeshow', '#home', function(){ 
	$.id = -1;
});
function initForm(){
	$.imageURL = "assets/no_foto.png";
	
	$("#fotoEdit_img").attr("src", $.imageURL);
	$("#ti_nombre").val("");
	$("#ti_apellidos").val("");
	$("#ti_telefono").val("");
	$("#ti_mail").val("");
		
	$("#cat_familia").trigger("click").trigger("click")
}




/*
* modificando registros
*/
function saveEditForm(){
	if(db != null){
		db.transaction(queryDBUpdateForm, errorDB, updateFormSuccess);
	}
}

function queryDBUpdateForm(tx){
	var cat = $("#cajaCategorias").find("input:checked").val();
	tx.executeSql('UPDATE agenda_curso SET nombre="'+$("#ti_nombre").val()+'", apellidos="'+$("#ti_apellidos").val()+'",telefono="'+$("#ti_telefono").val()+'",email="'+$("#ti_mail").val()+'",categoria="'+cat+'",foto = "'+$.imageURL+'" WHERE id='+$.id);
}
function updateFormSuccess(tx) {
	var selector = $("#li_"+$.id);
	
	var selector = $("#li_"+$.id).clone(true);
	selector.find("img").attr("src", $.imageURL);
	selector.find("a:first").find("span").html($("#ti_nombre").val() + " " + $("#ti_apellidos").val());
	
	
	$("#li_"+$.id).remove();
	
	var cat = $("#cajaCategorias").find("input:checked").val();
	var lista = $("#lista_" + cat + " ul")
	lista.append(selector).listview('refresh');
	
	
	$.mobile.changePage("#home");
}




/*
* creando registros
*/
function saveNewForm(){
	if(db != null){
		db.transaction(queryDBInsertForm, errorDB);
	}
}

function queryDBInsertForm(tx){
	var cat = $("#cajaCategorias").find("input:checked").val();
	
	tx.executeSql("INSERT INTO agenda_curso (nombre,apellidos,telefono,categoria,foto,email) VALUES ('"+$("#ti_nombre").val()+"','"+$("#ti_apellidos").val()+"','"+$("#ti_telefono").val()+"','"+cat+"','"+$.imageURL+"','"+$("#ti_mail").val()+"')", [], newFormSuccess, errorDB);
}
function newFormSuccess(tx, results) {
	var cat = $("#cajaCategorias").find("input:checked").val();
	var lista = $("#lista_" + cat + " ul")
	
	
	var obj = $('<li id="li_'+results.insertId+'"><a href="#detalle" data-uid='+results.insertId+' class="linkDetalles"><div class="interior_lista"><img src="'+ $.imageUR +'" class="img_peq"/><span>' + $("#ti_nombre").val() + " " + $("#ti_apellidos").val()+ '</span></div></a><a href="#form"  data-theme="a" data-uid='+results.insertId+'  class="linkForm">Predet.</a></li>');
	obj.find('.linkDetalles').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	
	obj.find('.linkForm').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	lista.append(obj).listview('refresh');
	
	
	$.mobile.changePage("#home");
}





/*
* buscando contactos
*/
function findContact(){
	var opciones = new ContactFindOptions();
	opciones.filter = $("#ti_search").val();
	var fields = ["name", "displayName", "emails", "phoneNumbers"];
	navigator.contacts.find(fields, contactSuccess, contactError, opciones);
}

function contactSuccess(contacts) {
	var lista = $("#listaContactos ul");
	$.contacts = [];
	lista.html("");
     for (var i = 0; i < contacts.length; i++) {
		var contacto = {};
		contacto.nombre = contacts[i].name.familyName;
		 if (contacts[i].phoneNumbers && (contacts[i].phoneNumbers.length > 0)) {
			 contacto.telefono = contacts[i].phoneNumbers[0].value;
		 }
		 if (contacts[i].emails && (contacts[i].emails.length > 0)) {
			 contacto.email = contacts[i].emails[0].value;
		 }
		$.contacts.push(contacto);
		
		
		lista.append($("<li ><a href='#form' class='importContact' data-uid='"+i+"'>"+contacts[i].name.formatted+"</a></li>"))
     }
	 
	 lista.listview('refresh');
	 
	$('.importContact').bind('click', function(e){
		$.id = -1;
		$.idContact = $(this).data('uid');
	});
	
}

function contactError(){
	navigator.notification.alert("Error buscando contactos");
}




	  
	  



/*
* programación relacionada con la cámara
*/

function cameraSuccess(imageURL) {
	$("#fotoEdit_img").attr("src", imageURL);
	$.imageURL = imageURL;
	$("#li_"+$.id).find("img").attr("src", $.imageURL);
	$( "#camaraMenu" ).popup( "close" );
}
function cameraError(msg) {
    navigator.notification.alert("Error capturando foto: " + msg);
}



/*
*enviando mails
*/
function sendMail(){
	var subject = $("#ti_asunto").val();
	var body = $("#ta_mensaje").val();
	window.location.href = "mailto:"+$.registro.email+"?subject="+subject+"&body="+body;
	/*window.plugins.emailComposer.showEmailComposerWithCallback(mailSended,subject,body,[$.registro.email],[],[],false,[],[]);*/
}

