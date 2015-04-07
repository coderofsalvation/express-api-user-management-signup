
function HomeController()
{

// bind event listeners to button clicks //
	var that = this;

// handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });

// confirm account deletion //
	$('#account-form-btn1').click(function(){
    that.initConfirm("delete");
    $('.modal-confirm').modal('show')
  });

// confirm account deletion //
	$('#account-form-regenerate-apikey').click(function(){
    that.initConfirm("apikey");
    $('.modal-confirm').modal('show')
  });

	this.regenerateApiKey = function(){
		$('.modal-confirm').modal('hide');
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
		$('.modal-confirm').modal('hide');
		var that = this;
		$.ajax({
			url: '/delete',
			type: 'POST',
			data: { id: $('#userId').val()},
			success: function(data){
	 			that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
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
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
  }

  this.initConfirm = function(type){
    $('.modal-confirm').modal({ show : false, keyboard : true, backdrop : true });
    if( !type ) type = "delete";
    $('.modal-confirm .submit').unbind('click');
    var that = this;
    switch( type ){
      case "delete":
        $('.modal-confirm .modal-header h3').text('Delete Account');
        $('.modal-confirm .modal-body p').html('Are you sure you want to delete your account?');
        $('.modal-confirm .cancel').html('Cancel');
        $('.modal-confirm .submit').html('Delete');
        $('.modal-confirm .submit').addClass('btn-danger');
        $('.modal-confirm .submit').click(function(){ 
          that.deleteAccount(); 
        });
        break;
      case "apikey":
        $('.modal-confirm .modal-header h3').text('Regenerate apikey');
        $('.modal-confirm .modal-body p').html('This would require updating your clients<br>Are you sure?');
        $('.modal-confirm .cancel').html('No');
        $('.modal-confirm .submit').html('Yes!');
        $('.modal-confirm .submit').addClass('btn-danger');
        $('.modal-confirm .submit').click(function(){ 
          that.regenerateApiKey(); 
        });
        break;
    }
  }

}

HomeController.prototype.onUpdateSuccess = function()
{
	$('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html('Your account has been updated.');
	$('.modal-alert').modal('show');
	$('.modal-alert button').off('click');
}
