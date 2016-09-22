/**
 * Created by daniel.irwin on 11/13/15.
 */

'use strict';
module.exports = (function(){

    var stats = require('stats-lite');

    return function(meterEndCallback, maxMeters) {

        const MAX_METERS = maxMeters || 10000;

        var savedMetricData = {};

        function meter(name) {
            var start = process.hrtime();
            return {
                end: function () {
                    var end = process.hrtime(start);
                    calcMeter({
                        name: name,
                        start: start,
                        end: ((end[0] * 1e9 + end[1]))// nanoseconds if you want millis * 1e-6
                    });
                }
            };
        }

        function calcMetrics() {
            var meterStats = {};
            Object.keys(savedMetricData).forEach(function (key) {
                var currentMeter = savedMetricData[key];
                var datum = currentMeter.datum;
                if (!currentMeter.stats) {
                    currentMeter.stats = {};
                }
                meterStats[currentMeter.name] = {
                    sum: stats.sum(datum),
                    mean: stats.mean(datum),
                    median: stats.median(datum),
                    mode: stats.mode(datum),
                    variance: stats.variance(datum),
                    std_dev: stats.stdev(datum),
                    p50: stats.percentile(datum, 0.50),
                    p75: stats.percentile(datum, 0.75),
                    p95: stats.percentile(datum, 0.95),
                    p98: stats.percentile(datum, 0.98),
                    p99: stats.percentile(datum, 0.99),
                    p999: stats.percentile(datum, 0.999),
                    min: currentMeter.min,
                    max: currentMeter.max,
                    count: currentMeter.count
                };
            });
            return meterStats;
        }

        function calcMeter(meter) {
            var atMeter = savedMetricData[meter.name];

            if(!atMeter){
                atMeter = {
                  min : 100000000,
                  max : -100000000,
                  datum : [],
                  count : 0
                };
            }
            else if(atMeter.datum && atMeter.datum.length > MAX_METERS) {
                atMeter.datum.shift();
            }

            atMeter.datum.push(meter.end);

            savedMetricData[meter.name] = {
                min: (atMeter.min > meter.end) ? meter.end : atMeter.min,
                max: (atMeter.max < meter.end) ? meter.end : atMeter.max,
                count: ++atMeter.count,
                datum: atMeter.datum,
                stats: atMeter.stats
            };


            if(typeof meterEndCallback === 'function'){
                meterEndCallback({
                    name : meter.name,
                    diff : meter.end,
                    min : savedMetricData[meter.name].min,
                    max : savedMetricData[meter.name].max
                });
            }

            return meter.end;
        }

        return {
            meter: meter,
            calcMetrics : calcMetrics,
            getMeters : function(){return savedMetricData;}
        };
    };

})();