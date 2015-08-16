
$(document).ready(function(){
	
	var av = new AccountValidator();
	var sc = new SignupController();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			return av.validateForm();
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success'){
        alert(responseText);
        if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','signup', 'succes', 1);
      }
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
          if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','signup', 'email_taken', 1);
			    av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
          if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','signup', 'invalid_username', 1);
			    av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();
	
// customize the account signup form //
	
	$('#account-form h1').text('Signup');
	$('#account-form #sub1').text('Please tell us a little about yourself');
	$('#account-form #sub2').text('Choose your username & password');
	$('#account-form-btn1').html('Cancel');
	$('#account-form-btn2').html('Submit');
	$('#account-form-btn2').addClass('btn-primary');
	
})
