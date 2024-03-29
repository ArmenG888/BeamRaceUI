angular.module('beamng.apps')
	.directive('raceui', [function () {
		return {
			template:
				'<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/raceui/raceui.svg"></object>',
			replace: true,
			restrict: 'EA',
			link: function (scope, element, attrs) {
				element.css({transition:'opacity 0.3s ease'})
				StreamsManager.add(['engineInfo','electrics','engineThermalData']);
				scope.raceTime = null;
				var totalDistance = parseFloat(sessionStorage.getItem('apps:simpleTrip.totalDistance')) || 0;
									new_lap=false;
									timer=1;
									prevTime = performance.now();
									curTime = prevTime;
									count = 0;
									fuelConsumptionRate = 0;
									avgFuelConsumptionRate = 0;
									previousFuel = 0;
									frameCounter = 0;
									gxMin = 0;
									gxMax = 0;
									gyMin = 0;
									gyMax = 0;
									gx = 0;
									gy = 0;
									lap_time = 0;
									best_lap = -1;
									offset = 0;
				element.on('load', function () {
					
					let svg = element[0].contentDocument
					let values = []
					svg.getElementById('g-force-rec').addEventListener('click', function() {
						console.log("")
						svg.getElementById('g-force-rec').style.display = "none";
						svg.getElementById('telemtry').style.display = "inline";
					});
					svg.getElementById('lap_x5F_times').style.display = "none";
					svg.getElementById('boost_x5F_rec_1_').style.display = "none";
					svg.getElementById('boost_x5F_filler_1_').style.display = "none";
					svg.getElementById('boost_2_').style.display = "none";
					svg.getElementById('nitro_x5F_layer').style.display = "none";
					scope.$on('streamsUpdate', function (event, streams, data) {
						brakes = [];
						for (i in streams.wheelThermalData.wheels) {
							brakes.push(i);
						}

						brakes.sort(); 
						if (streams.engineInfo[1] !== values[1] || streams.engineInfo[0] !== values[0]) {
							values[0] = streams.engineInfo[0]; 
							values[1] = streams.engineInfo[1]; 
							svg.getElementById('max_x5F_rpm').innerHTML = values[1]/1000 + "k";
						}
						let rpm = Math.round(Number(streams.engineInfo[4]));
						svg.getElementById('rpm_x5F_text').innerHTML = rpm + " RPM";
						svg.getElementById('filler').setAttribute("width", (657.566 * rpm/ values[1])) ;
						if(rpm >  values[1] * 0.95) { 
							rgb = '(255,0,0)'
							rgb_filler = '(255,0,0)';
						}
						else if(rpm >  values[1] * 0.9) { 
							
							rgb = '(255,255,0)'
							rgb_filler = '(255,255,0)';
						} 
						else { //normal rpm, green
							rgb = '(0,0,0)';
							rgb_filler = '(128,128,128)';
						}
						svg.getElementById('filler').style.fill = 'rgb' + rgb_filler
						svg.getElementById('gear').style.fill = 'rgb' + rgb
						
						var speedMs = streams.electrics.wheelspeed;
						if (isNaN(speedMs)) speedMs = streams.electrics.airspeed;
						var speedConverted = UiUnits.speed(speedMs);
						if(speedConverted === null) return;
						var speedUnits = Math.round(speedConverted.val);
						svg.getElementById('speed').innerHTML = speedUnits;
						svg.getElementById('units').innerHTML = speedConverted.unit;
						
						var gear = streams.engineInfo[16];
						if (gear > 0)
							var gearText = ' ' + gear ;
						else if (gear < 0)
							var gearText = 'R';
						else
							var gearText = 'N';
						svg.getElementById('gear').innerHTML = gearText;
						var clutchVal   = Math.round(streams.electrics.clutch * 100 + 0.49)
							, brakeVal    = Math.round(streams.electrics.brake * 100)
							, throttleVal = Math.round(streams.electrics.throttle * 100)
						;
						svg.getElementById('gas_x5F_filler').setAttribute("height", throttleVal/100*63.217)
						svg.getElementById('brake_x5F_filler').setAttribute("height", brakeVal/100*63.217)
						//svg.getElementById('clutch_x5F_filer').setAttribute("height", 0)
						svg.getElementById('gas_x5F_text').innerHTML = throttleVal
						svg.getElementById('brake_x5F_text').innerHTML = brakeVal
						//svg.getElementById('clutch_x5F_text').innerHTML = 0
						

						svg.getElementById('fuel_x5F_filler_1_').setAttribute("width",(streams.electrics.fuel*80.368))
						svg.getElementById('fuel_2_').innerHTML = "Fuel: " + Math.round(streams.electrics.fuel*100) + "%"
						if (streams.electrics.fuel < 0.05)
						{
							svg.getElementById('fuel_2_').style.fill = "rgb(255,0,0)"
						}
						else if (streams.electrics.fuel < 0.2)
						{
							svg.getElementById('fuel_2_').style.fill = "rgb(255, 165, 0)"
						}
						else
						{
							svg.getElementById('fuel_2_').style.fill = "rgb(0,0,0)"
						}
						if (streams.engineThermalData) {
							svg.getElementById('temps_2_').innerHTML = "Temp: " + UiUnits.buildString('temperature', streams.engineThermalData.coolantTemperature, 1)
							if (streams.engineThermalData.coolantTemperature > 120)
							{
								svg.getElementById('temps_2_').style.fill = "rgb(255,0,0)"
								svg.getElementById('temps_x5F_filler_1_').setAttribute("width",(80.368))

							}
							else{
								svg.getElementById('temps_x5F_filler_1_').setAttribute("width",(streams.engineThermalData.coolantTemperature/120*80.368))
								svg.getElementById('temps_2_').style.fill = "rgb(0,0,0)"
							}
							
							
						  }
						if (streams.forcedInductionInfo) {
							svg.getElementById('boost_x5F_rec_1_').style.display = "block";
							svg.getElementById('boost_x5F_filler_1_').style.display = "block";
							svg.getElementById('boost_2_').style.display = "block";
							//svg.getElementById('boost_x5F_filler_1_').setAttribute("width",streams.forcedInductionInfo.boost/200*80.368)
							
							if(streams.forcedInductionInfo.boost/200*80.368 > 80.368)
							{
								svg.getElementById('boost_x5F_filler_1_').setAttribute("width",80.368)
							}
							else{
								svg.getElementById('boost_x5F_filler_1_').setAttribute("width",streams.forcedInductionInfo.boost/200*80.368)
							}
							svg.getElementById('boost_2_').innerHTML = UiUnits.buildString('pressure', streams.forcedInductionInfo.boost,1)
						}
						if (streams.n2oInfo) {
							svg.getElementById('nitro_x5F_layer').style.display = "block";
							if (streams.n2oInfo.isActive) {
								svg.getElementById('nitro').style.fill = "rgb(59,87,255)"
							}
							else{
								svg.getElementById('nitro').style.fill = "rgb(59,59,59)"
							}
							svg.getElementById('nitro_x5F_rec_x5F_filler').setAttribute("width",streams.n2oInfo.tankRatio*32.7);
						}
						if (streams.electrics.abs > 0.5) {
							svg.getElementById('abs').style.display = "block";
						} else {
							svg.getElementById('abs').style.display = "none";
						}
						if (streams.electrics.esc > 0.5) {
							svg.getElementById('esc').style.display = "block";
						} else {
							svg.getElementById('esc').style.display = "none";
						}
						svg.getElementById('lap_x5F_times').style.display = "none";
						var currentDate = new Date();
						var currentHour = currentDate.getHours();
						var currentMinute = currentDate.getMinutes();

						if (currentMinute < 10) {
							currentMinute = "0" + currentMinute;
						}

						currentTime = currentHour + ":" + currentMinute;
						svg.getElementById('time').innerHTML = "Clock: " + currentTime;
						for (i = 0; i < brakes.length; i++) { //changes the colour of the disks and text according to their values
							try {
								if (streams.wheelThermalData.wheels[brakes[i]] != null) {
									svg.getElementById('brake'+i).innerHTML = Math.round(UiUnits.temperature(streams.wheelThermalData.wheels[brakes[i]].brakeSurfaceTemperature).val)+
									UiUnits.temperature(streams.wheelThermalData.wheels[brakes[i]].brakeSurfaceTemperature).unit;
								}
								else {
								   break;
								}
							  }
							catch(err) {
								break;
							}
							
						}
						prevTime = curTime;

						curTime = performance.now();
						timer -= 0.001 * (curTime - prevTime);
						var wheelSpeed = streams.electrics.wheelspeed;
						if (timer < 0) {
							totalDistance += ((1.0 - timer) * wheelSpeed);
							
							count++;
	
				
							if (previousFuel > streams.engineInfo[11] && (previousFuel - streams.engineInfo[11]) > 0.0002) {
								fuelConsumptionRate = (previousFuel - streams.engineInfo[11]) / ((1 - timer) * streams.electrics.wheelspeed); // l/(s*(m/s)) = l/m
							} else {
								fuelConsumptionRate = 0;
							}
				
							previousFuel = streams.engineInfo[11];
							avgFuelConsumptionRate += (fuelConsumptionRate - avgFuelConsumptionRate) / count;
							timer = 1;
							svg.getElementById('average_x5F_fuel_x5F_text').innerHTML = UiUnits.buildString('consumptionRate', avgFuelConsumptionRate, 1)
							svg.getElementById('range_x5F_text').innerHTML = fuelConsumptionRate > 0 ? UiUnits.buildString('distance', streams.engineInfo[11] / fuelConsumptionRate, 2) : (streams.electrics.wheelspeed > 0.1 ? 'Infintiy' : UiUnits.buildString('distance', 0));;
							svg.getElementById('current_x5F_fuel').innerHTML = UiUnits.buildString('consumptionRate', fuelConsumptionRate, 1)
							svg.getElementById('driven_x5F_distance').innerHTML = UiUnits.buildString('distance', totalDistance, 1)
						}
						var gForces = {};

						for (var key in streams.sensors) {
							gForces[key] = streams.sensors[key] / 9.81;
							
						}
						
						gxMin = 0;
						gxMax = 0;
						gyMin = 0;
						gyMax = 0;
						gx = 0;
						gy = 0;
						gxMax = Math.max(gxMax, gForces.gx2);
						gxMin = Math.abs(Math.min(gxMin, gForces.gx2));
						
						if (gxMax > gxMin)
						{
							gx = gxMax;
							
						}
						else{
							gx = gxMin;
						}
						gyMax = Math.max(gyMax, gForces.gy2);
						gyMin = Math.abs(Math.min(gyMin, gForces.gy2));
						if (gyMax > 0.25) // front
						{
							svg.getElementById('front-filler-1g').style.fill = "rgb(255,0,0)";
							if(gyMax > 1.5)
							{
								svg.getElementById('front-filler-2g').style.fill = "rgb(255,0,0)";
							}
							else{
								svg.getElementById('front-filler-2g').style.fill = "rgba(230,230,230,0)";
							}
							if(gyMax > 3)
							{
								svg.getElementById('front-filler-3g').style.fill = "rgb(255,0,0)";
							}
							else{
								svg.getElementById('front-filler-3g').style.fill = "rgba(230,230,230,0)";
							}
						}	
						else{
							svg.getElementById('front-filler-1g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-filler-2g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-filler-3g').style.fill = "rgba(230,230,230,0)";
						}
						if (gyMin > 0.25) // rear
						{
							if(gyMin > 0.5)
							{
								svg.getElementById('rear-filler-2g').style.fill = "rgb(255,0,0)";
							}
							else{
								svg.getElementById('rear-filler-2g').style.fill = "rgba(230,230,230,0)";
							}
							if(gyMin > 1)
							{
								svg.getElementById('rear-filler-3g').style.fill = "rgb(255,0,0)";
							}
							else{
								svg.getElementById('rear-filler-3g').style.fill = "rgba(230,230,230,0)";
							}
							svg.getElementById('rear-filler-1g').style.fill = "rgb(255,0,0)";
						}
						else{
							svg.getElementById('rear-filler-1g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-filler-2g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-filler-3g').style.fill = "rgba(230,230,230,0)";
						}
						if (gyMin > gyMax ) // rear
						{
							if (gxMin > gxMax && gxMin > 0.5) // left
							{
								svg.getElementById('rear-left-filler-1g').style.fill = "rgb(255,0,0)";
								if (gxMin > 2)
								{
									svg.getElementById('rear-left-filler-2g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('rear-left-filler-2g').style.fill = "rgba(230,230,230,0)";
								}
								if (gxMin > 4)
								{
									svg.getElementById('rear-left-filler-3g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('rear-left-filler-3g').style.fill = "rgba(230,230,230,0)";
								}
							}
							else{
								svg.getElementById('rear-left-filler-1g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('rear-left-filler-2g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('rear-left-filler-3g').style.fill = "rgba(230,230,230,0)";
							}
							if (gxMax > gxMin && gxMax > 0.5) // right
							{
								svg.getElementById('rear-right-filler-1g').style.fill = "rgb(255,0,0)";
								if (gxMax > 2)
								{
									svg.getElementById('rear-right-filler-2g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('rear-right-filler-2g').style.fill = "rgba(230,230,230,0)";
								}
								if (gxMax > 4)
								{
									svg.getElementById('rear-right-filler-3g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('rear-right-filler-3g').style.fill = "rgba(230,230,230,0)";
								}
							}
							else{
								svg.getElementById('rear-right-filler-1g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('rear-right-filler-2g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('rear-right-filler-3g').style.fill = "rgba(230,230,230,0)";
							}
						}
						else{
							svg.getElementById('rear-right-filler-1g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-left-filler-1g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-right-filler-2g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-left-filler-2g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-right-filler-3g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('rear-left-filler-3g').style.fill = "rgba(230,230,230,0)";
						}
						if (gyMax > gyMin){
							if (gxMin > gxMax && gxMin > 0.5) // left
							{
								svg.getElementById('front-left-filler-1g').style.fill = "rgb(255,0,0)";
								if (gxMin > 2)
								{
									svg.getElementById('front-left-filler-2g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('front-left-filler-2g').style.fill = "rgba(230,230,230,0)";
								}
								if (gxMin > 4)
								{
									svg.getElementById('front-left-filler-3g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('front-left-filler-3g').style.fill = "rgba(230,230,230,0)";
								}
							}
							else{
								svg.getElementById('front-left-filler-1g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('front-left-filler-2g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('front-left-filler-3g').style.fill = "rgba(230,230,230,0)";
							}
							if (gxMax > gxMin && gxMax > 0.5) // right
							{
								svg.getElementById('front-right-filler-1g').style.fill = "rgb(255,0,0)";
								if (gxMax > 2)
								{
									svg.getElementById('front-right-filler-2g_1_').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('front-right-filler-2g_1_').style.fill = "rgba(230,230,230,0)";
								}
								if (gxMax > 4)
								{
									svg.getElementById('front-right-filler-3g').style.fill = "rgb(255,0,0)";
								}
								else
								{
									svg.getElementById('front-right-filler-3g').style.fill = "rgba(230,230,230,0)";
								}
							}
							else{
								svg.getElementById('front-right-filler-1g').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('front-right-filler-2g_1_').style.fill = "rgba(230,230,230,0)";
								svg.getElementById('front-right-filler-3g').style.fill = "rgba(230,230,230,0)";
							}
						}
						else{
							svg.getElementById('front-right-filler-1g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-left-filler-1g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-right-filler-2g_1_').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-left-filler-2g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-right-filler-3g').style.fill = "rgba(230,230,230,0)";
							svg.getElementById('front-left-filler-3g').style.fill = "rgba(230,230,230,0)";
						}
						if (gyMax > gyMin)
						{
							gy = gyMax;
						}
						else{
							gy = gyMin;
							
						}
						if (gy > gx)
						{
							svg.getElementById('g-text').innerHTML = Math.round(gy*10)/10 + 'G';
						}
						else{
							svg.getElementById('g-text').innerHTML = Math.round(gx*10)/10 + 'G';
						}

						svg.getElementById('fly_x5F_wheel_x5F_power').innerHTML = "Fly Wheel Pwr: " + UiUnits.buildString('power', Math.round(streams.engineInfo[4]*streams.engineInfo[8] * Math.PI/30000 * 1.34102), 0);
						svg.getElementById('wheel_x5F_power').innerHTML = "Wheel Power: " + UiUnits.buildString('power', Math.round(streams.engineInfo[20]/1000 * 1.34102), 0);
						svg.getElementById('fly_x5F_wheel_x5F_trqe').innerHTML = "Fly Wheel Trqe: " + UiUnits.buildString('torque', Math.round(streams.engineInfo[8]), 0);
						svg.getElementById('wheel_x5F_torqe').innerHTML = "Wheel Trqe: " + UiUnits.buildString('torque', Math.round(streams.engineInfo[19]), 0);
						svg.getElementById('air_x5F_speed').innerHTML = "Air Speed: " + UiUnits.buildString('speed', streams.electrics.airspeed, 0);

						//console.log(gxMax+','+gyMax+','+gyMin);
						
						
					});
					
			  
					function resetValues () {
					  offset = 0;
					  newLap = false;
					}
			  
					scope.$on('raceTime', function (event, data) {
					  svg.getElementById('lap_x5F_times').style.display = "block";
					  svg.getElementById('power_x5F_info').style.display = "none";
					  
					  if (newLap) {
						offset = data.reverseTime ? 0 : data.time;
						newLap = false;
					  }
					  scope.$evalAsync(function () {
						  lap_time = (data.time - offset) * 1000
						  svg.getElementById('current').innerHTML = new Date(lap_time).toISOString().slice(14, 22);
						  
					  });
					});

					scope.$on('ScenarioResetTimer', resetValues);
			  
					scope.$on('RaceLapChange', function (event, data) {
					  svg.getElementById('last_x5F_lap_x5F_time').innerHTML = "Last: " + String(new Date(lap_time).toISOString().slice(14, 22));
					  if (best_lap == -1)
					  {
						console.log("new pb");
						svg.getElementById('best_x5F_lap_x5F_time').innerHTML = "Best: " + String(new Date(lap_time).toISOString().slice(14, 22));
						best_lap = lap_time;
					  }
					  svg.getElementById('lap').innerHTML = "Lap " + data.current  + " / " + data.count;
					  if (data && data.current > 1) {
						newLap = true;
						
					  }
					});	
					scope.$on('WayPoint', function (event, data) {	
						if(data === null) return;
						scope.$applyAsync(function () {
						  svg.getElementById('check_x5F_point').innerHTML = data;
						});
					  });
					scope.$on('RaceTimeComparison', function (event, data) {
						scope.$applyAsync(function () {
						  if (data.time > 0)
						  {
							svg.getElementById("delta").innerHTML = 'Delta: +' + Math.round(data.time*100)/100;
							svg.getElementById("delta").style.fill = "rgb(100,0,0)"
						  }
						  else{
							svg.getElementById("delta").innerHTML = 'Delta: ' + Math.round(data.time*100)/100;
							svg.getElementById("delta").style.fill = "rgb(0,100,0)"
						  }
						});
					});
				});
			}
		  };
		}]);
		
