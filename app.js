angular.module('beamng.apps')
	.directive('raceui', [function () {
		return {
			template:
				'<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/raceui/raceui.svg"></object>',
			replace: true,
			restrict: 'EA',
			link: function (scope, element, attrs) {
				StreamsManager.add(['engineInfo','electrics']);
				scope.$on('$destroy', function () {
					StreamsManager.remove(['electrics']);
				});
		
				element.on('load', function () {
					let svg = element[0].contentDocument
					let values = []
		
					scope.$on('streamsUpdate', function (event, streams, data) {
						brakes = [];
						for (i in streams.wheelThermalData.wheels) {
							brakes.push(i);
						}

						brakes.sort(); 
						if (streams.engineInfo[1] !== values[1] || streams.engineInfo[0] !== values[0]) {
							values[0] = streams.engineInfo[0]; //rpm idle
							values[1] = streams.engineInfo[1]; //rpm max
							svg.getElementById('max_x5F_rpm').innerHTML = values[1]/1000 + "k";
						}
						let rpm = Math.round(Number(streams.engineInfo[4]));
						svg.getElementById('rpm_x5F_text').innerHTML = rpm;
						svg.getElementById('filler').setAttribute("width", (657.566 * rpm/values[1])) ;
						if(rpm > values[1] * 0.95) { 
							rgb = '(255,0,0)'
							rgb_filler = '(255,0,0)';
						}
						else if(rpm > values[1] * 0.9) { 
							
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
						
						var gear = streams.engineInfo[16];
						if (gear > 0)
							var gearText = gear;
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
						
						if (streams.engineThermalData) {
							//svg.getElementById('boost_x5F_filler').setAttribute("width",(streams.engineThermalData.forcedInductionInfo.boost*80.368))
							svg.getElementById('temps_x5F_filler_1_').setAttribute("width",(streams.engineThermalData.coolantTemperature/120*80.368))
							svg.getElementById('temps_2_').innerHTML = "Temp: " + Math.round(streams.engineThermalData.coolantTemperature) + "C"
							// = streams.engineThermalData.forcedInductionInfo.boost 
						  }
						if (streams.forcedInductionInfo) {
							//svg.getElementById('boost_x5F_filler').setAttribute("width",Math.round(streams.forcedInductionInfo.boost/100)*80.368)
							svg.getElementById('boost_2_').innerHTML = Math.round(streams.forcedInductionInfo.boost)/100 + " bar";
						}
						var currentDate = new Date();
						var currentHour = currentDate.getHours();
						var currentMinute = currentDate.getMinutes();

						if (currentMinute < 10) {
							currentMinute = "0" + currentMinute;
						}

						currentTime = currentHour + ":" + currentMinute;
						svg.getElementById('time').innerHTML = "Clock:" + currentTime;
						for (i = 0; i < brakes.length; i++) { //changes the colour of the disks and text according to their values
							if (streams.wheelThermalData.wheels[brakes[i]] != null) {
							  svg.getElementById('brake'+i).innerHTML = Math.round(UiUnits.temperature(streams.wheelThermalData.wheels[brakes[i]].brakeSurfaceTemperature).val)+
							   UiUnits.temperature(streams.wheelThermalData.wheels[brakes[i]].brakeSurfaceTemperature).unit;
							}
							else {
							  return;
							}
						}
					});
					
				});
		
		
			}
		  };
		}]);
		
