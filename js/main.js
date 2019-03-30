		var admin = 0;
		var check = true;
		$('#create').on('click',function() {
		$('#main').slideToggle(500, function() {
		$('.wrap-login100').css('padding-top','90px');
		$('#register').slideToggle(500);
		});
		});
		$('#signin').on('click',function() {
		
		$('#register').slideToggle(500, function() {
		$('.wrap-login100').css('padding-top','150px');
		$('#main').slideToggle(500);
		});
		});
		$('#adlogin, #ulogin').on('click',function(e) {
		if (e.target.id == "adlogin") 
			admin = 1;
		else admin = 0;
		$('.lform').text( (e.target.id == "ulogin" ? "Attendee" : "Room Master") + " Login");
		$('#main').slideToggle(500, function() {
		$('#login').slideToggle(500);
		});
		});
		$('#admain').on('click',function() {
			console.log("d");
		$('#login').slideToggle(500, function() {
		$('#main').slideToggle(500);
		});
		});
		$('#login').on('click','.submit', function() {
			var e = $('#login input[name="email"]').val();
			var p = $('#login input[name="pass"]').val();
			if (e == "" || p =="") {
				alert("One or more fields is missing a value, please correct this!");
				return;
			}
			$.ajax({				
				type: 'POST',
				url: 'scripts/login.php',
				data: { email: e, pass: p, a: admin },
				success: function(msg){
					if(msg === 'check') {
						console.log(msg);
						document.cookie = "username="+e;
						if(admin == 1) document.cookie = "admin=yes";
						else document.cookie = "admin=no";
						$('#login > .success').html("Success!").show();
					window.setTimeout(function(){
						window.location.href = "main.html";
					}, 200);
					}
					else {
						
						$('#login > .error').html("Incorrect details, please try again!").show();
					}
				}
			});
		});
		
		$('#user1').click(function () {
			var data = { email: "u@c.com" , pass: "nothing" , a: 1};
			$.post('scripts/login.php', data, function(res){
            document.cookie = "username=BossMan";
			document.cookie = "admin=yes";
			$('#login > .success').html("Success!").show();
			window.setTimeout(function(){
				window.location.href = "main.html";
			}, 200) 
        }).fail(function() {
           alert("An error occurred!" ); 
        });
		});
		$('#user2').click(function () {
			var data = { email: "test@test.com" , pass: "test" , a: 0};
			$.post('scripts/login.php', data, function(res){
            document.cookie = "username=test";
			document.cookie = "admin=no";
			$('#login > .success').html("Success!").show();
			window.setTimeout(function(){
				window.location.href = "main.html";
			}, 200) 
        }).fail(function() {
           alert("An error occurred!" ); 
        });
 
		});
(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');
    $('#submit').on('click',function(){
        check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }
		return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
           
		   return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);
window.setInterval(function(){
    var randomColor = '#'+ ('000000' + Math.floor(Math.random()*16777215).toString(16)).slice(-6);   
    $('.regbtn').css({
      'color' : randomColor,
    });
  }, 1000);

$('#regform').on('submit',function(e){
	e.preventDefault();
	d = $(this).serializeArray();
	console.log(d);
			$.ajax({
				type: 'POST',
				url: 'scripts/register.php',
				data: { d },
				success: function(msg){
					if("success" === msg) {	$('.success').html("User Registered! Redirecting to login...").show();
					window.setTimeout(function(){
						window.location.href = "index.html";
					}, 2000);
					}
					else  $('.success').html(msg).show();						
				}
			});
	return false;
	});