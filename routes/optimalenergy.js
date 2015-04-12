/*
latitude (lat) STAYS THE SAME FOR EVERY CALCULATION
avg day (n) Set for every month, 
horizontal insolation (Hbar)
tilt (tilt)
number of days in month (days)

declination (d)    23.45*Math.sin((360*((284+n)/365))*Math.PI/180)

hour angle (ha)    Math.acos(-Math.tan(d*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI

H0 ET (H0)         ((24*3600*1367)/Math.PI)*(1+0.033*Math.cos(360*n/365*Math.PI/180))*(Math.cos(lat*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(ha*Math.PI/180)+((Math.PI/180)*ha*Math.sin(lat*Math.PI/180)*Math.sin(*Math.PI/180)))/3600000

Energy ET (eET)    n*H0

kt (kt)            Hbar/H0 

Hd (Hd)            if hour angle is greater than 81.4
				   (1.311-3.002*kt+3.427*kt^2-1.821*kt^3)*Hbar
				   else
				   (1.391-3.56*kt+4.189*kt^2-2.137*kt^3)*Hbar

omega1 (w1)		   Math.acos(-Math.Tan(d*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI
omega2 (w2)		   Math.acos(-Math.Tan(d*math.PI/180)*Math.tan((lat-tilt)*Math.PI/180))*180/Math.PI

GET THE SMALLER OMEGA (wmin)

Rb1				   Math.cos((lat-tilt)*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(omegamin*Math.PI/180)
Rb2				   (Math.PI/180)*omegamin*Math.sin((lat-tilt)*Math.PI/180)*Math.sin(d*Math.PI/180)
Rb3				   Math.cos(lat*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(ha*Math.PI/180)
Rb4  			   (Math.PI/180)*ha*Math.sin(lat*Math.PI/180)*Math.sin(d*Math.PI/180)
Rb     			   (Rb1+Rb2)/(Rb3+Rb4)

Ht           	   (Hbar*(1-(Hd/Hbar))*Rb)+(Hd*((1+Math.cos(tilt*Math.PI/180))/2))+(Hbar*ref*((1-Math.cos(tilt*Math.PI/180)))/2)

Annual Energy (AE)  Ht*days

*/



var days = ["31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30","31"];
var n = ["15", "46", "74", "105", "135", "166", "196", "227", "258", "288", "319","349"];

// INSOLATION VALUES ASSIGNED HERE!!!!
var Hbar = ["5.51","5.7","5.7","5.56","5.16","4.59","4.48","4.36","4.51","5.03","5.15","5.24"];

console.log(Hbar);





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


// constants

// LATITUDE ASSIGNED HERE!!!
var lat = 6.67;
var lowEnd = 0;
var highEnd = 89;
var tiltarray = [];
while(lowEnd <= highEnd){
   tiltarray.push(lowEnd++);
}

// empty array to store annual energy for each tilt angle
annualenergy = []


// for tilt angles from 0 to 90 degrees
for (x = 0; i<90; x++) {
tilt = tiltarray[x]

// for months from jan to dec
for (i = 0; i < 12; i++) { 

	// declination
	d += 23.45*Math.sin((360*((284+n[i])/365))*Math.PI/180);

	// hour angle
	ha += Math.acos(-Math.tan(d*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI;

	// SOMETHING???
	H0 += ((24*3600*1367)/Math.PI)*(1+0.033*Math.cos(360*n[i]/365*Math.PI/180))*(Math.cos(lat*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(ha*Math.PI/180)+((Math.PI/180)*ha*Math.sin(lat*Math.PI/180)*Math.sin(*Math.PI/180)))/3600000
	
	// SOMETHING ELSE?
	kt += Hbar[i]/H0

	// if hour angle is less than 81.4 degrees....
	if (ha>81.4) {
    Hd += (1.311-3.002*kt+3.427*kt^2-1.821*kt^3)*Hbar[i];
} else {
    Hd += (1.391-3.56*kt+4.189*kt^2-2.137*kt^3)*Hbar[i];
}

	// omega one
	w1 += Math.acos(-Math.Tan(d*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI;

	//omega two
	w2 += Math.acos(-Math.Tan(d*math.PI/180)*Math.tan((lat-tilt)*Math.PI/180))*180/Math.PI

	// use the smaller omega value
	if (w1>w2) {
    wmin += w2;
} else {
    wmin += w1;
}

	// coefficient calculations
	Rb1 += Math.cos((lat-tilt)*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(wmin*Math.PI/180);
	Rb2 += (Math.PI/180)*wmin*Math.sin((lat-tilt)*Math.PI/180)*Math.sin(d*Math.PI/180);
	Rb3 += Math.cos(lat*Math.PI/180)*Math.cos(d*Math.PI/180)*Math.sin(ha*Math.PI/180);
	Rb4 += (Math.PI/180)*ha*Math.sin(lat*Math.PI/180)*Math.sin(d*Math.PI/180);
	Rb += (Rb1+Rb2)/(Rb3+Rb4)

	// monthly energy per m^3
	Ht += (Hbar[i]*(1-(Hd/Hbar[i]))*Rb)+(Hd*((1+Math.cos(tilt*Math.PI/180))/2))+(Hbar[i]*ref*((1-Math.cos(tilt*Math.PI/180)))/2);
	
	// annual energy per m^3
	AE += Ht*days[i];

	// add annual energy at this tilt angle to array of annual energies
	annualenergy.push(AE);

}
}

var optimalenergy = Math.min.apply(null, energyvalues);

/*

// PART TWO: SIZING THE PV PANEL

//some necessary values
var batteff = 0.9;      
var VDC = 24;              // system voltage (Volts)
// ASSIGN PEAK SUN HOURS!!!!!!
var peaksunhrs = 
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
var noparallel = Math.round(idc/imp);
var noseries = Math.ceil(VDC/vmp);
var totmodules = noparallel*noseries;

// BATTERY SIZING
var avgamphrs = load*VDC;

// ASSIGN DAYS OF AUTONOMY!!!!!!!!!
var daysofautonomy = 1;
var dischargelim = 0.9;
var batahrcap = 93.5;
var battseries = VDC/BattV;
var battparallel = avgamphrs*daysofautonomy/dischargelim/batahrcap+battseries;
var totbatteries = Math.round(battseries*battparallel);

// CHARGE CONTROLLER CALCULATIONS
var fudgefactor = 1.25;
arrayisA = isc*noparallel*fudgefactor;

// DC TOTAL CONNECTED WATTS!!!!
var dctotW = 959;
var maxDCloadamps = dctotW/VDC;

console.log(noparallel)


*/














