
function LoginController()
{

  // bind event listeners to button clicks //
  $('#login-form #forgot-password').click(function(){ 
    $('#login-container').hide('slideUp', function(){
      $('#get-credentials').show('slideDown');
    });
  });
    
  // automatically toggle focus between the email modal window and the login form //
  $('#get-credentials').on('shown', function(){ $('#email-tf').focus(); });
	$('#get-credentials').on('hidden', function(){ $('#user-tf').focus(); });

}
