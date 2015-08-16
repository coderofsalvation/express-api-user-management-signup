
function HomeController()
{

  // bind event listeners to button clicks //
	var that = this;

  // handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });

  // confirm account deletion //
	$('#account-form-btn1').click(function(){
    if( confirm("are you sure you want to delete your account?") ){
      if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard', 'account_delete','click',  1);
      that.deleteAccount(); 
    }
  });

  // confirm account api key regenreate // 
	$('#account-form-regenerate-apikey').click(function(){
    if( confirm("are you sure you want to regenerate your api-key? ") ){
      if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard', 'apikey_regenerate','click',  1);
      that.regenerateApiKey(); 
    }
  });

	this.regenerateApiKey = function(){
		var that = this;
    $.post( "/update/apikey", {}, function( data ) {
      if( data.apikey ){
        $( "input#apikey-tf" ).attr( 'value', data.apikey );
        $("input#apikey-tf").fadeOut(1000).fadeIn(1000).fadeOut(1000).fadeIn(1000)
      }
    }, "json" );
  }

	this.deleteAccount = function()
	{
		var that = this;
		$.ajax({
			url: '/delete',
			type: 'POST',
			data: { id: $('#userId').val()},
			success: function(data){
	 			alert('Your account has been deleted.<br>Redirecting you back to the homepage.');
        setTimeout(function(){window.location.href = '/';}, 3000);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.attemptLogout = function()
	{
		var that = this;
		$.ajax({
			url: "/home",
			type: "POST",
			data: {logout : true},
			success: function(data){
        if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard', 'logout', 'succes', 1);
	 			alert('You are now logged out.<br>Redirecting you back to the homepage.');
        window.location.href = '/';
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

}

HomeController.prototype.onUpdateSuccess = function()
{
  alert("your account has been updated");
  if( typeof(ga) != 'undefined' ) ga('send', 'event', 'userdashboard', 'account_update', 'click', 1);
}
