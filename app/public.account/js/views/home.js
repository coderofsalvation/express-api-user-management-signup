var schema = {
  "webhook":{
    type: "object",
    properties: {
      "event": {
        "title": "when",
        "type":     "string",
        "enum": ["notify_new_item","item_deleted","item_updated"],
        "invalid": "Type of webhook is left blank",
        "required":   true
      },
      "url": {
        "type":     "string",
        "title": "Call url",
        "placeholder": "http://yourapi.com/foo",
        "invalid": "Url of webhook is left blank",
        "required":   true
      },
      "method": {
        "type":     "string",
        "enum": ["get","post","put","delete"],
        "title": "Using method",
        "invalid": "Method of webhook is left blank",
        "required":   true
      }
    }
  },
  "form": {
    "properties": {
      "webhook": {
        "title": "Webhook",
        "type":     [ "string", "array" ],
        "items": {
          "$ref":   "webhook"
        }
      }
    }
  }
};

$(document).ready(function(){

	var hc  = new HomeController();
	var av  = new AccountValidator();
  var jsb = false;
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if ( av.validateForm() == false){
				return false;
			} 	else{
        // create jsondata from generated form 
        formData.push( {name:'meta', value: JSON.stringify(jsb,null, "   ")  } );
        // push the disabled username field onto the form data array //
				formData.push({name:'user', value:$('#user-tf').val()});
        console.dir(formData);
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') hc.onUpdateSuccess();
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
			    av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();
	$('#github-banner').css('top', '41px');

// customize the account settings form //
	
	$('#account-form h1').text('Account Settings');
	$('#account-form #sub1').text('Here are the current settings for your account.');
	$('#user-tf').attr('disabled', 'disabled');
	$('#account-form-btn1').html('Delete');
	$('#account-form-btn1').addClass('btn-danger');
	$('#account-form-btn2').html('Update');
	$('#account-form-regenerate-apikey').addClass('btn-danger');
	$('#account-form-regenerate-apikey').html('Regenerate');

  // setup the confirm window that displays when the user chooses to delete their account //
  hc.initConfirm();

  // activate dropdown 
  $('a.dropdown-toggle').dropdown();

  // generate form
  var f = document.getElementById('metaform');
  var data = {};
  jsb = new JSB(f, data);
  jsb.setSchema(schema["form"], function(name) {
    console.log("Load ref:", name);
    return(schema[name]);
  });
  jsb.render({ append:true });
  window.jsb = jsb; // make accessible for accountValidator.js *TODO* any other way to do this?
  //console.log(JSON.stringify(jsb, null, "   "));
});
