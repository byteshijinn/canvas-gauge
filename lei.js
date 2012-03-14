/*!
 * Lei - JavaScript Circle Gauge Library
 *
 * Copyright (c) 2011 Zhao Lei
 * Licensed under the Apache License 2.0.
 */
(function($) {
	$.lei = {
			version: "0.2.2",
			qq: "79194034",
			email: "bombworm@gmail.com"
			};
	function now(){
		return (new Date).getTime();
	}
	function CGauge(id, options){
		var canvas, ctx, frameInterval = 33,
			defaults = {
				x : 50,
				y : 200,
				minVal : 0,
				maxVal : 1000,
				largeTick : 100,
				smallTick : 10,
				needleLength : undefined,
				needleBottom : 15,
				needleCenterRadius : 5,
				dialRadius : 60,
				minAngle : 30,
				maxAngle : 330,
				stlen : 10,
				ltlen : 15,
				labelOffset : 10,
				labelFontSize : 10,
				markDirection : false,
				backgroundColor: "transparent",
				needleAngle : 0,
				needleColor : "white",
				dialColor : "white",
				cogEnable : false,
				cogColor : "red",
				cogAngle : 0,
				needleEndAngle : 0,
				cogEndAngle : 0,
				rotateNearest : false
			};
		init.apply(this,[].slice.call(arguments));
		publicMethod = this;
		publicMethod.ctx = ctx;
		publicMethod.canvas = canvas;
		publicMethod.draw = draw;
		publicMethod.setValue = setValue;
		publicMethod.setCogValue = setCogValue;
		draw.apply(this);
		
		function init(id, options){
			$.extend(true, this, defaults, options);
			this.id = id;
			this.canvas = $("#"+id).get(0);
			this.canvas.width = this.dialRadius*2.6;
			this.canvas.height = this.dialRadius*2.6;
			this.ctx = this.canvas.getContext('2d');
			this.x = this.canvas.width / 2;
			this.y = this.canvas.height / 2;
			canvas = this.canvas;
			ctx = this.ctx;
			if(navigator.userAgent.indexOf('Mobile') > -1){
				frameInterval = 50;
			}
		}
		
		function draw(){
			drawBackground.apply(this);
			drawDial.apply(this, [this.largeTick, this.ltlen, true]);
			drawDial.apply(this, [this.smallTick, this.stlen, false]);
			drawNeedle.apply(this);
		}
		
		function drawDial(tick, length, isLargeTick){
			var ctx = this.ctx, radius = this.dialRadius, cx = this.x, cy = this.y, minVal = this.minVal, maxVal = this.maxVal
				, minAngle = this.minAngle, maxAngle = this.maxAngle, markDirection = this.markDirection, needleAngle = this.needleAngle
				, dialColor = this.dialColor, labelOffset = this.labelOffset, cogAngle = this.cogAngle
				, width = this.canvas.width, height = this.canvas.height;
			var maxValAlt = Math.floor(maxVal / tick) * tick;
			var minValAlt = Math.ceil(minVal / tick) * tick;				
			var n = Math.floor((maxValAlt - minValAlt) / tick);				
			var tickAngle = tick * (maxAngle - minAngle) / (maxVal - minVal);
			var startAngle = 0;
			if (this.labelFontSize == undefined) 
				this.labelFontSize = 10;
			cx = width/2;
			cy = height/2;
			if (minVal >= 0) 
				startAngle = ((minVal % tick) == 0)? 0 : (tick - minVal % tick) * (maxAngle - minAngle) / (maxVal - minVal);
			else 
				startAngle = (-minVal % tick) * (maxAngle - minAngle) / (maxVal - minVal);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if(markDirection && isLargeTick) {
				var ang = minAngle + startAngle + cogAngle;
				var r = radius * 0.6, sr = radius * 0.5
					, sin = Math.sin(Math.PI / 180 * ang), cos = Math.cos(Math.PI / 180 * ang)
					, sintr = Math.sin(Math.PI / 180 * (ang + 45)), costr = Math.cos(Math.PI / 180 * (ang + 45));

				ctx.fillStyle = this.dialColor;
				ctx.font = "bold "+(this.labelFontSize+8)+"px Verdana";
				ctx.fillText("N", cx - r * sin, cy + r * cos);
				ctx.fillText("S", cx + r * sin, cy - r * cos);
				ctx.fillText("E", cx - r * cos, cy - r * sin);
				ctx.fillText("W", cx + r * cos, cy + r * sin);
				ctx.font = "bold "+(this.labelFontSize+2)+"px Verdana";
				ctx.fillText("NW", cx + sr * costr, cy + sr * sintr);
				ctx.fillText("NE", cx - sr * sintr, cy + sr * costr);
				ctx.fillText("SE", cx - sr * costr, cy - sr * sintr);
				ctx.fillText("SW", cx + sr * sintr, cy - sr * costr);
			}
			ctx.font = "bold "+this.labelFontSize+"px Verdana";
			ctx.strokeStyle = this.dialColor;
			ctx.fillStyle = this.dialColor;
			for (var i = 0; i < n+(maxAngle-minAngle==360 ? 0:1); i++) {
				var ang = (minAngle + startAngle + i * tickAngle);
				ang += cogAngle;
				ctx.save();
				ctx.fillStyle = this.dialColor;
				ctx.lineWidth = isLargeTick? 2 : 1;
				rotate.apply(this, [ang]);
				ctx.beginPath();
				ctx.moveTo(cx, cy-radius);
				ctx.lineTo(cx, cy -radius + length);
				ctx.stroke();
				ctx.restore();
				if (isLargeTick)
				{
					ctx.fillText(minValAlt + i * tick, cx-Math.sin(ang/180*Math.PI)*(radius+labelOffset), cy + Math.cos(ang/180*Math.PI)*(radius+labelOffset));
				}
			}
			
		}

		function drawNeedle(){
			var ctx = this.ctx, cx = this.x, cy = this.y, radius = this.dialRadius, minAngle = this.minAngle
				, cogColor = this.cogColor, needleAngle = this.needleAngle, cogAngle = this.cogAngle,labelOffset = this.labelOffset
				, ltlen = this.ltlen,width = this.canvas.width, height = this.canvas.height;
			if (this.needleLength == undefined)
				this.needleLength = radius - 5;
			cx = width/2;
			cy = height/2;
			var needleLength = this.needleLength;
			var needleColor = this.needleColor;
			var size = radius/4;
			var newcy = cy + this.needleLength;
			ctx.save();
			//ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = 0.9;
			ctx.beginPath();
			rotate.apply(this, [needleAngle+cogAngle]);
			ctx.fillStyle = needleColor;
			ctx.lineWidth = 1;
			ctx.moveTo(cx, cy - radius + ltlen);
			ctx.lineTo(cx - size/6, cy - radius + ltlen * 1.3);
			ctx.lineTo(cx + size/6, cy - radius + ltlen * 1.3);
			ctx.lineTo(cx, cy - radius + ltlen);
			ctx.closePath();
			ctx.strokeStyle = needleColor;
			ctx.lineWidth = radius / 5;
			ctx.moveTo(cx, cy + this.needleBottom);
			ctx.lineTo(cx, cy - this.needleLength +size);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.arc(cx, cy, this.needleCenterRadius, 0, Math.PI*2, false);
			ctx.fill();
			if(this.cogEnable){
				rotate.apply(this, [-(needleAngle+cogAngle)]);
				ctx.beginPath();
				ctx.strokeStyle = this.cogColor;
				ctx.lineWidth = 3;
				ctx.moveTo(cx, 0);
				ctx.lineTo(cx, ltlen*2);
				ctx.stroke();
			}
			ctx.restore();
		}
		
		function drawBackground(){
			var ctx = this.ctx, color = this.backgroundColor;
			if(color == "transparent"){
				ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}else{
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			}
		}
		
		function rotate(deg){
			var cx = this.canvas.width / 2, cy = this.canvas.height / 2;
			ctx.translate(cx, cy);
			ctx.rotate(Math.PI / 180 * deg);
			ctx.translate(-cx, -cy);
		}

		function setValue(val){
			this.needleEndAngle = val;
			if(this.rotateNearest){
				var currentAngle = this.needleAngle, needlaAngleDiff = val - currentAngle;
				if(needlaAngleDiff % 360 < -180){
					this.needleEndAngle = currentAngle + (needlaAngleDiff % 360) + 360;
				}else if(needlaAngleDiff % 360 > 180){
					this.needleEndAngle = currentAngle + (needlaAngleDiff % 360) - 360;
				}else{
					this.needleEndAngle = val % 360;
				}
			}
			animate.apply(this, [330]);
			return this;
		}
		function setCogValue(val){  
			this.cogEndAngle = val;
			return this;
		}
		function animate(ms){
			this.timerID != undefined && clearTimeout(this.timerID);
			var frames = ms / frameInterval;
			var needleAngle = this.needleAngle, needleEndAngle = this.needleEndAngle,
				cogAngle = this.cogAngle, cogEndAngle = this.cogEndAngle,
				needlaAngleDiff = needleEndAngle - needleAngle,
				cogAngleDiff = cogEndAngle - cogAngle;
			this.needleSteps = [];
			this.cogSteps = [];
			for(var i = 1; i <= frames; i++){
				this.needleSteps.push(needleAngle + needlaAngleDiff / frames * i);
				this.cogSteps.push(cogAngle + cogAngleDiff / frames * i);
			}
			var self = this;
			this.startTime = now();
			this.timerID = setTimeout(function(){
					animateStep.apply(self)
				}, frameInterval);
		}
		function animateStep(){
			var needleSteps = this.needleSteps, cogSteps = this.cogSteps,
				currentTime = now(), duration = currentTime - this.startTime, skipFrames = Math.floor(duration / 33 - 1);
			if(needleSteps.length > 0 || cogSteps.length > 0){
				if(skipFrames){
					this.needleSteps = needleSteps = needleSteps.slice(Math.min(skipFrames, needleSteps.length - 1));
					this.cogSteps = cogSteps = cogSteps.slice(Math.min(skipFrames, cogSteps.length - 1));
				}
				if(needleSteps.length > 0){
					this.needleAngle = needleSteps.shift();
				}
				if(cogSteps.length > 0){
					this.cogAngle = cogSteps.shift();
				}
				
				draw.apply(this);
				var self = this;
				this.startTime = currentTime;
				this.timerID = setTimeout(function(){
						animateStep.apply(self)
					}, frameInterval);
			}			
		}
	}
	
	function LED(id, options){
		var canvas, ctx,
			defaults = {
				count : 6,
				decimal : 2,
				gap : 130,
				scale : 1,
				backgroundColor: "transparent",
				coloroff : "#01232D",
				coloron : "#00FFFF",
				initialValue : 0
			};
		
		init.apply(this,[].slice.call(arguments));
		publicMethod = this;
		publicMethod.setValue = setValue;
		for (var i = 0; i < this.count; i++) {					
			drawDigit.call(this, this.ctx, this.x - this.gap * this.scale * i, this.y, this.scale, this.coloroff); 
		}
		this.setValue(this.initialValue);
		
		function init(id, options){
			$.extend(true, this, defaults, options);
			this.id = id;
			this.canvas = $("#"+id).get(0);
			this.canvas.width = this.gap * this.scale * this.count + 32 * this.scale;
			this.canvas.height = (175 + 7) * this.scale + 8; //top cy to dot bottom add double padding-top
			this.ctx = this.canvas.getContext('2d');
			this.x = this.canvas.width - this.gap * this.scale / 2; //the last LED's center
			this.y = 4; // padding-top
			canvas = this.canvas;
			ctx = this.ctx;
		}

		function drawSegment(ctx, cx, cy, l, a, b, c, angle, color) {
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = color;
			rotate.call(this, cx, cy, angle);
			ctx.moveTo(cx + l, cy);
			ctx.lineTo(cx + l - a + c, cy - b);
			ctx.lineTo(cx - l + a + c, cy - b);
			ctx.lineTo(cx - l, cy);
			ctx.lineTo(cx - l + a - c, cy + b);
			ctx.lineTo(cx + l - a - c, cy + b);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}

		function drawDigit(ctx, cx, cy, scale, color) {
			drawDigit2.call(this, ctx, cx, cy, scale, color, color, 0, 0);
		}
		
		function drawDigit2(ctx, cx, cy, scale, coloron, coloroff, digit, dot) {
			var ll = 40 * scale;
			var aa = 10 * scale;
			var bb = 10 * scale;
			var cc = 2 * scale;
			var rr = 7 * scale;
			var color;
			digit <<= 1;
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 14 * scale, cy + 84 * scale, ll, aa, bb, cc, 0, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 48 * scale, cy + 42 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 62 * scale, cy + 126 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 28 * scale, cy + 168 * scale, ll, aa, bb, cc, 0, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx + 21 * scale, cy + 126 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx + 35 * scale, cy + 42 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx, cy, ll, aa, bb, cc, 0, color);
			color = dot ? coloron : coloroff;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(cx + 32 * scale, cy + 175 * scale, rr, 0, Math.PI * 2, false);
			ctx.fill();
		}
		
		function rotate(cx, cy, deg){
			var ctx = this.ctx;
			ctx.translate(cx, cy);
			ctx.rotate(Math.PI / 180 * deg);
			ctx.translate(-cx, -cy);
		}
		
		function drawBackground(){
			var ctx = this.ctx, color = this.backgroundColor;
			if(color == "transparent"){
				ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}else{
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			}
		}
		
		function setValue(val){
			if(isNaN(val)){
				drawBackground.call(this);
				for (var i = 0; i < this.count; i++) {
					lightDigit.call(this, this.ctx, this.x - this.gap * this.scale * i, this.y, this.scale, -1, false, this.coloron, this.coloroff);
				}
			}else{
				var value = val * Math.pow(10, this.decimal);
				value = Math.round(value);
				drawBackground.call(this);
				for (var i = 0; i < this.count; i++) {
					if(value > 0)
						lightDigit.call(this, this.ctx, this.x - this.gap * this.scale * i, this.y, this.scale, value % 10, (i == this.decimal), this.coloron, this.coloroff);
					else{
						if(i <= this.decimal)
							lightDigit.call(this, this.ctx, this.x - this.gap * this.scale * i, this.y, this.scale, 0, (i == this.decimal), this.coloron, this.coloroff);
						else
							lightDigit.call(this, this.ctx, this.x - this.gap * this.scale * i, this.y, this.scale, -1, (i == this.decimal), this.coloron, this.coloroff);
					}
					value = Math.floor(value / 10);
				}
			}
			
			function lightDigit(ctx, cx, cy, scale, val, dot, coloron, coloroff) {
				var digits = {
							"-1" : 0,
							1 : parseInt("00110000", 2),
							2 : parseInt("01101101", 2),
							3 : parseInt("01111001", 2),
							4 : parseInt("00110011", 2),
							5 : parseInt("01011011", 2),
							6 : parseInt("01011111", 2),
							7 : parseInt("01110000", 2),
							8 : parseInt("01111111", 2),
							9 : parseInt("01111011", 2),
							0 : parseInt("01111110", 2),
							}
				var digit = digits[val];
				drawDigit2.call(this, ctx, cx, cy, scale, coloron, coloroff, digit, dot);
			}
		}
	}
	function WindGauge(id, options){
		var canvas, ctx, frameInterval = 33,
			defaults = {
				x : 0,
				y : 0,
				minVal : 0,
				maxVal : 1000,
				largeTick : 30,
				smallTick : 10,
				needleLength : undefined,
				needleBottom : 15,
				needleCenterRadius : 5,
				dialRadius : 60,
				lStartVal : 20,
				rStartVal : -20,
				stlen : 10,
				ltlen : 15,
				labelOffset : 10,
				labelFontSize : 10,
				labelColor: "#e30000",
				backgroundColor: "transparent",
				needleAngle : 0,
				needleColor : "black",
				dialColor : "#940000",
				lRangeColor : "transparent",
				rRangeColor : "transparent",
				needleEndAngle : 0,
				enableLED : false,
				LEDgap : 130,
				LEDcount : 3,
				LEDdecimal : 2,
				LEDscale : 0.4,
				LEDcoloroff : "#01232D",
				LEDcoloron : "#00FFFF",
				speedValue : 0,
				rotateNearest : false
			};
		init.apply(this,[].slice.call(arguments));
		publicMethod = this;
		publicMethod.ctx = ctx;
		publicMethod.canvas = canvas;
		publicMethod.draw = draw;
		publicMethod.setValue = setValue;
		publicMethod.setSpeed = setSpeed;
		draw.apply(this);
		
		function init(id, options){
			$.extend(true, this, defaults, options);
			this.id = id;
			this.canvas = $("#"+id).get(0);
			this.canvas.width = this.dialRadius*2.2;
			this.canvas.height = this.dialRadius*2.2;
			this.ctx = this.canvas.getContext('2d');
			this.x = this.canvas.width / 2;
			this.y = this.canvas.height / 2;
			canvas = this.canvas;
			ctx = this.ctx;
			if(navigator.userAgent.indexOf('Mobile') > -1){
				frameInterval = 50;
			}
		}
		function draw(){
			drawBackground.apply(this);
			drawDial.apply(this, [this.largeTick, this.ltlen, true]);
			drawDial.apply(this, [this.smallTick, this.stlen, false]);
			if(this.enableLED)
				drawLED.apply(this);
			drawNeedle.apply(this);
		}
		function drawBackground(){
			var ctx = this.ctx, color = this.backgroundColor;
			if(color == "transparent"){
				ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}else{
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			}
		}
		function drawDial(tick, length, isLargeTick){
			var ctx = this.ctx, radius = this.dialRadius, cx = this.x, cy = this.y, lStartVal = this.lStartVal, rStartVal = this.rStartVal,
				needleAngle = this.needleAngle, dialColor = this.dialColor, labelOffset = this.labelOffset, labelColor = this.labelColor,
				width = this.canvas.width, height = this.canvas.height;
			var lStartValAlt = Math.floor(lStartVal / tick) * tick;
			var rStartValAlt = Math.ceil(rStartVal / tick) * tick;				
			var rn = Math.floor((180 - rStartVal) / tick);
			var ln = Math.floor((180 + lStartVal) / tick);
			var tickAngle = tick;
			var startAngle = 0;
			var lTickWidth = 4;
			var sTickWidth = 2;
			if (this.labelFontSize == undefined) 
				this.labelFontSize = 10;
			cx = width/2;
			cy = height/2;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "bold "+this.labelFontSize+"px Verdana";
			ctx.strokeStyle = this.dialColor;
			ctx.fillStyle = labelColor;
			var startAngle = !isLargeTick ? rStartVal : rStartValAlt;
			for (var i = 0; i < rn + 1; i++) { //right part arc
				var ang = (startAngle + i * tickAngle);
				ctx.save();
				ctx.lineWidth = isLargeTick? lTickWidth : sTickWidth;
				rotate.apply(this, [ang]);
				ctx.beginPath();
				ctx.moveTo(cx, cy-radius);
				ctx.lineTo(cx, cy -radius + length);
				ctx.stroke();
				ctx.restore();
				if (isLargeTick)
				{
					ctx.fillText(rStartValAlt + i * tick, cx-Math.sin((ang+180)/180*Math.PI)*(radius+labelOffset), cy + Math.cos((ang+180)/180*Math.PI)*(radius+labelOffset));
				}
			}
			startAngle = !isLargeTick ? lStartVal : lStartValAlt;
			for (var i = 0; i < ln; i++) { //left part arc
				var ang = (startAngle - i * tickAngle);
				ctx.save();
				ctx.lineWidth = isLargeTick? lTickWidth : sTickWidth;
				rotate.apply(this, [ang]);
				ctx.beginPath();
				ctx.moveTo(cx, cy-radius);
				ctx.lineTo(cx, cy -radius + length);
				ctx.stroke();
				ctx.restore();
				if (isLargeTick)
				{
					ctx.fillText(Math.abs(lStartValAlt - i * tick), cx-Math.sin((ang+180)/180*Math.PI)*(radius+labelOffset), cy + Math.cos((ang+180)/180*Math.PI)*(radius+labelOffset));
				}
			}
			if(isLargeTick){
				ctx.save();
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.moveTo(cx - radius / 2 + length * 1.5, cy);
				ctx.lineTo(cx, cy - radius + length * 3);
				ctx.lineTo(cx + radius / 2 - length * 1.5, cy);
				ctx.stroke();
				ctx.closePath();
				var lRangeColor = this.lRangeColor, rRangeColor = this.rRangeColor, rangeLen = this.rangeLen;
				if(lRangeColor != "transparent"){
					ctx.strokeStyle = lRangeColor;
					ctx.lineWidth = rangeLen;
					ctx.beginPath();
					ctx.arc(cx, cy , radius - rangeLen / 2, (lStartVal - 90) / 180 * Math.PI, (lStartValAlt * 2 - 90) / 180 * Math.PI, true); //anticlockwise
					ctx.stroke();
				}
				if(rRangeColor != "transparent"){
					ctx.strokeStyle = rRangeColor;
					ctx.lineWidth = rangeLen;
					ctx.beginPath();
					ctx.arc(cx, cy , radius - rangeLen / 2, (rStartVal - 90) / 180 * Math.PI, (rStartValAlt * 2  - 90) / 180 * Math.PI, false); //clockwise
					ctx.stroke();
				}
				ctx.restore();
			}
		}
		function drawNeedle(){
			var ctx = this.ctx, cx = this.x, cy = this.y, radius = this.dialRadius,
				needleAngle = this.needleAngle, labelOffset = this.labelOffset,needleColor = this.needleColor,
				ltlen = this.ltlen, width = this.canvas.width, height = this.canvas.height;
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = "#900000";
			ctx.strokeStyle = "#900000";
			ctx.lineWidth = 0;
			ctx.arc(cx, cy, this.needleCenterRadius, 0, Math.PI*2, false);
			ctx.stroke();
			ctx.fill();
			ctx.lineWidth = 4;
			ctx.lineCap = "round";
			ctx.strokeStyle = needleColor;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx-Math.sin((needleAngle+180)/180*Math.PI)*radius, cy + Math.cos((needleAngle+180)/180*Math.PI)*radius);
			ctx.stroke();
			ctx.restore();
		}
		function drawLED(){
			var ctx = this.ctx, cx = this.x, cy = this.y, radius = this.dialRadius, speedValue = this.speedValue,
				count = this.LEDcount, decimal = this.LEDdecimal, gap = this.LEDgap, scale = this.LEDscale,
				coloron = this.LEDcoloron, coloroff = this.LEDcoloroff,	width = this.canvas.width, height = this.canvas.height;
			cx = cx + (gap * scale * (count -1)) / 2;
			cy = cy + 20;
			if(isNaN(speedValue)){
				for (var i = 0; i < this.count; i++) {
					lightDigit.call(this, ctx, cx - gap * scale * i, cy, scale, -1, false, coloron, coloroff);
				}
			}else{
				var value = speedValue * Math.pow(10, decimal);
				value = Math.round(value);
				for (var i = 0; i < count; i++) {
					if(value > 0)
						lightDigit.call(this, ctx, cx - gap * scale * i, cy, scale, value % 10, (i == decimal), coloron, coloroff);
					else{
						if(i <= decimal)
							lightDigit.call(this, ctx, cx - gap * scale * i, cy, scale, 0, (i == decimal), coloron, coloroff);
						else
							lightDigit.call(this, ctx, cx - gap * scale * i, cy, scale, -1, (i == decimal), coloron, coloroff);
					}
					value = Math.floor(value / 10);
				}
			}
			ctx.save();
			ctx.fillStyle = coloron;
			ctx.font = "bold "+(60 * scale)+"px Verdana";
			ctx.fillText("kts", cx - 23 * scale, cy + (182 + 10) * scale + 8);
			ctx.restore();
		}
		function lightDigit(ctx, cx, cy, scale, val, dot, coloron, coloroff) {
			var digits = {
						"-1" : 0,
						1 : parseInt("00110000", 2),
						2 : parseInt("01101101", 2),
						3 : parseInt("01111001", 2),
						4 : parseInt("00110011", 2),
						5 : parseInt("01011011", 2),
						6 : parseInt("01011111", 2),
						7 : parseInt("01110000", 2),
						8 : parseInt("01111111", 2),
						9 : parseInt("01111011", 2),
						0 : parseInt("01111110", 2),
						}
			var digit = digits[val];
			drawDigit.call(this, ctx, cx, cy, scale, coloron, coloroff, digit, dot);
		}
		function drawDigit(ctx, cx, cy, scale, coloron, coloroff, digit, dot) {
			var ll = 40 * scale;
			var aa = 10 * scale;
			var bb = 10 * scale;
			var cc = 2 * scale;
			var rr = 7 * scale;
			var color;
			digit <<= 1;
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 14 * scale, cy + 84 * scale, ll, aa, bb, cc, 0, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 48 * scale, cy + 42 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 62 * scale, cy + 126 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx - 28 * scale, cy + 168 * scale, ll, aa, bb, cc, 0, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx + 21 * scale, cy + 126 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx + 35 * scale, cy + 42 * scale, ll, aa, bb, -cc, 100, color);
			color = ((digit >>= 1) & 1) ? coloron : coloroff;
			drawSegment.call(this, ctx, cx, cy, ll, aa, bb, cc, 0, color);
			color = dot ? coloron : coloroff;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(cx + 32 * scale, cy + 175 * scale, rr * 2, 0, Math.PI * 2, false);
			ctx.fill();
		}
		function drawSegment(ctx, cx, cy, l, a, b, c, angle, color) {
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = color;
			rotate2.call(this, cx, cy, angle);
			ctx.moveTo(cx + l, cy);
			ctx.lineTo(cx + l - a + c, cy - b);
			ctx.lineTo(cx - l + a + c, cy - b);
			ctx.lineTo(cx - l, cy);
			ctx.lineTo(cx - l + a - c, cy + b);
			ctx.lineTo(cx + l - a - c, cy + b);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		function rotate(deg){
			var cx = this.canvas.width / 2, cy = this.canvas.height / 2;
			ctx.translate(cx, cy);
			ctx.rotate(Math.PI / 180 * deg);
			ctx.translate(-cx, -cy);
		}
		function rotate2(cx, cy, deg){
			var ctx = this.ctx;
			ctx.translate(cx, cy);
			ctx.rotate(Math.PI / 180 * deg);
			ctx.translate(-cx, -cy);
		}
		function setValue(val){
			this.needleEndAngle = val;
			if(this.rotateNearest){
				var currentAngle = this.needleAngle, needlaAngleDiff = val - currentAngle;
				if(needlaAngleDiff % 360 < -180){
					this.needleEndAngle = currentAngle + (needlaAngleDiff % 360) + 360;
				}else if(needlaAngleDiff % 360 > 180){
					this.needleEndAngle = currentAngle + (needlaAngleDiff % 360) - 360;
				}else{
					this.needleEndAngle = val % 360;
				}
			}
			animate.apply(this, [330]);
			return this;
		}
		function setSpeed(val){
			this.speedValue = val;
			return this;
		}
		function animate(ms){
			this.timerID != undefined && clearTimeout(this.timerID);
			var frames = ms / frameInterval;
			var needleAngle = this.needleAngle, needleEndAngle = this.needleEndAngle,
				cogAngle = this.cogAngle, cogEndAngle = this.cogEndAngle,
				needlaAngleDiff = needleEndAngle - needleAngle,
				cogAngleDiff = cogEndAngle - cogAngle;
			this.needleSteps = [];
			for(var i = 1; i <= frames; i++){
				this.needleSteps.push(needleAngle + needlaAngleDiff / frames * i);
			}
			var self = this;
			this.startTime = now();
			this.timerID = setTimeout(function(){
					animateStep.apply(self)
				}, frameInterval);
		}
		function animateStep(){
			var needleSteps = this.needleSteps, cogSteps = this.cogSteps,
				currentTime = now(), duration = currentTime - this.startTime, skipFrames = Math.floor(duration / 33 - 1);
			if(needleSteps.length > 0){
				if(skipFrames){
					this.needleSteps = needleSteps = needleSteps.slice(Math.min(skipFrames, needleSteps.length - 1));
				}
				if(needleSteps.length > 0){
					this.needleAngle = needleSteps.shift();
				}
				draw.apply(this);
				var self = this;
				this.startTime = currentTime;
				this.timerID = setTimeout(function(){
						animateStep.apply(self)
					}, frameInterval);
			}			
		}
	}
	function Highway(id, options){
		var canvas, ctx, frameInterval = 33,
			defaults = {
				x : 0,
				y : 0,
				width : 550,
				height : 250,
				backgroundColor : "transparent",
				sideColor : "red",
				sideWidthPercent : 0.15,
				centerLineWidth : 3,
				bottomHeight : 30,
				boundaryLimit : 0.2,
				measureUnit : "Nm",
				crossTrackError : 0,
				boatColor : "#f00000"
			};
		init.apply(this,[].slice.call(arguments));
		publicMethod = this;
		publicMethod.ctx = ctx;
		publicMethod.canvas = canvas;
		publicMethod.setValue = setValue;
		draw.apply(this);
		function init(id, options){
			$.extend(true, this, defaults, options);
			this.id = id;
			this.canvas = $("#"+id).get(0);
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.ctx = this.canvas.getContext('2d');
			this.x = this.canvas.width / 2;
			this.y = this.canvas.height / 2;
			canvas = this.canvas;
			ctx = this.ctx;
			if(navigator.userAgent.indexOf('Mobile') > -1){
				frameInterval = 50;
			}
		}
		function draw(){
			drawBackground.apply(this);
			drawBoat.apply(this);
		}
		function drawBackground(){
			var ctx = this.ctx, color = this.backgroundColor, sideWidthPercent = this.sideWidthPercent,
				boundaryLimit = this.boundaryLimit, measureUnit = this.measureUnit,
				width = this.canvas.width, height = this.canvas.height, bottomHeight = this.bottomHeight,
				chartHeight = height - bottomHeight;
			if(color == "transparent"){
				ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}else{
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			}
			ctx.save();
			ctx.fillStyle = this.sideColor;
			ctx.strokeStyle = this.sideColor;
			ctx.beginPath();
			ctx.moveTo(0, chartHeight);
			ctx.lineTo(0, 0);
			ctx.lineTo(width * sideWidthPercent, 0);
			ctx.moveTo(width, chartHeight);
			ctx.lineTo(width, 0);
			ctx.lineTo(width * (1 - sideWidthPercent), 0);
			ctx.fill();
			ctx.beginPath();
			ctx.lineWidth = this.centerLineWidth;
			for(var i=0; i<10; i++){
				ctx.moveTo(width / 2, 0.1 * i * height);
				ctx.lineTo(width / 2, 0.1 * (i + 0.5) * height)
			}
			ctx.moveTo(0, chartHeight);
			ctx.lineTo(width, chartHeight);
			ctx.moveTo(width / 4, chartHeight);
			ctx.lineTo(width / 4, chartHeight+5);
			ctx.moveTo(width * 3 / 4, chartHeight);
			ctx.lineTo(width * 3 / 4, chartHeight+5);
			ctx.stroke();
			ctx.font = "bold "+(16)+"px Verdana";
			ctx.fillText((boundaryLimit/2) + measureUnit, width * 0.25 - 25, (chartHeight + height) / 2 + 10);
			ctx.fillText((boundaryLimit/2) + measureUnit, width * 0.75 - 25, (chartHeight + height) / 2 + 10);
			ctx.restore();
		}
		function drawBoat(){
			var ctx = this.ctx, cx = this.x, cy = this.y, boundaryLimit = this.boundaryLimit, crossTrackError = this.crossTrackError;
			cx = cx + cx / boundaryLimit * crossTrackError;
			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.fillStyle = this.boatColor;
			ctx.moveTo(cx, cy);
			ctx.bezierCurveTo(cx - 16, cy + 35, cx - 8, cy + 50, cx - 6, cy + 55);
			ctx.lineTo(cx + 6, cy + 55);
			ctx.bezierCurveTo(cx + 8, cy + 50, cx + 16, cy + 35, cx, cy);
			ctx.fill();
			ctx.restore();
		}
		function setValue(val){
			if(Math.abs(val) > 0.2){
				this.boundaryLimit = Math.pow(10, Math.ceil(Math.log(Math.abs(val)/2) / Math.log(10))) * 2;
			}else{
				this.boundaryLimit = 0.2;
			}
			this.crossTrackError = val;
			draw.apply(this);
			return this;
		}
	}
	$.lei.CGauge = function(id, options){
		var c = new CGauge(id, options);
		return c;
	}
	$.lei.LED = function(id, options){
		var c = new LED(id, options);
		return c;
	}
	$.lei.WindGauge = function(id, options){
		var c = new WindGauge(id, options);
		return c;
	}
	$.lei.Highway = function(id, options){
		var c = new Highway(id, options);
		return c;
	}
})(jQuery);

