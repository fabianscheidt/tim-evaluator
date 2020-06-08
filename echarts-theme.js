(function (root, factory) {if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports', 'echarts'], factory);
} else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports, require('echarts'));
} else {
    // Browser globals
    factory({}, root.echarts);
}
}(this, function (exports, echarts) {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    
    var colorPalette = [
        '#a0c63a','#009993','#343084','#a42384','#d32027',
        '#fedb00','#17ad6d','#6b2b85','#bf2459','#e97924',
        '#84be43','#028798','#572d85','#ad2572','#d94b27'
    ];
    
    var theme = {
        
        color: colorPalette,
        
        title: {
            textStyle: {
                fontWeight: 'normal',
                color: '#000000'
            }
        },
        
        visualMap: {
            color:['#d32027','#fedb00']
        },
        
        toolbox: {
            iconStyle: {
                normal: {
                    borderColor: colorPalette[0]
                }
            }
        },
        
        tooltip: {
            backgroundColor: 'rgba(50,50,50,0.8)',
            axisPointer : {
                type : 'line',
                lineStyle : {
                    color: '#000000',
                    type: 'dashed'
                },
                crossStyle: {
                    color: '#000000'
                },
                shadowStyle : {
                    color: 'rgba(200,200,200,0.3)'
                }
            }
        },
        
        dataZoom: {
            dataBackgroundColor: 'rgba(181,195,52,0.3)',
            fillerColor: 'rgba(181,195,52,0.2)',
            handleColor: '#000000'
        },
        
        categoryAxis: {
            axisLine: {
                lineStyle: {
                    color: '#000000'
                }
            },
            splitLine: {
                show: false
            }
        },
        
        valueAxis: {
            axisLine: {
                show: false
            },
            splitArea : {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: ['#000000'],
                    type: 'dashed'
                }
            }
        },
        
        timeline: {
            lineStyle: {
                color: '#000000'
            },
            controlStyle: {
                normal: {
                    color: '#000000',
                    borderColor: '#000000'
                }
            },
            symbol: 'emptyCircle',
            symbolSize: 3
        },
        
        line: {
            itemStyle: {
                normal: {
                    borderWidth:2,
                    borderColor:'#fff',
                    lineStyle: {
                        width: 3
                    }
                },
                emphasis: {
                    borderWidth:0
                }
            },
            symbol: 'circle',
            symbolSize: 3.5
        },
        
        candlestick: {
            itemStyle: {
                normal: {
                    color: '#d32027',
                    color0: '#84be43',
                    lineStyle: {
                        width: 1,
                        color: '#d32027',
                        color0: '#84be43'
                    }
                }
            }
        },
        
        graph: {
            color: colorPalette
        },
        
        map: {
            label: {
                normal: {
                    textStyle: {
                        color: '#d32027'
                    }
                },
                emphasis: {
                    textStyle: {
                        color: 'rgb(100,0,0)'
                    }
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#ddd',
                    borderColor: '#eee'
                },
                emphasis: {
                    areaColor: '#e97924'
                }
            }
        },
        
        gauge: {
            axisLine: {
                lineStyle: {
                    color: [[0.2, '#84be43'],[0.8, '#028798'],[1, '#d32027']]
                }
            },
            axisTick: {
                splitNumber: 2,
                length: 5,
                lineStyle: {
                    color: '#fff'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            },
            splitLine: {
                length: '5%',
                lineStyle: {
                    color: '#fff'
                }
            },
            title : {
                offsetCenter: [0, -20]
            }
        }
    };
    
    echarts.registerTheme('tim-evaluator', theme);
}));
