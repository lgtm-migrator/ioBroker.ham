/* jshint -W097 */// jshint strict:false
/*jslint node: true */
var expect = require('chai').expect;
var setup  = require(__dirname + '/lib/setup');

var objects = null;
var states  = null;
var onStateChanged = null;
var onObjectChanged = null;
var sendToID = 1;

var adapterShortName = setup.adapterName.substring(setup.adapterName.indexOf('.')+1);

function checkConnectionOfAdapter(cb, counter) {
    counter = counter || 0;
    console.log('Try check #' + counter);
    if (counter > 30) {
        if (cb) cb('Cannot check connection');
        return;
    }

    states.getState('system.adapter.' + adapterShortName + '.0.alive', function (err, state) {
        if (err) console.error(err);
        if (state && state.val) {
            if (cb) cb();
        } else {
            setTimeout(function () {
                checkConnectionOfAdapter(cb, counter + 1);
            }, 1000);
        }
    });
}

function checkValueOfState(id, value, cb, counter) {
    counter = counter || 0;
    if (counter > 20) {
        if (cb) cb('Cannot check value Of State ' + id);
        return;
    }

    states.getState(id, function (err, state) {
        if (err) console.error(err);
        if (value === null && !state) {
            if (cb) cb();
        } else
        if (state && (value === undefined || state.val === value)) {
            if (cb) cb();
        } else {
            setTimeout(function () {
                checkValueOfState(id, value, cb, counter + 1);
            }, 500);
        }
    });
}

function sendTo(target, command, message, callback) {
    onStateChanged = function (id, state) {
        if (id === 'messagebox.system.adapter.test.0') {
            callback(state.message);
        }
    };

    states.pushMessage('system.adapter.' + target, {
        command:    command,
        message:    message,
        from:       'system.adapter.test.0',
        callback: {
            message: message,
            id:      sendToID++,
            ack:     false,
            time:    (new Date()).getTime()
        }
    });
}

describe('Test ' + adapterShortName + ' adapter', function() {
    before('Test ' + adapterShortName + ' adapter: Start js-controller', function (_done) {
        this.timeout(600000); // because of first install from npm

        setup.setupController(function () {
            var config = setup.getAdapterConfig();
            // enable adapter
            config.common.enabled  = true;
            config.common.loglevel = 'debug';

            config.native.useGlobalHomebridge = false;
            config.native.globalHomebridgeConfigPath = __dirname + "/homebridge/";
            config.native.libraries = "homebridge-http-webhooks homebridge-sun-position";
            config.native.wrapperConfig = {
                "accessories": [
            		{
                        "accessory" : "SunPosition",
                        "name" : "Sun",
                        "location" : {
                        	"lat" : 49.035924,
                        	"long" : 8.345736
                        }
                    }
                ],

                "platforms": [
            		{
            			"platform": "HttpWebHooks",
            			"webhook_port": "61828",
            			"cache_directory": "./.node-persist/storage",
            			"sensors": [
            				{
            				"id": "sensor1",
            				"name": "Sensor name 1",
            				"type": "contact"
            				},
            				{
            				"id": "sensor2",
            				"name": "Sensor name 2",
            				"type": "motion"
            				},
            				{
            				"id": "sensor3",
            				"name": "Sensor name 3",
            				"type": "occupancy"
            				},
            				{
            				"id": "sensor4",
            				"name": "Sensor name 4",
            				"type": "smoke"
            				},
            				{
            				"id": "sensor5",
            				"name": "Sensor name 5",
            				"type": "temperature"
            				},
            				{
            				"id": "sensor6",
            				"name": "Sensor name 6",
            				"type": "humidity"
            				},
            				{
            				"id": "sensor7",
            				"name": "Sensor name 7",
            				"type": "airquality"
            				},
            				{
            				"id": "sensor8",
            				"name": "Sensor name 8",
            				"type": "airquality"
            				}
            			],
            			"switches": [
            				{
            				"id": "switch1",
            				"name": "Switch name 1",
            				"on_url": "http://localhost:9080/switch1?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch1?off",
            				"off_method": "GET"
            				},
            				{
            				"id": "switch2",
            				"name": "Switch name 2",
            				"on_url": "http://localhost:9080/switch2?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch2?off",
            				"off_method": "GET"
            				},
            				{
            				"id": "switch3",
            				"name": "Switch name 3",
            				"on_url": "http://localhost:9080/switch3?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch3?off",
            				"off_method": "GET"
            				},
            				{
            				"id": "switch4",
            				"name": "Switch name*3",
            				"on_url": "http://localhost:9080/switch3-2?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch3-2?off",
            				"off_method": "GET"
            				}
            			],
            			"pushbuttons": [
            				{
            				"id": "pushbutton1",
            				"name": "Push button name 1",
            				"push_url": "http://localhost:9080/pushbutton1?push",
            				"push_method": "GET"
            				}
            			],
            			"lights": [
            				{
            				"id": "light1",
            				"name": "Light name 1",
            				"on_url": "http://localhost:9080/light1?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/light1?off",
            				"off_method": "GET"
            				}
            			],
            			"thermostats": [
            				{
            				"id": "thermostat1",
            				"name": "Thermostat name 1",
            				"set_target_temperature_url": "http://localhost:9080/thermostat1?targettemperature=%f",
            				"set_target_heating_cooling_state_url": "http://localhost:9080/thermostat1??targetstate=%b"
            				}
            			],
            			"outlets": [
            				{
            				"id": "outlet1",
            				"name": "Outlet name 1",
            				"on_url": "http://localhost:9080/outlet1?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/outlet1?off",
            				"off_method": "GET"
            				}
            			]
            		}
                ]
            };

            setup.setAdapterConfig(config.common, config.native);

            setup.startController(true, function(id, obj) {}, function (id, state) {
                    if (onStateChanged) onStateChanged(id, state);
                },
                function (_objects, _states) {
                    objects = _objects;
                    states  = _states;
                    _done();
                });
        });
    });

    it('Test ' + adapterShortName + ' adapter: Check if adapter started', function (done) {
        this.timeout(60000);
        checkConnectionOfAdapter(function (res) {
            if (res) console.log(res);
            expect(res).not.to.be.equal('Cannot check connection');
            objects.setObject('system.adapter.test.0', {
                    common: {

                    },
                    type: 'instance'
                },
                function () {
                    states.subscribeMessage('system.adapter.test.0');
                    done();
                });
        });
    });

    it('Test ' + adapterShortName + ' adapter: Wait for npm installs', function (done) {
        this.timeout(60000);

        setTimeout(function() {
            done();
        }, 30000);
    });

/*
    PUT YOUR OWN TESTS HERE USING
    it('Testname', function ( done) {
        ...
    });

    You can also use "sendTo" method to send messages to the started adapter
*/

    after('Test ' + adapterShortName + ' adapter: Stop js-controller', function (done) {
        this.timeout(10000);

        setup.stopController(function (normalTerminated) {
            console.log('Adapter normal terminated: ' + normalTerminated);
            done();
        });
    });
});
