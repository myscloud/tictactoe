var canvas, ctx;
var data;
var currPlayer; // current player (can be either human or ai)
var human, ai;
var isPlayer, aiMoved;

window.onload = function main(){

	canvas = document.createElement("canvas");
	canvas.width = canvas.height = 5*100 + 20;
	ctx = canvas.getContext("2d");

	document.body.appendChild(canvas);

	canvas.addEventListener("mousedown", mouseDown);

	init();
	tick();

}

// initialize grid data
function init(){
	if(data == null){
		data = [];
		for (var i =0; i < 25; i++){
			var x = (i % 5)*100 + 20;
			var y = Math.floor(i/5)*100 +20;
			data.push(new Tile(x, y));
		}
	}

	currPlayer = human = Tile.NOUGHT;
	ai = Tile.CROSS;

	isHuman = currPlayer === Tile.NOUGHT;
	aiMoved = false;
	
	// // set AI
	ai = new AIPlayer();
	// ai.setSeed(player === Tile.NOUGHT ? Tile.CROSS : Tile.NOUGHT);
	
	// console.log(ai.move());
}

function tick(){
	window.requestAnimationFrame(tick);
	
	update();
	render();
	
}

function update(){
	var activeAnim = false;
	for (var i = data.length; i--;){
		data[i].update();
		activeAnim = activeAnim || data[i].active();
	}

	if(currPlayer == Tile.CROSS) {
		selectedIdx = ai.stupidBot();
		selectABox(selectedIdx);
	}

	ai.initTmpBoard();
	arr = ai.checkWin();
	console.log(arr);

	// if(!activeAnim){
	// 	if(!aiMoved && !isPlayer){
	// 		var m = ai.move();
	// 		if(m === -1){
	// 			console.log("draw");
	// 		}
	// 		else{
	// 			data[m].flip(ai.getSeed());
	// 		}
	// 		isPlayer = true;
	// 	}
	// 	aiMoved = true;
	// }
	// else{
	// 	aiMoved = false;
	// }

}

function render(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = data.length; i--;){
		data[i].draw(ctx);
	}
}

function Tile(x, y){

	var x = x, y = y;

	var tile = Tile.BLANK;
	var anim = 0;

	if(tile == null){
		var _c 	= document.createElement("canvas");
		_c.width = _c.height = 80;
		var _ctx = _c.getContext("2d");

		_ctx.fillStyle = "skyblue";
		_ctx.lineWidth = 4;
		_ctx.strokeStyle = "white";
		_ctx.lineCap = "round";

		//blank
		_ctx.fillRect(0, 0, 80, 80);
		Tile.BLANK = new Image();
		Tile.BLANK.src = _c.toDataURL();
		
		//nought
		_ctx.fillRect(0, 0, 80, 80);
		
		_ctx.beginPath();
		_ctx.arc(40, 40, 30, 0, 2*Math.PI);
		_ctx.stroke();

		Tile.NOUGHT = new Image();
		Tile.NOUGHT.src = _c.toDataURL();

		//cross
		_ctx.fillRect(0, 0, 80, 80);
		
		_ctx.beginPath();
		_ctx.moveTo(10, 10);
		_ctx.lineTo(70, 70);
		_ctx.moveTo(70, 10);
		_ctx.lineTo(10, 70);
		_ctx.stroke();

		Tile.CROSS = new Image();
		Tile.CROSS.src = _c.toDataURL();
		

		tile = Tile.BLANK;
	}

	this.active = function(){
		return anim>0;
	}

	this.equals = function(){
		return tile === this.tile;
	}

	this.hasData = function(){
		return tile != Tile.BLANK;
	}

	this.isBlank = function(){
		return tile === Tile.BLANK;
	}

	this.isNought = function(){
		return tile === Tile.NOUGHT;
	}

	this.isCross = function(){
		return tile === Tile.CROSS;
	}

	this.set = function(next){
		tile = next;
	}

	this.flip = function(next){
		tile = next;
		anim = 1;
	}

	this.update = function(){
		if (anim > 0){
			anim -= 0.02;
		}
	}

	this.draw = function(ctx){
		if(anim <= 0){
			ctx.drawImage(tile, x, y);
			return;
		}

		var res =2;
		var t = anim > 0.5 ? Tile.BLANK : tile;
		var p = -Math.abs(2*anim - 1) + 1;

		for(var i = 0; i < 100; i += res ){
			var j = 50 - (anim > 0.5 ? 100 - i : i);

			ctx.drawImage(t, i, 0, res, 100,
				x + i - p*i + 50*p,
				y - i*p*0.2,
				res,
				100 + i*p*0.4
			);
		}
		
	}
}

function mouseDown(evt){
	if(currPlayer != Tile.NOUGHT) return;
	var el = evt.target;

	var px = evt.clientX - el.offsetLeft;
	var py = evt.clientY - el.offsetTop;

	if (px % 100 >= 20 || py % 100 >= 20){
		var idx = Math.floor(px/100);
		idx += Math.floor(py/100)*5;

		if (data[idx].hasData()){
			return;
		}
		
		selectABox(idx);
	}

}

function selectABox(idx) {
	data[idx].flip(currPlayer);
	checkWinner();
	currPlayer = changePlayer(currPlayer);

}

// ==================================================================
//    logic
// ==================================================================

function changePlayer(currPlayer)
{
	if(currPlayer == Tile.CROSS){ // bot -> human
		return Tile.NOUGHT;
	}
	else if(currPlayer == Tile.NOUGHT){ // human -> bot
		delay = 0;
		return Tile.CROSS;
	}
}


// ==================================================================
//    AI
// ==================================================================

function AIPlayer(){

	this.stupidBot = function() {
		idx = Math.floor( Math.random() * 25 );
		for(i = idx; i >= 0; i--) {
			if(!data[i].hasData()) {
				return i;
			}
		}

		for(i = idx + 1; i < 26; i++) {
			if(!data[i].hasData()) {
				return i;
			}
		}
	}

	// 0 = O, 1 = X, -1 = BLANK
	var tmpBoard;
	var inf;

	this.initTmpBoard = function() {
		tmpBoard = [];
		for(i = 0; i < data.length; i++) {
			if(data[i].isBlank()) tmpBoard.push(-1);
			else if(data[i].isNought()) tmpBoard.push(0);
			else tmpBoard.push(1);
		}
	}

	this.checkWin = function() {
		results = [];
		// check vertical
		for(i = 0; i < 5; i++) {
			first = tmpBoard[i * 5];
			count = 0;
			for(j = 0; j < 5; j++) {
				idx = (i * 5) + j;
				if(tmpBoard[idx] == first) count++;
				results.push(idx);
			}

			if(count == 5 && first != -1) return results;
			else results = [];
		}

		// check horizontal
		for(j = 0; j < 5; j++) {
			first = tmpBoard[j];
			count = 0;
			for(i = 0; i < 5; i++) {
				idx = (i * 5) + j;
				if(tmpBoard[idx] == first) count++;
				results.push(idx);
			}

			if(count == 5 && first != -1) return results;
			else results = [];
		}

		// check diagonal 1
		first = tmpBoard[0];
		count = 0;
		for(i = 0; i < 5; i++) {
			idx = (i * 5) + i;
			if(tmpBoard[idx] == first) count++;
			results.push(idx);
		}
		if(count == 5 && first != -1) return results;
		else results = [];

		// check diagnoal 2
		first = tmpBoard[4];
		count = 0;
		for(i = 0, j = 4; i < 5 && j >= 0; i++, j--) {
			idx = (i * 5) + j;
			if(tmpBoard[idx] == first) count++;
			results.push(idx);
		}
		if(count == 5 && first != -1) return results;
		else results = [];

		return results;
	}

	this.calcScore = function(depth) {
		// check vertical
		for(i = 0; i < 5; i++){
			first = tmpBoard[i * 5];
			count = 0;
			for(j = 0; j < 5; j++) {
				if(tmpBoard[(i * 5) + j] == first) count++;
			}
			// if(count == 5) {
			// 	if(turn == )
			// }
		}
	}

	this.minimaxBot = function(turn, depth, peak) {
		
		if(turn == 1) { // our turn - get max
			
			maxId = 0;
			maxVal = -100;

			for(i = 0; i < 26; i++) {
				if(tmpBoard[i] == -1) {
					tmpBoard[i] = 1;
					score = calcScore();
					if(score == inf) {
						score = minimaxBot(0, depth+1, maxVal);
					}

					if(score > maxVal) {
						maxVal = score;
						maxId = i;
					}
					tmpBoard[i] = -1;
				}
			}
			return maxId;
		}
		else if(turn == 0) { // user's turn - get min

			minId = 0;
			minVal = 100;

			for(i = 0; i < 26; i++) {
				if(tmpBoard[i] == -1) {
					tmpBoard[i] = 0;
					score = calcScore();
					if(score == inf) {
						score = minimaxBot(1, depth+1, minVal);
					}

					if(score < minVal) {
						minVal = score;
						minId = i;
					}
					tmpBoard[i] = -1;
				}
			}
			return minId;
		}
	}

}
function checkWinner(){
	for(i=0;i<25;i++){
	console.log(data[i].tile);
	}
}
