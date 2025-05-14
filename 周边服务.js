document.addEventListener('DOMContentLoaded', function () {
    const map = new AMap.Map('map', {
        zoom: 12,
        resizeEnable: true,
        viewMode: "2D"
    });

    const serviceList = document.getElementById('serviceList');
    const keywordInput = document.getElementById('keyword');
    const distanceInput = document.getElementById('distance');
    const searchBtn = document.getElementById('searchBtn');
    const locationError = document.getElementById('locationError');
    const keywordSuggestions = document.getElementById('keywordSuggestions'); // 新增提示容器

    // 初始化定位插件
    AMap.plugin('AMap.Geolocation', function () {
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000
        });

        map.addControl(geolocation);

        // 获取当前位置
        geolocation.getCurrentPosition(function (status, result) {
            if (status === 'complete' && result.info === 'SUCCESS') {
                const currentPosition = result.position;
                map.setCenter(currentPosition);

                // 初始化地点搜索插件
                AMap.plugin('AMap.PlaceSearch', function () {
                    const placeSearch = new AMap.PlaceSearch({
                        pageSize: 10,
                        pageIndex: 1,
                        map: map,
                        panel: 'serviceList'
                    });

                    // 初始化自动完成插件
                    initAutoComplete();

                    // 点击搜索按钮事件
                    searchBtn.addEventListener('click', function () {
                        // 隐藏提示列表
                        keywordSuggestions.classList.add('hidden');
                        
                        const keyword = keywordInput.value;
                        const distance = parseInt(distanceInput.value);

                        // 判断输入的是景点类型还是景点名称
                        if (isAttractionType(keyword)) {
                            // 如果是景点类型，需要设定查找范围
                            if (isNaN(distance) || distance <= 0) {
                                alert('请输入有效的查找距离');
                                return;
                            }
                            placeSearch.searchNearBy(keyword, currentPosition, distance, function (status, result) {
                                if (status === 'complete' && result.info === 'OK') {
                                    console.log('周边服务设施搜索成功', result);
                                } else {
                                    console.error('周边服务设施搜索失败', result);
                                    alert('周边服务设施搜索失败，请稍后重试');
                                }
                            });
                        } else {
                            // 如果是景点名称，直接定位到地图上
                            placeSearch.search(keyword, function (status, result) {
                                if (status === 'complete' && result.info === 'OK' && result.poiList.pois.length > 0) {
                                    const poi = result.poiList.pois[0];
                                    map.setCenter(poi.location);
                                    map.setZoom(15); // 设置合适的缩放级别
                                    console.log('景点定位成功', poi);
                                } else {
                                    console.error('景点定位失败', result);
                                    alert('景点定位失败，请检查输入的景点名称是否正确');
                                }
                            });
                        }
                    });
                });
            } else {
                locationError.textContent = '获取当前位置失败，请确保您已允许浏览器获取位置信息或检查网络连接。';
                console.error('获取当前位置失败', result);
            }
        });
    });

    // 点击页面其他地方关闭提示列表
    document.addEventListener('click', function (e) {
        if (!keywordInput.contains(e.target) && !keywordSuggestions.contains(e.target)) {
            keywordSuggestions.classList.add('hidden');
        }
    });

    // 判断输入的是否为景点类型
    function isAttractionType(keyword) {
        const attractionTypes = ['公园', '博物馆', '古迹', '自然风光', '餐厅', '酒店', '超市'];
        return attractionTypes.some(type => keyword.includes(type));
    }

    // 初始化输入提示
    function initAutoComplete() {
        AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch'], function() {
            // 关键词输入提示
            const autoComplete = new AMap.AutoComplete({
                input: "keyword",
                city: "成都", // 设置城市
                datatype: 'poi',
                type: '风景名胜'
            });

            autoComplete.on("select", function(e) {
                if (e.poi && e.poi.name) {
                    keywordInput.value = e.poi.name;
                    keywordSuggestions.classList.add('hidden');
                }
            });

            // 监听输入变化，获取提示
            keywordInput.addEventListener('input', function (e) {
                const keyword = e.target.value.trim();
                if (keyword.length < 2) { // 至少输入2个字符才触发提示
                    keywordSuggestions.classList.add('hidden');
                    return;
                }

                // 调用自动完成API
                autoComplete.search(keyword, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        renderSuggestions(result.tips);
                    } else {
                        keywordSuggestions.innerHTML = '<div class="px-4 py-2 text-gray-500">未找到相关结果</div>';
                        keywordSuggestions.classList.remove('hidden');
                    }
                });
            });
        });
    }

    // 渲染提示列表
    function renderSuggestions(tips) {
        if (!tips || tips.length === 0) {
            keywordSuggestions.innerHTML = '<div class="px-4 py-2 text-gray-500">未找到相关结果</div>';
            keywordSuggestions.classList.remove('hidden');
            return;
        }

        keywordSuggestions.innerHTML = '';
        tips.forEach(tip => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            suggestionItem.textContent = tip.name;
            if (tip.district) {
                suggestionItem.textContent += ` (${tip.district})`;
            }

            // 点击选择提示项
            suggestionItem.addEventListener('click', function () {
                keywordInput.value = tip.name;
                keywordSuggestions.classList.add('hidden');
            });

            keywordSuggestions.appendChild(suggestionItem);
        });

        keywordSuggestions.classList.remove('hidden');
    }
});