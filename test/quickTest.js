/**
 * Created by daniel.irwin on 9/22/16.
 */

describe('QuickTest', function(){

    var metrics = require('../index');

    it('Test', function(done){

        var maxCalls = 2;

        var calls = 0;

        function fin(data){
            console.log('', data);

            if(data.name === 'fancyMeter'){
                calls++;

                if(calls == maxCalls){
                    console.log('meters', factory.getMeters());
                    done();
                }
            }
        }

        var factory = metrics(fin);

        var myMeter = factory.meter('fancyMeter');

        var myMeter2 = factory.meter('fancyMeter');
        //do some stuff
        for(var i = 0; i < 10000; ++i){

        }
        myMeter.end();
        //console.logs are insanely slow
        console.log('hello');
        myMeter.end();

        myMeter2.end();

    });

});