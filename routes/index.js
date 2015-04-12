var express = require('express');
var router = express.Router();
var lineReader = require('line-reader');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Solar Panels' });
});

/* GET home page. */
router.post('/', function(req, res, next) {
	var latitude = parseInt(req.body.latitude);
	var longitude = parseInt(req.body.longitude);
	
	var cells = []
	var cost = 0;
	var Hbar = [];
	var lat;
	lineReader.eachLine('data.txt', function(line) {
		cells = line.split(' ');
		if (latitude == cells[0] && longitude == cells[1]) {
			console.log('line:', line);
			//cost = parseInt(cells[2]) + parseInt(cells[3]);
			lat = cells[0];
			Hbar=[parseInt(cells[2]), parseInt(cells[3]), parseInt(cells[4]), parseInt(cells[5]), parseInt(cells[6]), parseInt(cells[7]), parseInt(cells[8]), parseInt(cells[8]),parseInt(cells[9]),parseInt(cells[10]),parseInt(cells[11]),parseInt(cells[12]),parseInt(cells[13])];
			console.log("Hbar", Hbar);
					}
	}).then(function () {







		var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var n = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];

		// INSOLATION VALUES ASSIGNED HERE!!!!
		// var Hbar = [5.51,5.7,5.7,5.56,5.16,4.59,4.48,4.36,4.51,5.03,5.15,5.24];
		//var Hbar = [1.85,2.58,3.51,4.65,5.77,6.54,6.59,6.1,4.9,3.35,2.11,1.56];

		// declare variables used in for loop
		var d;
		var ha;
		var H0;
		var kt;
		var Hd;
		var w1;
		var w2;
		var wmin;
		var Rb1;
		var Rb2;
		var Rb3;
		var Rb4;
		var Rb;
		var Ht;
		var AE;

		// REFLECTIVITY VALUES
		var ref = 0.5;

		// constants

		// LATITUDE ASSIGNED HERE!!!

		var lowEnd = 0;
		var highEnd = 90;
		var tiltarray = [];
		while(lowEnd <= highEnd){
		   tiltarray.push(lowEnd++);
		}

		var annualenergy = []
		var peaksunvalues = []


		// for tilt angles from 0 to 90 degrees
		for (x = 0; x<91; x++) {
		tilt = tiltarray[x];
		//console.log(tilt);
		// empty array to store monthly energy for each tilt angle
		var monthlyenergy = 0

		// for months from jan to dec
		for (i = 0; i < 12; i++) { 

			// declination
			d = 23.45*Math.sin((360*((284+n[i])/365))*Math.PI/180);
			//console.log(d);

			// hour angle
			ha = Math.acos(-Math.tan(d*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI;
			// console.log(ha);

			// SOMETHING???
			H0 = ((24*3600*1367)/Math.PI)*(1+0.033*Math.cos(360*n[i]/365*Math.PI/180))*(Math.cos(lat*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(ha*Math.PI/180)+((Math.PI/180)*ha*Math.sin(lat*Math.PI/180)*Math.sin(d*Math.PI/180)))/3600000;
			// console.log(H0);


			// SOMETHING ELSE?
			kt = Hbar[i]/H0
			// console.log(kt);


			// if hour angle is less than 81.4 degrees....
			if (ha>81.4) {
				Hd = (1.311-(3.002*kt)+(3.427*Math.pow(kt,2))-(1.821*Math.pow(kt,3)))*Hbar[i];
		} 	else {
			//console.log('second');
			Hd = (1.391-3.56*kt+4.189*Math.pow(kt,2)-2.137*Math.pow(kt,3))*Hbar[i];
		}

			// omega one
			w1 = Math.acos(-Math.tan(d*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI;
			//console.log(lat)
			//console.log(w1);

			//omega two
			w2 = Math.acos(-Math.tan(d*Math.PI/180)*Math.tan((lat-tilt)*Math.PI/180))*180/Math.PI;

			// use the smaller omega value
			if (w1>w2) {
		    wmin = w2;
		} else {
		    wmin = w1;
		}

			// coefficient calculations
			Rb1 = Math.cos((lat-tilt)*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(wmin*Math.PI/180);
			Rb2 = (Math.PI/180)*wmin*Math.sin((lat-tilt)*Math.PI/180)*Math.sin(d*Math.PI/180);
			Rb3 = Math.cos(lat*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(ha*Math.PI/180);
			Rb4 = (Math.PI/180)*ha*Math.sin(lat*Math.PI/180)*Math.sin(d*Math.PI/180);
			Rb = (Rb1+Rb2)/(Rb3+Rb4);

			// monthly energy per m^3
			Ht = (Hbar[i]*(1-(Hd/Hbar[i]))*Rb)+(Hd*((1+Math.cos(tilt*Math.PI/180))/2))+(Hbar[i]*ref*((1-Math.cos(tilt*Math.PI/180)))/2);
			
			// annual energy per m^3
			ME = Ht*days[i];
			peaksunvalues.push(ME);
			monthlyenergy = monthlyenergy+ME;


			// add annual energy at this tilt angle to array of annual energies
			//console.log(AE);

		}
		annualenergy.push(monthlyenergy)
		}

		// console.log(annualenergy);
		var optimalenergy = Math.max.apply(null, annualenergy);
		var optimalangle = tiltarray[annualenergy.indexOf(optimalenergy)];


		// PRINT THE OPTIMAL ANGLE AND THE CORRESPONDING ENERGY
		console.log(optimalangle);
		console.log(optimalenergy);

		var getValues = peaksunvalues.slice(12*optimalangle,12*optimalangle+12);
		var getValues2 = [];

		for (i = 0; i < getValues.length; i++) { 
			getValues2.push(getValues[i]/days[i]);
		}


		var peaksunhrs = Math.min.apply(null,getValues2);



		// PART TWO: SIZING THE PV PANEL

		//some necessary values
		var batteff = 0.9;      
		var VDC = 24;              // system voltage (Volts)
		var load = 5780;           // DC Load (Whr/day)

		// PANEL SPECS
		var imp = 8.05;
		var vmp = 31.1;
		var isc = 8.38;
		var voc = 37.8;

		// Battery Specs
		var BattV = 12;

		// ACTUAL CALCULATIONS???
		var idc = load/(batteff*VDC*peaksunhrs);
		//console.log(idc);
		var noparallel = Math.round(idc/imp);
		var noseries = Math.ceil(VDC/vmp);
		var totmodules = noparallel*noseries;

		// BATTERY SIZING
		var avgamphrs = load/VDC;
		//console.log(avgamphrs);

		// ASSIGN DAYS OF AUTONOMY!!!!!!!!!
		var daysofautonomy = 1;
		var dischargelim = 0.9;
		var batahrcap = 93.5;
		var battseries = VDC/BattV;
		var battparallel = avgamphrs*daysofautonomy/dischargelim/batahrcap;
		var totbatteries = Math.round(battseries*battparallel);

		// CHARGE CONTROLLER CALCULATIONS
		var fudgefactor = 1.25;
		arrayisA = isc*noparallel*fudgefactor;

		// DC TOTAL CONNECTED WATTS!!!!
		var dctotW = 959;
		var maxDCloadamps = dctotW/VDC;


		/*
		================================================================
		COST CALCULATIONS!!!! FINALLY!!!!!!!!!
		================================================================
		*/



		// INITIAL COSTS

		var modulecost = 296.38;
		var battcost = 190;
		var cccost = 184;
		var wirecost = 3.62;
		var wirequant = 50;
		var instalcost = 5000;

		var initcost = modulecost*totmodules+battcost*totbatteries+cccost+wirecost*wirequant+instalcost;
		var maintenance = ((1-Math.pow(1+0.06,-30))/0.06)*150;
		var randr = 0;
		var spwy = 3;

		while (spwy<30) {
			//console.log(Math.pow(1+0.06,-spwy))
			randr += Math.pow(1+0.06,-spwy)*battcost*totbatteries;
			spwy = spwy+3;
		}

		var salvage = 0.15*initcost;

		var lifecyclecost = initcost+maintenance+randr+salvage;

		console.log(lifecyclecost); 


















		res.render('index',{lifecyclecost:lifecyclecost, title:'Solar Panels'});
	});
	



});

module.exports = router;
