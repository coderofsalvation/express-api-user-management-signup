
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
			if (status == 'success'){
        hc.onUpdateSuccess();
        if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','signup', 'succes', 1);
      }
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
          if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','signup','email_taken', 1);
			}	else if (e.responseText == 'username-taken'){
          if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','signup','invalid_username', 1);
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

  // generate form
  $.getJSON( $("#metaformurl").attr('value'), {}, function(data){
    values = $("#meta").attr('value');
    if( !data ) data = {}
    data.value = values.length ? JSON.parse( values ) : {}
    console.dir(data);
    var jsonForm = $("#metaform").jsonForm( data );
    // update the hidden input field with jsondata
    $('#metaform').on('change keyup', function() {
      $("#meta").attr('value', JSON.stringify( jsonForm.getFormValues() ) );
    });
  });
});
