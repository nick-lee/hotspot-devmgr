(function (countlyDevmgr, $, undefined) {

    // Private Properties
    var _periodObj = {},
        _devicesDb = {},        
        _activeAppKey = 0,
        _countries = [],
        _chart,
        _dataTable,
        _chartElementId = "geo-chart",
        _chartOptions = {
            displayMode:'region',
            colorAxis:{minValue:0, colors:['#D7F1D8', '#6BB96E']},
            resolution:'countries',
            toolTip:{textStyle:{color:'#FF0000'}, showColorCode:false},
            legend:"none",
            backgroundColor:"transparent",
            datalessRegionColor:"#FFF"
        },
        _countryMap = {},
        _initialized = false;

    // Public Methods
    countlyDevmgr.initialize = function () {
        if (_initialized && _activeAppKey == countlyCommon.ACTIVE_APP_KEY) {
            return countlyDevmgr.refresh();
        }

        // Load local country names
        $.get('/localization/countries/' + countlyCommon.BROWSER_LANG_SHORT + '/country.json', function (data) {
            _countryMap = data;
        });

        if (!countlyCommon.DEBUG) {
            _activeAppKey = countlyCommon.ACTIVE_APP_KEY;
            _initialized = true;

            return $.ajax({
                type:"GET",
                url:countlyCommon.API_PARTS.data.r,
                data:{
                    "api_key":countlyGlobal.member.api_key,
                    "app_id":countlyCommon.ACTIVE_APP_ID,
                    "method":"locations"
                },
                dataType:"jsonp",
                success:function (json) {
                    _devicesDb = json;
                    setMeta();
                }
            });
        } else {
            _devicesDb = {"2012":{}};
            return true;
        }
    };

    countlyDevmgr.refresh = function () {
        _periodObj = countlyCommon.periodObj;

        if (!countlyCommon.DEBUG) {

            if (_activeAppKey != countlyCommon.ACTIVE_APP_KEY) {
                _activeAppKey = countlyCommon.ACTIVE_APP_KEY;
                return countlyDevmgr.initialize();
            }

            return $.ajax({
                type:"GET",
                url:countlyCommon.API_PARTS.data.r,
                data:{
                    "api_key":countlyGlobal.member.api_key,
                    "app_id":countlyCommon.ACTIVE_APP_ID,
                    "method":"locations",
                    "action":"refresh"
                },
                dataType:"jsonp",
                success:function (json) {
                    countlyCommon.extendDbObj(_devicesDb, json);
                    setMeta();
                }
            });
        } else {
            _devicesDb = {"2012":{}};
            return true;
        }
    };

    countlyDevmgr.reset_mgr = function () {
        _devicesDb = {};
        setMeta();
    };

    /**  mode + channel + ssd 
     * INPUT : Options - {serial_no:"00:20:60:00:00:28","mode":"SmartAd Model II","lat":104.874934,"lng":33.39856,
     *         "hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network "}
     * RETURN : return the collection as below:
     *          {serial_no:"00:20:60:00:00:28","mode":"SmartAd Model II","lng":104.874934,"lat":33.39856,
     *         "hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network "}     
     */
    countlyDevmgr.updateDevice = function(deviceId,ssid,wifimode,channel )
    {

    };

    /**
     * INPUT : deviceId - serial_no for device; 
               name : download
     * RETURN: deviceId + version + sucess / fail
     */
    countlyDevmgr.updateFireware = function(deviceId,cur_ver,latest_ver){

    };

    countlyDevmgr.drawGeoChart = function (options) {

        _periodObj = countlyCommon.periodObj;

        if (options) {
            if (options.chartElementId) {
                _chartElementId = options.chartElementId;
            }

            if (options.height) {
                _chartOptions.height = options.height;

                //preserve the aspect ratio of the chart if height is given
                _chartOptions.width = (options.height * 556 / 347);
            }
        }

        if (google.visualization) {
            draw();
        } else {
            google.load('visualization', '1', {'packages':['geochart'], callback:draw});
        }
    };

    countlyDevmgr.refreshGeoChart = function () {
        if (google.visualization) {
            reDraw();
        } else {
            google.load('visualization', '1', {'packages':['geochart'], callback:draw});
        }
    };


    countlyDevmgr.getDevicesBySubnet = function(options){
        var tableData={};
        var network_id=options;
        tableData.devices=[];
        ret=$.ajax({
                type:"GET",
                url:"http://192.168.2.2:7557/devices",
                async:false,
                dataType:"json",
                success:function (json) {
                     _devicesDb = json;
                },
                error:function (json) {
                    alert("get devices error");
                }
            });
        var j = 0;
        for (var i = 0; i < _devicesDb.length; i++) {
            if(_devicesDb[i]._tags){
                console.log(_devicesDb);
                console.log("get device by tag!");
                console.log(_devicesDb[i]._tags[0]);
                console.log(network_id);
                if (_devicesDb[i]._tags[0] == network_id) {
                    if (!tableData.devices[j]) {
                        tableData.devices[j] = {};
                    }
                    tableData.devices[j].serial_no = _devicesDb[i]._id;
                    tableData.devices[j].mode = _devicesDb[i].InternetGatewayDevice.DeviceInfo.ProductClass._value;
                    //tableData.devices[j].register_time = "NULL";
                    //tableData.devices[j].online_status = _devicesDb[i]["summary.lastInform"];
                    //tableData.devices[j].firmware_ver = _devicesDb[i].InternetGatewayDevice.DeviceInfo.ModemFirmwareVersion._value;
                    //tableData.devices[j].ip_addr = _devicesDb[i].InternetGatewayDevice.WANDevice['1'].WANConnectionDevice['1'].WANIPConnection['1'].ExternalIPAddress._value;
                    //tableData.devices[j].hotspot_info = _devicesDb[i].InternetGatewayDevice.DeviceInfo.Description._value;
                    //tableData.devices[j].up_time = _devicesDb[i].InternetGatewayDevice.DeviceInfo.UpTime._value;
                    j += 1;
                }
            }
        }
        //return _.compact(tableData);
        console.log("get subnet info");
        console.log(tableData);
        return tableData;
        /* not return all fields , only serail_no, mode, and x,y */
        /*devicesData = [
            {serial_no:"00:20:60:00:00:22","mode":"SmartAd Model II","aix":134.0,"aiy":134.00},
            {serial_no:"00:20:60:00:00:23","mode":"SmartAd Model II","aix":134.0,"aiy":134.00},
            {serial_no:"00:20:60:00:00:24","mode":"SmartAd Model II","aix":134.0,"aiy":134.00},
            {serial_no:"00:20:60:00:00:25","mode":"SmartAd Model II","aix":134.0,"aiy":134.00},
            {serial_no:"00:20:60:00:00:26","mode":"SmartAd Model II","aix":134.0,"aiy":134.00},
            {serial_no:"00:20:60:00:00:27","mode":"SmartAd Model II","aix":134.0,"aiy":134.00},
            {serial_no:"00:20:60:00:00:28","mode":"SmartAd Model II","aix":134.0,"aiy":134.00}
        ];*/        
    };

    /**
     * INPUT : subnetId - subnetwork id 
     * OUTPUT : {name:appName,category:category,timezone:timezone,country:country,lat:lat,lng:lng}
     */
    countlyDevmgr.getSubnetById=function(subnetId){


        var subnet_info = [{subnetId:"535fbfdef4307a3405000001",name:"奥克斯商场",category:"娱乐",timezone:"",country:"中国",lng:104.07854,lat:30.548681},
                           {subnetId:"534e8f15e7de240645000001",name:"天府软件园",category:"娱乐",timezone:"",country:"中国",lng:104.077588,lat:30.55022}
                            ];
        var _cur_net ={};
        _cur_net = _.where(subnet_info, {subnetId:subnetId});   
        console.log("subnetid = ");
        console.log(subnetId);
        var activeApp = countlyGlobal['apps'][subnetId];
        console.log(activeApp);              

        return activeApp;        
    };


    countlyDevmgr.getCurrentDevice = function(){
        var temp = [];
        if( countlyCommon.ACTIVE_DEV == 0)
            return temp;
        else 
            return countlyDevmgr.getDeviceById(countlyCommon.ACTIVE_DEV);
    };

    countlyDevmgr.getFirewareLatestVer= function(){

        return "1.0.9";
    }

    /**
     * INPUT : deviceId - serial_no of device
     * RETURN : true - need update otherwise , no update
     */
    countlyDevmgr.isFirewareUpdate = function(curVer, latestVer)
    {
        /* compare the latest and current fireware version on target*/

        if( curVer > latestVer )
            return false;
        else
            return true;
    }
    /**
     * DESCR : get template information by user
     * INPUT : userId - user id 
     * OUTPUT : 
     */
    countlyDevmgr.getTemplateByUser = function(userId)
    {

       var temps = {templates:[
                        {id:1,condition_temp:"serial number",judgement:"=",input:"00:20:60:00:00:23"},
                        {id:2,condition_temp:"subnetwork id",judgement:"=",input:"534ba01a9d6005b305000009"},
                        {id:3,condition_temp:"subnetwork id",judgement:"=",input:"534ba01a9d6005b305000009"}],
                        params:{wifimode:1,channel:2,ssid:"天府热点"},
                    };

       var temp_info = [{id:1,condition_temp:"serial number",judgement:"=",input:"00:20:60:00:00:23"},
                        {id:2,condition_temp:"subnetwork id",judgement:"=",input:"534ba01a9d6005b305000009"},
                        {id:3,condition_temp:"subnetwork id",judgement:"=",input:"534ba01a9d6005b305000009"}
                       ];

        var temp_items = [
            {templates:[
                        {id:1,condition_temp:"序列号",judgement:"=",input:"00:20:60:00:00:23"},
                        {id:2,condition_temp:"子网ID号",judgement:"=",input:"534ba01a9d6005b305000009"},
                        {id:3,condition_temp:"子网ID号",judgement:"=",input:"534ba01a9d6005b305000009"}
                        ],
             params:{wifimode:1,channel:2,ssid:"天府热点"}
            },
            {templates:[
                        {id:1,condition_temp:"MAC地址",judgement:"=",input:"00:20:60:00:00:24"},
                        {id:2,condition_temp:"子网ID号",judgement:"=",input:"534ba01a9d6005b305000009"},
                        {id:3,condition_temp:"子网ID号",judgement:"=",input:"534ba01a9d6005b305000009"}
                        ],
             params:{wifimode:1,channel:2,ssid:"高克斯热点"}
            },
            {templates:[
                        {id:1,condition_temp:"序列号",judgement:"=",input:"00:20:60:00:00:24"},
                        {id:2,condition_temp:"subnetwork id",judgement:"=",input:"534ba01a9d6005b305000009"},
                        {id:3,condition_temp:"subnetwork id",judgement:"=",input:"534ba01a9d6005b305000009"}
                        ],
             params:{wifimode:1,channel:2,ssid:"高克斯热点"}
            }            

        ];               

        console.log(temps["templates"]);
        console.log(temps["params"]);
        var temp=[];
        return temp_items;        
    };

  countlyDevmgr.getDeviceById = function(deviceId){
        var devicesData={};
        var deviceTable=[];
        myurl = "http://192.168.2.2:7557/devices?query={"+"\""+"_id"+"\""+":"+"\""+deviceId+"\""+"}";
        ret=$.ajax({
                type:"GET",
                url:myurl,
                async:false,
                dataType:"json",
                success:function (json) {
                     _devicesDb = json;
                     console.log("return data");
                    console.log(_devicesDb[0]);
                },
                error:function (json) {
                    alert("get devices error");
                }
            });


        var _curSubNet = countlyDevmgr.getSubnetById(countlyCommon.ACTIVE_APP_ID);
        devicesData.serial_no=_devicesDb[0]._id;
        devicesData.mode=_devicesDb[0].InternetGatewayDevice.DeviceInfo.ProductClass._value;
        if( _.size(_curSubNet) == 0 ){
            deviceData.lng = 104.077588;
            deviceData.lat = 30.55022;
        }else{
            devicesData.lng=_curSubNet["lng"];
            devicesData.lat=_curSubNet["lat"];            
        }
        devicesData.register_time=_devicesDb[0]._registered;
        devicesData.online_status=_devicesDb[0]._lastInform;
        devicesData.fireware_ver=_devicesDb[0].InternetGatewayDevice.DeviceInfo.ModemFirmwareVersion._value;
        devicesData.ip_addr=_devicesDb[0].InternetGatewayDevice.WANDevice['1'].WANConnectionDevice['1'].WANIPConnection['1'].ExternalIPAddress._value;
        devicesData.hotspot_info=_devicesDb[0].InternetGatewayDevice.DeviceInfo.Description._value;
        devicesData.up_time=_devicesDb[0].InternetGatewayDevice.DeviceInfo.UpTime._value;
        devicesData.wifimode = _devicesDb[0].InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].Standard._value;
        devicesData.channel = _devicesDb[0].InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].Channel._value;
        devicesData.subnetId = _devicesDb[0]._tags[0];

        deviceTable[0] = devicesData;
        return deviceTable;
     
    };

    /**
     * get all fields of a specific devices
     * input: deviceId - the serial_no of device
     * return: a arrary of the devices
     */
    countlyDevmgr.getDeviceById_old = function(deviceId){
        var devicesData={};
        var deviceTable=[];
        myurl = "http://192.168.2.2:7557/devices?query={"+"\""+"_id"+"\""+":"+"\""+deviceId+"\""+"}";
        ret=$.ajax({
                type:"GET",
                url:myurl,
                async:false,
                dataType:"json",
                success:function (json) {
                    console.log("get device!");
                    console.log(json);
                     _devicesDb = json;
                },
                error:function (json) {
                    alert("get devices error");
                }
            });
        devicesData["serial_no"]=_devicesDb[0]._id;
        devicesData["mode"]=_devicesDb[0].InternetGatewayDevice.DeviceInfo.ProductClass._value;
        /* only return one record , with all fields */
        /*devicesData = [
            {serial_no:"00:20:60:00:00:22","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"},
            {serial_no:"00:20:60:00:00:23","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"},
            {serial_no:"00:20:60:00:00:24","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"},            
            {serial_no:"00:20:60:00:00:25","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"},
            {serial_no:"00:20:60:00:00:26","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"},
            {serial_no:"00:20:60:00:00:27","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"},
            {serial_no:"00:20:60:00:00:28","mode":"SmartAd Model II","aix":134.0,"aiy":134.00,
            "register_time":"2009/08/08-21:00","online_status":"oneline","fireware_ver":"1.0.8","ip_addr":"100.0.0.245","hotspot_info":"Tianfu Software Park,Tianfu Stree Hotspot Network ","up_time":"2010/08/08:21:00"}                                                
        ];*/        
        /*
        var _cur_dev = _.where(devicesData, {serial_no:countlyCommon.ACTIVE_DEV});
        console.log("get current one!");
        console.log(_cur_dev);
        */
        /*var _cur_dev = _.where(devicesData, {serial_no:deviceId});
        console.log("get current one!");
        console.log(_cur_dev);

        return _cur_dev;*/
        deviceTable[0] = devicesData;
        console.log("return devices!");
        console.log(deviceTable);
        return deviceTable;
    };

    countlyDevmgr.reset = function(deviceId){

    };

    /**
     * INPUT : deviceId - serial_no for device; 
     * RETURN: deviceId + sucess / fail
     */
    countlyDevmgr.reboot = function(deviceId){
        var data_reboot = {"name":"reboot"},
        myurl = "http://192.168.2.2:7557/devices/"+deviceId+"/tasks?timeout=3000&connection_request";
        ret=$.ajax({
            type:"POST",
            url:myurl,
            data: JSON.stringify(data_reboot),
            success:function (result) {
                alert("success");
                self.refresh();
            },
            error:function (result) {
                alert("error");
            }
        });
        return 0;
    };

countlyDevmgr.setParams = function(deviceId,wlanSsid){
        var data_set = {"name":"setParameterValues", "parameterValues":[["summary.wlanSsid",wlanSsid]]},
        myurl = "http://192.168.2.2:7557/devices/"+deviceId+"/tasks?timeout=3000&connection_request";
        ret=$.ajax({
            type:"POST",
            url:myurl,
            data: JSON.stringify(data_set),
            success:function (result) {
                alert("success");
                self.refresh();
            },
            error:function (result) {
                alert("error");
            }
        });
        return 0;
    };
}(window.countlyDevmgr = window.countlyDevmgr || {}, jQuery));