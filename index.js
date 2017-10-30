/**
 * Created by daniel.irwin on 11/13/15.
 */

'use strict';
const stats = require('stats-lite');
module.exports = class MeterFactory {


    /**
     *
     * @param meterEndCallback - callback that gets hit on each meter end()
     * @param maxMeters - max number of points a meter can collect before it throws away FIFO
     * @param resolutionMultiplier - multiply by time values (values cononically in nanoseconds,
     *      i.e. if you want milliseconds 1e-6 )
     */
    constructor(meterEndCallback, maxMeters, resolutionMultiplier) {

        this.meterEndCallback = meterEndCallback;

        this.MAX_METERS = maxMeters || 10000;

        this.savedMetricData = {};

        this.resolutionMultiplier = (typeof resolutionMultiplier === 'number')?resolutionMultiplier:1;
    }

    meter(name) {
        let start = process.hrtime();
        return {
            end: () => {
                let end = process.hrtime(start);
                this.calcMeter({
                    name: name,
                    start: start * this.resolutionMultiplier,
                    end: ((end[0] * 1e9 + end[1])) * this.resolutionMultiplier// nanoseconds if you want millis * 1e-6
                });
            }
        };
    }

    calcMetrics() {
        let meterStats = {};
        Object.keys(this.savedMetricData).forEach((key) => {
            let currentMeter = this.savedMetricData[key];
            let datum = currentMeter.datum;
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

    calcMeter(meter) {
        let atMeter = this.savedMetricData[meter.name];

        if (!atMeter) {
            atMeter = {
                min: 100000000,
                max: -100000000,
                datum: [],
                count: 0
            };
        }
        else if (atMeter.datum && atMeter.datum.length > this.MAX_METERS) {
            atMeter.datum.shift();
        }

        atMeter.datum.push(meter.end);

        this.savedMetricData[meter.name] = {
            min: (atMeter.min > meter.end) ? meter.end : atMeter.min,
            max: (atMeter.max < meter.end) ? meter.end : atMeter.max,
            count: ++atMeter.count,
            datum: atMeter.datum,
            stats: atMeter.stats
        };

        if (typeof this.meterEndCallback === 'function') {
            this.meterEndCallback({
                name: meter.name,
                diff: meter.end,
                min: this.savedMetricData[meter.name].min,
                max: this.savedMetricData[meter.name].max
            });
        }
        return meter.end;
    }

    promiseMeter(name, functionThatResultsInPromise, argumentsAsArray, scope) {
        if(typeof name === 'function' && typeof functionThatResultsInPromise !== 'function') {
            functionThatResultsInPromise = name;
            name = 'no-named-promise-meter';
        }
        if(typeof argumentsAsArray !== 'object' || !Array.isArray(argumentsAsArray)){
            argumentsAsArray = [];
        }
        let localMeter = this.meter(name);
        //only ends meter on resolve, reject causes meter to disolve
        return functionThatResultsInPromise.apply(scope, argumentsAsArray).then((data) => {
            localMeter.end();
            return data;
        });
    }

    getMeters() {
        return this.savedMetricData;
    }
};