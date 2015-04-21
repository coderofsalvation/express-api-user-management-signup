
$(document).ready(function(){
	
	var lv = new LoginValidator();
	var lc = new LoginController();

// main login form //

	$('#login-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (lv.validateForm() == false){
				return false;
			} 	else{
			// append 'remember-me' option to formData to write local cookie //
				formData.push({name:'remember-me', value:$("input:checkbox:checked").length == 1})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
      if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','login', 'succes', 1);
			if (status == 'success') window.location.href = '/home';
		},
		error : function(e){
        if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard', 'login', 'fail', 1);
        lv.showLoginError('Login Failure', 'Please check your username and/or password');
		}
	}); 
	$('#user-tf').focus();
	
// login retrieval form via email //
	
	var ev = new EmailValidator();
	
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b> Error!</b> Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			ev.showEmailSuccess("Check your email on how to reset your password.");
      if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','reset_password', 'error', 1);
		},
		error : function(){
      if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard','reset_password', 'succes', 1);
			ev.showEmailAlert("Sorry. There was a problem, please try again later.");
		}
	});
	
})
