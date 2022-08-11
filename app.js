angular.module('beamng.apps')
	.directive('simpleTime', [function () {
		return {
			template:
				'<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/raceui/raceui.svg"></object>',
			replace: true,
			restrict: 'EA',
			link: function (scope, element, attrs) {
				StreamsManager.add(['engineInfo','electrics']);

				scope.bigGear = ' - ';
				scope.ltlGear = '';
		
				var gearNames = ['P', 'R', 'N', 'D', '2', '1'];
		
				scope.$on('VehicleReset', function () {
				  scope.ltlGear = ' - ';
				});
				scope.$on('$destroy', function () {
					StreamsManager.remove(['electrics']);
				});
		
				element.on('load', function () {
					let svg = element[0].contentDocument
					let values = []
		
					scope.$on('streamsUpdate', function (event, streams, data) {
						if (streams.engineInfo[1] !== values[1] || streams.engineInfo[0] !== values[0]) {
							values[0] = streams.engineInfo[0]; //rpm idle
							values[1] = streams.engineInfo[1]; //rpm max
							svg.getElementById('max_x5F_rpm').innerHTML = values[1];
						}
						let rpm = Math.round(Number(streams.engineInfo[4]));
						svg.getElementById('rpm_1_').innerHTML = rpm;
						svg.getElementById('filler').setAttribute("width", (657.566 * rpm/values[1])) ;
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
						svg.getElementById('gas_x5F_filler').setAttribute("height", throttleVal/100*63.217);
						svg.getElementById('brake_x5F_filler').setAttribute("height", brakeVal/100*63.217);
						svg.getElementById('clutch_x5F_filer').setAttribute("height", clutchVal/100*63.217);
					});
					
				});
		
		
			}
		  };
		}]);
		
