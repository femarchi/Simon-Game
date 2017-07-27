$(document).ready(function(){

	LEVELS = 20;

	var game = null;
	var strict_mode = false;

//preload images for perfomance
	var images = new Array();
			function preload() {
				for (i = 0; i < preload.arguments.length; i++) {
					images[i] = new Image();
					images[i].src = preload.arguments[i];
				}
			}
			preload(
				"imgs/light-red-on.png",
				"imgs/light-red-off.png",
				"imgs/light-blue-on.png",
				"imgs/light-blue-off.png",
				"imgs/light-yellow-on.png",
				"imgs/light-yellow-off.png",
				"imgs/light-green-on.png",
				"imgs/light-green-off.png"
			);

//responsive font size for display
	function setFontSize(s){
		var size = s + "px";
		$('#display').css('font-size', size);
	}

	setFontSize($('#display').height()+7);

	$(window).resize(function() {
		var size = $('#display').height()+7;
		setFontSize(size);
	});

// define sounds
	var green_sound = new Howl({src:['https://s3.amazonaws.com/freecodecamp/simonSound1.mp3']});
	var red_sound = new Howl({src:['https://s3.amazonaws.com/freecodecamp/simonSound2.mp3']});
	var blue_sound = new Howl({src:['https://s3.amazonaws.com/freecodecamp/simonSound3.mp3']});
	var yellow_sound = new Howl({src:['https://s3.amazonaws.com/freecodecamp/simonSound4.mp3']});

//click handlers
	$(document).on('click', '#clickarea-red', function(){
		buttons.push('red');
	});

	$(document).on('click', "#clickarea-blue", function(){
		buttons.push('blue');
	});

	$(document).on('click', "#clickarea-yellow", function(){
		buttons.push('yellow');
	});

	$(document).on('click', "#clickarea-green", function(){
		buttons.push('green');
	});

	$(document).on('click', "#clickarea-strict", function(){
		strict_mode = !strict_mode;
		strict_mode ? $('#display').css("color","#CF0000") : $('#display').css("color","#00CF00");
		strict_mode ? $('#display').css("text-shadow","0px 0px 5px rgba(220, 100, 100, 0.75)") : $('#display').css("text-shadow","0px 0px 5px rgba(100, 220, 100, 0.75)");
		$('#clickarea-strict').css("fill","url('#strict-gradient-push')");
		setTimeout(function(){
			$('#clickarea-strict').css("fill","url('#strict-gradient')");
		}, 200);
	});

	$(document).on('click', "#clickarea-start", function(){
		$('#clickarea-start').css("fill","url('#start-gradient-push')");
		setTimeout(function(){
			$('#clickarea-start').css("fill","url('#start-gradient')");
		}, 200);
		//start a new game
		game = new Game();
		game.play();
	});

	var Buttons = function() {}

	Buttons.prototype = {

		flash: function(color){
			var id = '#btn-'+color;
			$(id).css("background-image","url('imgs/light-"+color+"-on.png')");
			setTimeout(function(){
				$(id).css("background-image","url('imgs/light-"+color+"-off.png')");
			}, 200);
			switch (color){
				case 'red': red_sound.play(); break;
				case 'blue': blue_sound.play(); break;
				case 'green': green_sound.play(); break;
				case 'yellow': yellow_sound.play(); break;
			}
		},

		push: function(color){
			this.flash(color);
			if(game !== null && game.player_turn){
				//add pushed button to player sequence
				game.player_sequence.push(color);

				//check move
				var index = game.player_sequence.length-1;
				if(game.player_sequence[index] !== game.sequence[index]){
					game.miss();
					game.player_sequence = [];
					if(strict_mode){
					  $('#display p').html("--");
						game = null;
					}
				} else {
					//last move
					if(index+1 === game.level){
						if(game.level >= LEVELS){
							game.win();
							$('#display p').html("--");
							game = null;
						} else {
							game.player_sequence = [];
							game.play();
						}
					}
				}
			}
		}

	} //end of Buttons.prototype

	var buttons = new Buttons();

	var Game = function() {

		this.sequence = [];
		this.player_sequence = [];
		this.level = 0;
		this.strict_mode = false;
		this.player_turn = false;

		//populate sequence
		for(var i = 0; i < LEVELS; i++){
			var next = Math.floor((Math.random()*3));
			switch (next){
				case 0: this.sequence.push('green'); break;
				case 1: this.sequence.push('red'); break;
				case 2: this.sequence.push('blue'); break;
				case 3: this.sequence.push('yellow'); break;
			}
		}

	}	//end of Game

	Game.prototype = {

		showSequence: function(){
			var i = 0;
			var g = this;
			g.player_turn = false;
			var c = setInterval(function(){
				buttons.flash(g.sequence[i]);
				i++;
				if(i >= g.level){
					clearInterval(c);
					g.player_turn = true;
				}
			}, 1000);
		},

		play: function(){
			var display_num = (++this.level).toString();
			this.showSequence();
			$('#display p').html(display_num);
			console.log(this.player_sequence + " " + this.sequence);
		},

		checkSequence: function(){
			for(var i = 0; i < this.level; i++){
				if(this.sequence[i] !== this.player_sequence[i]){
					this.player_sequence = [];
					return false;
				}
			}
			this.player_sequence = [];
			return true;
		},

		miss: function(){
			console.log("miss");
			var colors = ['red', 'blue', 'yellow', 'green'];
			var repetitions = 0;
			var g = this;
			var anim = setInterval(function(){
				buttons.flash('red');
				buttons.flash('blue');
				buttons.flash('yellow');
				buttons.flash('green');
				repetitions++;
				if(repetitions > 2){
					clearInterval(anim);
					if(!strict_mode){
						g.showSequence();
					}
				}
			}, 333);
		},

		win: function(){
			console.log("win");
			var colors = ['red', 'blue', 'yellow', 'green'];
			var repetitions = 0;
			var index = 0;
			var anim = setInterval(function(){
				buttons.flash(colors[index]);
				index = (index+1)%4;
				repetitions++;
				if(repetitions > 3*4){
					clearInterval(anim);
				}
			}, 250);
		}


	} //end of Game.prototype

}); //end of document ready