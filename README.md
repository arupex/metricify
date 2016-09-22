# metricify
Metrics Done Easy

[![npm version](https://badge.fury.io/js/subpub.svg)](https://badge.fury.io/js/metricify) [![dependencies](https://david-dm.org/arupex/metricify.svg)](http://github.com/arupex/metricify) ![Build Status](https://api.travis-ci.org/arupex/metricify.svg?branch=master) <a href='https://pledgie.com/campaigns/31873'><img alt='Pledge To Arupex!' src='https://pledgie.com/campaigns/31873.png?skin_name=chrome' border='0' ></a> ![lifetimeDownloadCount](https://img.shields.io/npm/dt/metricify.svg?maxAge=2592000)



#Install

        npm install metricify --save


#Usage

        function optionalCallbackOnAllMetersFinish(meterData){

        }

        var metrics = require('metricify');

        var factory = metrics(optionalCallbackOnAllMetersFinish);

        var myMeter = factory.meter('myMeter');

        //do some stuff
        for(var i = 0; i < 10000; ++i){}

        myMeter.end();


        //factory.getMeters(); returns meter min/max and data points

        //factory.calcMetrics(); //returns detailed stats using stats-lite