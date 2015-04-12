
$(document).ready(function(){

	var hc = new HomeController();
	var av = new AccountValidator();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (av.validateForm() == false){
				return false;
			} 	else{
			// push the disabled username field onto the form data array //
				formData.push({name:'user', value:$('#user-tf').val()})
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
  // init dropdown
  $('a.dropdown-toggle').dropdown();

  // generate form
  var jsonForm = $('#metaform').jsonForm({
    form: [{ 
      "type": "fieldset",
      "title": "Webhooks",
      "expandable": true,
      "items": [ "webhooks" ]
    }],
    schema: {
      name: {
        type: 'string',
        title: 'Name',
        required: true
      },
      age: {
        type: 'number',
        title: 'Age'
      },
      "webhooks": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "event": {
              "type": "string",
              "enum": ["item new","item update","item delete"],
              "title": "When",
              "required": true
            },
            "url": {
              "type": "string",
              "title": "call url",
              "default": "http://yourapp.com/foo",
              "required": true
            },
            "method": {
              "type": "string",
              "enum": ["get","post","put","delete"],
              "title": "using",
              "required": true
            },
          }
        }
      }
    }
  });
  // update the hidden input field with jsondata
  $('#metaform').on('change keyup', function() {
    var values = jsonForm.getFormValues();
    $("#meta").attr('value', JSON.stringify( values ) );
  });
});
