// 导航.js - 更新版
// 初始化地图和全局变量
const map = new AMap.Map("container", {
    zoom: 12,
    center: [104.09, 30.67],
    resizeEnable: true,
    viewMode: "2D",
    mapStyle: 'amap://styles/normal', // 默认标准地图
});

let currentRouteService = null;
let startMarker = null;
let endMarker = null;
let startPOI = null;
let endPOI = null;
let trafficLayer = null;
let satelliteLayer = null;

// 初始化输入提示
function initAutoComplete() {
    AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch'], function() {
        // 起点输入提示
        new AMap.AutoComplete({
            input: "startInput",
            city: "成都"
        }).on("select", function(e) {
            if (e.poi && e.poi.location) {
                startPOI = e.poi;
                updateMarker('start', e.poi.location, e.poi.name);
            }
        });
        
        // 终点输入提示
        new AMap.AutoComplete({
            input: "endInput",
            city: "成都"
        }).on("select", function(e) {
            if (e.poi && e.poi.location) {
                endPOI = e.poi;
                updateMarker('end', e.poi.location, e.poi.name);
            }
        });
    });
}

// 更新标记点
function updateMarker(type, position, title) {
    const iconUrl = type === 'start' 
        ? "https://webapi.amap.com/theme/v1.3/markers/n/start.png"
        : "https://webapi.amap.com/theme/v1.3/markers/n/end.png";
    
    const marker = type === 'start' ? startMarker : endMarker;
    
    if (marker) {
        marker.setPosition(position);
        marker.setTitle(`${type === 'start' ? '起点' : '终点'}: ${title}`);
    } else {
        const newMarker = new AMap.Marker({
            position: position,
            title: `${type === 'start' ? '起点' : '终点'}: ${title}`,
            map: map,
            icon: iconUrl,
            offset: new AMap.Pixel(-13, -30)
        });
        
        if (type === 'start') {
            startMarker = newMarker;
        } else {
            endMarker = newMarker;
        }
    }
}

// 清除路线
function clearRoute() {
    if (currentRouteService) {
        currentRouteService.clear();
        currentRouteService = null;
    }
    document.getElementById("routeContent").innerHTML = "";
}

// 显示加载状态
function showLoading(show) {
    document.getElementById("loadingIndicator").style.display = show ? "flex" : "none";
}

// 路线查询主函数
async function searchRoute() {
    if (!startPOI || !endPOI) {
        alert("请先选择起点和终点位置");
        return;
    }

    const routeType = document.getElementById("routeType").value;
    const start = startPOI.location;
    const end = endPOI.location;
    
    clearRoute();
    showLoading(true);
    
    try {
        // 根据类型查询路线
        const result = await executeRouteSearch(routeType, start, end);
        
        // 显示结果面板（无论之前是否被关闭）
        document.getElementById("resultPanel").style.display = "flex";
        map.setFitView();
        
        // 显示路线摘要信息
        displayRouteSummary(result, routeType);
        
        console.log("路线查询成功:", result);
    } catch (error) {
        console.error("路线查询失败:", error);
        alert(`路线查询失败: ${error.message || "请重试"}`);
    } finally {
        showLoading(false);
    }
}

// 显示路线摘要信息
function displayRouteSummary(result, routeType) {
    const routeContent = document.getElementById("routeContent");
    let summaryHTML = '';
    
    if (routeType === 'driving' || routeType === 'walking') {
        const path = result.routes[0];
        const distance = (path.distance / 1000).toFixed(1);
        const time = Math.round(path.time / 60);
        
        summaryHTML = `
            <div class="route-summary">
                <div class="summary-item">
                    <i class="fas fa-road"></i>
                    <span>总距离: ${distance} 公里</span>
                </div>
                <div class="summary-item">
                    <i class="fas fa-clock"></i>
                    <span>预计时间: ${time} 分钟</span>
                </div>
            </div>
            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
        `;
    } else if (routeType === 'transit') {
        const path = result.transits[0];
        const distance = (path.distance / 1000).toFixed(1);
        const time = Math.round(path.duration / 60);
        const cost = path.cost ? path.cost : '免费';
        
        summaryHTML = `
            <div class="route-summary">
                <div class="summary-item">
                    <i class="fas fa-road"></i>
                    <span>总距离: ${distance} 公里</span>
                </div>
                <div class="summary-item">
                    <i class="fas fa-clock"></i>
                    <span>预计时间: ${time} 分钟</span>
                </div>
                <div class="summary-item">
                    <i class="fas fa-coins"></i>
                    <span>预计费用: ${cost}</span>
                </div>
            </div>
            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
        `;
    }
    
    // 在路线详情前插入摘要信息
    routeContent.insertAdjacentHTML('afterbegin', summaryHTML);
}

// 执行路线查询
function executeRouteSearch(routeType, start, end) {
    return new Promise((resolve, reject) => {
        AMap.plugin(getPluginName(routeType), function() {
            const options = {
                map: map,
                panel: "routeContent",
                hideMarkers: true,
                showTraffic: routeType === "driving"
            };
            
            if (routeType === "transit") {
                options.city = "北京";
                options.policy = AMap.TransferPolicy.LEAST_TIME;
                currentRouteService = new AMap.Transfer(options);
            } else if (routeType === "driving") {
                options.policy = AMap.DrivingPolicy.LEAST_TIME;
                currentRouteService = new AMap.Driving(options);
            } else {
                currentRouteService = new AMap.Walking(options);
            }
            
            currentRouteService.search(start, end, function(status, result) {
                if (status === 'complete') {
                    resolve(result);
                } else {
                    reject(new Error(result?.info || "查询失败"));
                }
            });
        });
    });
}

// 获取插件名
function getPluginName(routeType) {
    const plugins = {
        driving: 'AMap.Driving',
        transit: 'AMap.Transfer',
        walking: 'AMap.Walking'
    };
    return plugins[routeType];
}

// 切换交通图层
function toggleTrafficLayer() {
    const trafficBtn = document.getElementById('trafficBtn');
    
    if (!trafficLayer) {
        trafficLayer = new AMap.TileLayer.Traffic({
            zIndex: 10
        });
        trafficLayer.setMap(map);
        trafficBtn.innerHTML = '<i class="fas fa-road"></i> 关闭交通';
    } else {
        trafficLayer.setMap(null);
        trafficLayer = null;
        trafficBtn.innerHTML = '<i class="fas fa-road"></i> 显示交通';
    }
}

// 切换地图类型
function toggleMapType() {
    const mapTypeBtn = document.getElementById('mapTypeBtn');
    
    if (!satelliteLayer) {
        satelliteLayer = new AMap.TileLayer.Satellite({
            zIndex: 0
        });
        map.add(satelliteLayer);
        mapTypeBtn.innerHTML = '<i class="fas fa-globe"></i> 标准地图';
    } else {
        map.remove(satelliteLayer);
        satelliteLayer = null;
        mapTypeBtn.innerHTML = '<i class="fas fa-globe"></i> 卫星地图';
    }
}


// 初始化
document.addEventListener("DOMContentLoaded", function() {
    // 初始化输入提示
    initAutoComplete();
    
    // 绑定查询按钮事件
    document.getElementById("searchBtn").addEventListener("click", searchRoute);
    
    // 绑定关闭按钮事件 - 只隐藏面板不清理数据
    document.getElementById("closePanelBtn").addEventListener("click", function() {
        document.getElementById("resultPanel").style.display = "none";
    });
    
    // 添加地图控件
    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function() {
        map.addControl(new AMap.ToolBar({
            position: { top: '20px', right: '370px' }
        }));
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.OverView({ isOpen: true }));
    });
    
    // 添加交通图层切换按钮
    const controlPanel = document.getElementById('controlPanel');
    const trafficBtn = document.createElement('button');
    trafficBtn.id = 'trafficBtn';
    trafficBtn.className = 'btn';
    trafficBtn.innerHTML = '<i class="fas fa-road"></i> 显示交通';
    trafficBtn.addEventListener('click', toggleTrafficLayer);
    controlPanel.appendChild(trafficBtn);
    
    // 添加地图类型切换按钮
    const mapTypeBtn = document.createElement('button');
    mapTypeBtn.id = 'mapTypeBtn';
    mapTypeBtn.className = 'btn';
    mapTypeBtn.innerHTML = '<i class="fas fa-globe"></i> 卫星地图';
    mapTypeBtn.addEventListener('click', toggleMapType);
    controlPanel.appendChild(mapTypeBtn);

    
    // 添加样式到结果面板
    const resultPanel = document.getElementById('resultPanel');
    resultPanel.querySelector('.panel-content').style.cssText = `
        padding: 20px;
        overflow-y: auto;
        flex-grow: 1;
        background-color: white;
    `;
    
    // 添加路线摘要样式
    const style = document.createElement('style');
    style.textContent = `
        .route-summary {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }
        
        .summary-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background-color: #f8f9fa;
            border-radius: 6px;
        }
        
        .summary-item i {
            color: var(--primary-color);
            width: 20px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
});