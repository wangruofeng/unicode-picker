// Direct code-point → Chinese name overrides. Highest priority; covers featured/hot
// symbols, common Latin-1 punctuation/symbols, and frequently used characters whose
// English names don't decompose cleanly into token translation.
const COMMON_NAMES = new Map(Object.entries({
  // Basic Latin (signs only)
  '0021': '感叹号', '0022': '双引号', '0023': '井号', '0024': '美元符号', '0026': '与号',
  '0027': '撇号', '002A': '星号', '002B': '加号', '002C': '逗号', '002D': '连字符减号',
  '002E': '句号', '002F': '斜杠', '003A': '冒号', '003B': '分号', '003C': '小于号',
  '003D': '等于号', '003E': '大于号', '003F': '问号', '0040': '艾特号', '005B': '左方括号',
  '005C': '反斜杠', '005D': '右方括号', '005E': '脱字符', '005F': '下划线', '0060': '反引号',
  '007B': '左花括号', '007C': '竖线', '007D': '右花括号', '007E': '波浪号',
  // Latin-1 Supplement (punctuation, symbols, fractions)
  '00A1': '倒置感叹号', '00A2': '分币符号', '00A3': '英镑符号', '00A4': '货币符号',
  '00A5': '日元符号', '00A6': '断竖线', '00A7': '章节号', '00A8': '分音符', '00A9': '版权符号',
  '00AA': '阴性序数指示符', '00AB': '左尖引号', '00AC': '非号', '00AD': '软连字符',
  '00AE': '注册符号', '00AF': '长音符', '00B0': '度符号', '00B1': '正负号', '00B2': '上标二',
  '00B3': '上标三', '00B4': '锐音符', '00B5': '微米号', '00B6': '段落号', '00B7': '间隔号',
  '00B8': '下尾符', '00B9': '上标一', '00BA': '阳性序数指示符', '00BB': '右尖引号',
  '00BC': '四分之一', '00BD': '二分之一', '00BE': '四分之三', '00BF': '倒置问号',
  '00D7': '乘号', '00F7': '除号',
  // Spacing Modifier Letters
  '02C6': '修饰音符抑扬符', '02C7': '倒抑扬符', '02C9': '修饰长音符', '02CA': '修饰锐音符',
  '02CB': '修饰钝音符', '02D8': '短音符', '02D9': '上点符', '02DA': '上圆圈', '02DB': '下尾符',
  '02DC': '小波浪号', '02DD': '双重锐音符',
  // General Punctuation
  '2010': '连字符', '2011': '不换行连字符', '2012': '数字破折号', '2013': '短破折号',
  '2014': '长破折号', '2015': '水平条', '2016': '双竖线', '2017': '双下波浪线',
  '2018': '左单引号', '2019': '右单引号', '201A': '低位单引号', '201B': '反向单引号',
  '201C': '左双引号', '201D': '右双引号', '201E': '低位双引号', '201F': '反向双引号',
  '2020': '剑号', '2021': '双剑号', '2022': '项目符号', '2023': '三角项目符号',
  '2024': '一字点', '2025': '双点引导符', '2026': '省略号', '2027': '连字点',
  '2030': '千分号', '2031': '万分号', '2032': '撇号（分）', '2033': '双撇号（秒）',
  '2034': '三撇号', '2035': '反撇号', '2039': '左单尖引号', '203A': '右单尖引号',
  '203B': '参考标记', '203C': '双感叹号', '203D': '疑问感叹号', '203E': '上划线',
  '2040': '字符连结符', '2042': '星群号', '2043': '连字符项目符号', '2044': '分数斜杠',
  '2045': '左花方括号', '2046': '右花方括号', '204A': '逗号（商业）', '204B': '反段落号',
  '2052': '商业负号',
  // Currency
  '20A0': '欧元货币符号', '20A1': '科朗符号', '20A2': '克鲁赛罗符号', '20A3': '法国法郎符号',
  '20A4': '里拉符号', '20A6': '奈拉符号', '20A7': '比塞塔符号', '20A8': '卢比符号',
  '20A9': '韩元符号', '20AA': '新谢克尔符号', '20AB': '越南盾符号', '20AC': '欧元符号',
  '20AD': '基普符号', '20AE': '图格里克符号', '20AF': '德拉克马符号', '20B0': '德国便士符号',
  '20B1': '比索符号', '20B2': '瓜拉尼符号', '20B4': '格里夫纳符号', '20B5': '塞地符号',
  '20B8': '坦格符号', '20B9': '印度卢比符号', '20BA': '土耳其里拉符号', '20BB': '马纳特符号',
  '20BC': '马纳特符号', '20BD': '俄罗斯卢布符号', '20BF': '比特币符号',
  // Letterlike Symbols
  '2102': '双线 C（复数）', '2103': '摄氏度', '2105': '每（care of）', '2106': '每（库拉）',
  '2109': '华氏度', '210A': '花体 g', '210B': '花体 H', '210C': '黑花体 H', '210D': '双线 H',
  '210E': '普朗克常数', '210F': '约化普朗克常数', '2110': '花体 I', '2111': '花体 I（虚数）',
  '2112': '自然对数（花体 L）', '2113': '花体 l', '2115': '双线 N（自然数）', '2116': '.numero 号',
  '2117': '录音版权符号', '2118': '威伊尔（Weierstrass）幂集 P', '2119': '双线 P',
  '211A': '双线 Q（有理数）', '211B': '花体 R', '211C': '花体 R（实数）', '211D': '双线 R（实数）',
  '2120': '服务商标', '2121': '电报电话', '2122': '商标符号', '2124': '双线 Z（整数）',
  '2126': '欧米伽（欧姆）', '212A': '开尔文（温度）', '212B': '埃斯特朗（长度）', '212C': '花体 B',
  '212D': '黑花体 C', '212F': '花体 e', '2130': '花体 E', '2131': '花体 F', '2132': '反 F',
  '2133': '花体 M', '2134': '花体 o', '2135': '阿列夫（Aleph）', '2136': '贝特（Beth）',
  '2137': '吉梅尔（Gimel）', '2138': '达莱特（Dalet）', '2139': '信息源', '213C': '双线 π',
  '213D': '双线 γ', '213E': '双线 Γ', '213F': '双线 Π', '2140': '双线和号（求和）',
  '2141': '花体 S', '2142': '反 E', '2143': '反 ε', '2144': '倒置 ε',
  // Arrows (common)
  '2196': '左上箭头', '2197': '右上箭头', '2198': '右下箭头', '2199': '左下箭头',
  '219A': '向左带斜线箭头', '219B': '向右带斜线箭头', '219C': '向左波浪箭头', '219D': '向右波浪箭头',
  '219E': '向左双向箭头', '219F': '向上双向箭头', '21A0': '向右双向箭头', '21A1': '向下双向箭头',
  '21A2': '向左带竖线箭头', '21A3': '向右带竖线箭头', '21A4': '向左带尾箭头', '21A5': '向上带尾箭头',
  '21A6': '向右带尾箭头', '21A7': '向下带尾箭头', '21A8': '上下箭头（带基线）', '21A9': '向左带钩箭头',
  '21AA': '向右带钩箭头', '21AB': '向左带钩圈箭头', '21AC': '向右带钩圈箭头', '21AD': '左右双向箭头',
  '21AE': '左右带斜线双向箭头', '21B0': '向上带尖角箭头', '21B1': '向上带尖角箭头（右）',
  '21B2': '向下带尖角箭头', '21B3': '向下带尖角箭头（右）', '21B5': '回车符号', '21B6': '顺时针上半圆箭头',
  '21B7': '逆时针上半圆箭头', '21BA': '逆时针开放圆箭头', '21BB': '顺时针开放圆箭头',
  '21BC': '向左上半镖箭头', '21BD': '向左下半镖箭头', '21BE': '向上右侧镖箭头', '21BF': '向上左侧镖箭头',
  '21C0': '向右上半镖箭头', '21C1': '向右下半镖箭头', '21C2': '向下右侧镖箭头', '21C3': '向下左侧镖箭头',
  '21C4': '向右向上箭头（互换）', '21C5': '向上向右箭头', '21C6': '向左向下箭头（互换）',
  '21C7': '向左双平行箭头', '21C8': '向上双平行箭头', '21C9': '向右双平行箭头', '21CA': '向下双平行箭头',
  '21CB': '向左向右互推箭头', '21CC': '向右向左互推箭头', '21CD': '向左双线带斜线箭头',
  '21CE': '左右双线带斜线箭头', '21CF': '向右双线带斜线箭头', '21D1': '向上双线箭头',
  '21D3': '向下双线箭头', '21D5': '上下双线箭头', '21D6': '左上双线箭头', '21D7': '右上双线箭头',
  '21D8': '右下双线箭头', '21D9': '左下双线箭头', '21E0': '向左虚线箭头', '21E1': '向上虚线箭头',
  '21E2': '向右虚线箭头', '21E3': '向下虚线箭头', '21E4': '向左到栏箭头', '21E5': '向右到栏箭头',
  '21E6': '向左白色箭头', '21E7': '向上白色箭头', '21E8': '向右白色箭头', '21E9': '向下白色箭头',
  '21EA': '向上白色双线箭头', '21F5': '向下向上箭头（互换）',
  // Mathematical Operators (common)
  '2201': '补集', '2202': '偏微分', '2204': '不存在', '2206': '增量（差分）', '2207': 'nabla（梯度）',
  '2209': '不属于', '220A': '小属于', '220C': '不包含', '220D': '小包含', '220E': '证毕',
  '220F': '连乘积', '2210': '余积', '2212': '减号', '2213': '减加号', '2214': '点加号',
  '2215': '除法斜杠', '2216': '集合减', '2217': '星号运算符', '2218': '环运算符', '2219': '点积运算符',
  '221B': '立方根', '221C': '四次方根', '221D': '正比于', '221F': '直角', '2220': '角',
  '2221': '测量角', '2222': '球面角', '2223': '整除', '2224': '不整除', '2225': '平行于',
  '2226': '不平行', '2227': '逻辑与', '2228': '逻辑或', '2229': '交集', '222A': '并集',
  '222C': '二重积分', '222D': '三重积分', '222E': '环路积分', '222F': '面积分', '2230': '体积分',
  '2231': '顺时针环路积分', '2232': '顺时针环路积分', '2233': '逆时针环路积分', '2234': '所以',
  '2235': '因为', '2236': '比号', '2237': '比例', '2238': '点减号', '223C': '波浪运算符',
  '223D': '反转波浪', '2240': '环绕积', '2243': '渐近相等', '2245': '约等（同余）', '2246': '近似但不等',
  '224A': '近似等于', '2250': '等于（定义点）', '2253': '图像约等于', '2254': '定义为（:等号）',
  // Featured math symbols (ensure the hot set always has a Chinese name)
  '21D0': '向左双线箭头', '21D2': '向右双线箭头', '21D4': '左右双线箭头',
  '2203': '存在量词', '220B': '包含于', '2248': '约等于',
  '2255': '等于（等号:）', '2256': '环等于', '2257': '环等于（同余）', '225C': '三角形上等号（定义）',
  '2261': '恒等于', '2262': '不恒等于', '2266': '小于等于（内点）', '2267': '大于等于（内点）',
  '226A': '远小于', '226B': '远大于', '226C': '介于', '226E': '不小于', '226F': '不大于',
  '2270': '不小于等于', '2271': '不大于等于', '2272': '小于约等', '2273': '大于约等',
  '2276': '小于大于', '2277': '大于小于', '227A': '前驱于', '227B': '后继于', '2282': '真子集',
  '2283': '真超集', '2284': '非真子集', '2286': '子集或等于', '2287': '超集或等于', '2288': '非子集或等',
  '228E': '多重集并', '2291': '方块图像子集', '2292': '方块图像超集', '2293': 'n 元交集（方形）',
  '2294': 'n 元并集（方形）', '2295': '带圈加号', '2296': '带圈减号', '2297': '带圈乘号',
  '2298': '带圈除号', '2299': '带圈点运算符', '229A': '带圈环运算符', '229B': '带圈星号运算符',
  '229D': '带圈短横', '229E': '带圈方块并', '22A2': '右花括号（右钉）', '22A3': '左花括号（左钉）',
  '22A4': '向上钉（顶）', '22A5': '向上钉（底，⊥）', '22A8': '真（断定）', '22C0': 'n 元逻辑与',
  '22C1': 'n 元逻辑或', '22C2': 'n 元交集', '22C3': 'n 元并集', '22C4': '菱形运算符',
  '22C5': '点运算符', '22C6': '星运算符', '22EE': '竖三点（数学）', '22EF': '中三点（数学）',
  '22F0': '右上三点（数学）', '22F1': '右下三点（数学）',
  // Miscellaneous Technical (keyboard keys)
  '2318': 'Command 键', '2325': 'Option 键', '2303': 'Control 键', '21E7': '向上白色箭头',
  '2326': '向前删除键', '232B': '退格键', '2423': '开方括号（空格）', '21B5': '回车符号',
  '2387': '替代键', '238B': '中断键', '2386': '回车键（备用）',
  // Geometric Shapes
  '25A2': '白色带边方块', '25A3': '白色内嵌方块', '25A4': '白色水平线方块', '25A5': '白色垂直线方块',
  '25A6': '白色交叉线方块', '25A7': '白色对角线方块', '25A8': '白色反对角线方块', '25A9': '白色交叉对角线方块',
  '25AA': '黑色小方块', '25AB': '白色小方块', '25AC': '黑色矩形', '25AD': '白色矩形',
  '25AE': '黑色竖矩形', '25AF': '白色竖矩形', '25B4': '黑色上三角（小）', '25B5': '白色上三角（小）',
  '25B6': '黑色右三角', '25B7': '白色右三角', '25B8': '黑色右三角（小）', '25B9': '白色右三角（小）',
  '25BA': '黑色右指针', '25BB': '白色右指针', '25BC': '黑色下三角', '25BD': '白色下三角',
  '25BE': '黑色下三角（小）', '25BF': '白色下三角（小）', '25C0': '黑色左三角', '25C1': '白色左三角',
  '25C2': '黑色左三角（小）', '25C3': '白色左三角（小）', '25C4': '黑色左指针', '25C5': '白色左指针',
  '25C7': '白色菱形', '25C8': '白色内嵌菱形', '25C9': '鱼眼', '25CA': '菱形（长）', '25CB': '白色圆',
  '25CC': '带虚线圆', '25CD': '大圆', '25CE': '靶心', '25CF': '黑色圆',
  '25D4': '圆带上半黑', '25D5': '圆带下半黑', '25D6': '左半黑圆', '25D7': '右半黑圆',
  '25D8': '反圆（黑中白）', '25D9': '上半反圆', '25DA': '下半反圆', '25DB': '右上反圆',
  '25DC': '左上四分之一圆', '25DD': '右上四分之一圆', '25DE': '右下四分之一圆', '25DF': '左下四分之一圆',
  '25E6': '白色项目符号', '25EF': '大圆',
  '2B1B': '黑色大方块', '2B1C': '白色大方块', '2B24': '黑色大圆', '2B25': '黑色中菱形',
  '2B26': '白色中菱形', '2B27': '黑色中菱形（小）', '2B28': '白色中菱形（小）', '2B2A': '黑色椭圆',
  '2B2B': '白色椭圆',
  // Miscellaneous Symbols
  '2600': '太阳', '2601': '云', '2602': '雨伞', '2603': '雪人', '2604': '彗星', '2607': '闪电',
  '2608': '主教（国际象棋）', '2609': '行星（太阳）', '260A': '升交点', '260B': '降交点',
  '260C': '火星（会合）', '260E': '黑色电话', '260F': '白色电话', '2610': '投票方框', '2611': '带勾方框',
  '2612': '带叉方框', '2613': '圣安德鲁十字', '2614': '雨伞（带雨滴）', '2615': '热饮', '2616': '白色将军（将棋）',
  '2617': '黑色将军（将棋）', '2618': '三叶草', '2619': '反向花体 P', '261A': '黑色左指', '261B': '黑色右指',
  '261C': '白色左指', '261D': '白色上指', '261E': '白色右指', '261F': '白色下指', '2620': '骷髅与交叉骨',
  '2621': '警告（ caution）', '2622': '放射性符号', '2623': '生物危害符号', '2624': '医疗符号（手杖）',
  '2625': '安克（生命之钥）', '2626': '东正教十字', '2627': 'Chi Rho 符号', '2628': '十字与光环',
  '2629': '耶路撒冷十字', '262A': '星月（伊斯兰）', '262B': '法西斯（束棒）', '262C': '太极图',
  '262D': '锤子与镰刀', '262E': '和平符号', '262F': '阴阳太极', '2630': '易经卦（天）',
  '2631': '易经卦（泽）', '2632': '易经卦（火）', '2633': '易经卦（雷）', '2634': '易经卦（风）',
  '2635': '易经卦（水）', '2636': '易经卦（山）', '2637': '易经卦（地）', '2638': '法轮',
  '2639': '白色皱眉脸', '263A': '白色笑脸', '263B': '黑色笑脸', '263C': '白色太阳射线',
  '263D': '上弦月', '263E': '下弦月', '263F': '水星', '2640': '女性符号', '2641': '地球',
  '2642': '男性符号', '2643': '木星', '2644': '土星', '2645': '天王星', '2646': '海王星',
  '2647': '冥王星', '2648': '白羊座', '2649': '金牛座', '264A': '双子座', '264B': '巨蟹座',
  '264C': '狮子座', '264D': '室女座', '264E': '天秤座', '264F': '天蝎座', '2650': '人马座',
  '2651': '摩羯座', '2652': '宝瓶座', '2653': '双鱼座', '2654': '白王（国际象棋）', '2655': '白后',
  '2656': '白车', '2657': '白象', '2658': '白马', '2659': '白兵', '265A': '黑王', '265B': '黑后',
  '265C': '黑车', '265D': '黑象', '265E': '黑马', '265F': '黑兵', '2660': '黑桃', '2661': '红桃',
  '2662': '方块', '2663': '梅花', '2664': '白桃', '2665': '红心', '2666': '黑方块（菱形）',
  '2667': '白梅花', '2668': '温泉', '2669': '四分音符', '266A': '八分音符', '266B': '相连八分音符',
  '266C': '相连十六分音符', '266D': '降号', '266E': '还原号', '266F': '升号', '2670': '西斯提娜',
  '2671': '新闻符号', '2672': '回收（循环）符号', '267B': '黑色回收符号', '267C': '回收塑料符号',
  '267D': '回收纸张符号', '267E': '永久回收符号', '267F': '轮椅符号', '2680': '骰子一（空心）',
  '2681': '骰子二', '2682': '骰子三', '2683': '骰子四', '2684': '骰子五', '2685': '骰子六',
  '2686': '黑色骰子一', '2687': '黑色骰子二', '2688': '黑色骰子三', '2689': '黑色骰子四',
  '268A': '单选（圆）', '268B': '双选（圆）', '268C': '三选（圆）', '268D': '单选（方）',
  '268E': '双选（方）', '268F': '三选（方）', '2690': '旗杆（空心）', '2691': '旗杆（实心）',
  '2692': '原子（镰锤）', '2693': '锚', '2694': '交叉剑', '2695': '医疗符号（蛇杖）',
  '2696': '天平（⚖）', '2697': '黄道（炼金）', '2698': '花朵（莲花）', '2699': '齿轮', '269A': '酵母（炼金）',
  '269B': '原子符号', '269C': 'Fleur-de-lis（百合花饰）', '269D': '带光环白星', '269E': '前推流',
  '269F': '后推流', '26A0': '危险符号', '26A1': '高压（闪电）符号', '26A2': '同性恋符号（双男）',
  '26A3': '同性恋符号（双女）', '26A4': '异性恋符号', '26A5': '跨性别符号', '26A6': '男性加女性符号',
  '26A7': '男性加斜线（跨性别）', '26A8': '男性加女性（合）', '26A9': '三性符号', '26AA': '中白圆',
  '26AB': '中黑圆', '26AC': '中白菱形', '26AD': '婚姻符号', '26AE': '离异符号', '26AF': '未婚符号',
  '26B0': '棺材', '26B1': '骨灰盒', '26B2': '无性别符号',
  // Dingbats
  '2701': '四角散开星号（上剪刀）', '2702': '黑色剪刀', '2703': '剪线剪刀', '2704': '白色剪刀',
  '2705': '白色粗勾号', '2706': '电话位置符号', '2707': '录音带', '2708': '飞机', '2709': '信封',
  '270A': '举起拳头', '270B': '举起手', '270C': '胜利手势', '270D': '写字的手', '270E': '下铅笔',
  '270F': '铅笔', '2710': '上铅笔', '2711': '白色钢笔尖', '2712': '黑色钢笔尖', '2713': '勾号',
  '2714': '粗勾号', '2715': '乘号（×）', '2716': '粗乘号', '2717': '投票叉', '2718': '粗投票叉',
  '2719': '轮廓希腊十字', '271A': '粗希腊十字', '271B': '开放中心十字', '271C': '粗开放中心十字',
  '271D': '拉丁十字', '271E': '阴影白拉丁十字', '271F': '轮廓拉丁十字', '2720': '马耳他十字',
  '2721': '大卫之星', '2722': '四滴水星号', '2723': '四气球星号', '2724': '粗四气球星号',
  '2725': '开放中心滴水星号', '2726': '黑色四瓣星', '2727': '白色四瓣星', '2728': '闪光',
  '2729': '应力星号（白）', '272A': '带圈白星', '272B': '开放中心黑星', '272C': '开放中心星',
  '272D': '三滴轮星', '272E': '重三滴轮星', '272F': '轮星号', '2730': '阴影白轮星号',
  '2731': '重星号', '2732': '开放中心星号', '2733': '八瓣花号', '2734': '八瓣开放星',
  '2735': '八瓣轮星', '2736': '六角星号', '2737': '旋转八瓣轮星', '2738': '重型三滴轮星号',
  '2739': '十二瓣黑星', '273A': '十六瓣星号', '273B': '滴水星号', '273C': '开放中心滴水星号',
  '273D': '重滴水星号', '273E': '六瓣黑白花', '273F': '黑色花蕊', '2740': '白色花蕊',
  '2741': '重型八瓣轮星', '2742': '环状轮星号', '2743': '心形滴水星号', '2744': '雪花',
  '2745': '紧雪花', '2746': '重型紧雪', '2747': '闪光号', '2748': '重型闪光', '2749': '气球',
  '274A': '八瓣花（圆）', '274B': '重八瓣花（圆）', '274C': '叉号', '274D': '阴影白圆',
  '274E': '带框叉号', '274F': '降下角框', '2750': '上角框', '2751': '降低带刺星号',
  '2752': '上带刺星号', '2753': '黑色问号', '2754': '白色问号', '2755': '白色感叹号',
  '2756': '黑色菱形', '2757': '粗感叹号', '2758': '轻竖线', '2759': '中竖线', '275A': '重竖线',
  '275B': '重左单引号', '275C': '重右单引号', '275D': '重左双引号', '275E': '重右双引号',
  '275F': '上方重单引号', '2760': '下方重单引号', '2761': '花心感叹号', '2762': '粗花心感叹号',
  '2763': '粗心形感叹号', '2764': '粗黑心', '2765': '粗心感叹（旋转）', '2766': '花心（植物）',
  '2767': '花心号', '2768': '轻左花括号', '2769': '轻右花括号', '276A': '中左花括号',
  '276B': '中右花括号', '276C': '旋转花括号钩', '276D': '镜像花括号钩', '276E': '重型左指角引号',
  '276F': '重型右指角引号', '2770': '重型左指龟壳引号', '2771': '重型右指龟壳引号',
  '2772': '轻左龟壳引号', '2773': '轻右龟壳引号', '2774': '中左龟壳引号', '2775': '中右龟壳引号',
  '2776': '带圈数字一', '2777': '带圈数字二', '2778': '带圈数字三', '2779': '带圈数字四',
  '277A': '带圈数字五', '277B': '带圈数字六', '277C': '带圈数字七', '277D': '带圈数字八',
  '277E': '带圈数字九', '277F': '带圈数字十', '2780': '衬线带圈数字一', '2781': '衬线带圈数字二',
  '2782': '衬线带圈数字三', '2783': '衬线带圈数字四', '2784': '衬线带圈数字五', '2785': '衬线带圈数字六',
  '2786': '衬线带圈数字七', '2787': '衬线带圈数字八', '2788': '衬线带圈数字九', '2789': '衬线带圈数字十',
  '278A': '衬线负带圈数字一', '278B': '衬线负带圈数字二', '278C': '衬线负带圈数字三',
  '278D': '衬线负带圈数字四', '278E': '衬线负带圈数字五', '278F': '衬线负带圈数字六',
  '2790': '衬线负带圈数字七', '2791': '衬线负带圈数字八', '2792': '衬线负带圈数字九',
  '2793': '衬线负带圈数字十', '2794': '粗向右箭头', '2795': '粗加号', '2796': '粗减号',
  '2797': '粗除号', '2798': '粗落右箭头', '2799': '粗圆头右箭头', '279A': '粗等长右箭头',
  '279B': '右箭头带尾', '279C': '重型圆角右箭头', '279D': '开放右箭头', '279E': '重型凸角右箭头',
  '279F': '右虚线箭头', '27A0': '重型右凸角箭头', '27A1': '粗黑右箭头', '27A2': '三锥凸右箭头',
  '27A3': '圆角凸右箭头', '27A4': '黑色右箭头', '27A5': '重型圆角凸右箭头', '27A6': '圆形凸右箭头',
  '27A7': '重型圆形凸右箭头', '27A8': '重型凹角右箭头', '27A9': '右箭头阴影', '27AA': '左缩右箭头',
  '27AB': '上缩右箭头', '27AC': '右上凸箭头', '27AD': '右斜角箭头', '27AE': '右圆角斜角箭头',
  '27AF': '上钩右箭头', '27B1': '上钩右下箭头', '27B2': '带圈粗白右箭头', '27B3': '右上羽箭头',
  '27B4': '右下羽箭头', '27B5': '黑羽右上箭头', '27B6': '黑羽右下箭头', '27B7': '黑环右箭头',
  '27B8': '粗黑右箭头（开放）', '27B9': '右到栏箭头', '27BA': '右从栏箭头', '27BB': '右从栏双箭头',
  '27BC': '右箭头带尾（开口）', '27BD': '重型凹角右箭头', '27BE': '打开右箭头',
  // Supplemental Arrows
  '27F5': '长向左箭头', '27F6': '长向右箭头', '27F7': '长左右箭头', '27F8': '长向左双线箭头',
  '27F9': '长向右双线箭头', '27FA': '长左右双线箭头', '27FB': '长左带尾箭头', '27FC': '长右带尾箭头',
  '27FD': '长向左双线带尾箭头', '27FE': '长向右双线带尾箭头', '27FF': '长向右波浪箭头',
  '2900': '右双向箭头', '2901': '右带竖线箭头', '2902': '右双线带竖线箭头', '2903': '左双向箭头',
  '2904': '左右双向箭头', '2905': '右双向带尾箭头', '2906': '左双线双向箭头', '2907': '右双线双向箭头',
  '2908': '向下带尾箭头', '2909': '向上带尾箭头', '290A': '上双线箭头', '290B': '下双线箭头',
  '290C': '向左三联箭头', '290D': '向右三联箭头', '290E': '向左三联波浪箭头', '290F': '向右三联波浪箭头',
  '2910': '右双向到栏箭头', '2911': '右带尾三联箭头', '2912': '向上到栏箭头', '2913': '向下到栏箭头',
  '2914': '向右带圆点箭头', '2915': '向右带加号箭头', '2916': '向右带乘号箭头',
  '2B05': '左黑色箭头', '2B06': '上黑色箭头', '2B07': '下黑色箭头', '2B08': '左上箭头',
  '2B09': '左下箭头', '2B0A': '右上箭头', '2B0B': '右下箭头', '2B0C': '左右箭头', '2B0D': '上下箭头',
  '2B0E': '右开放箭头', '2B0F': '右开放重箭头', '2B10': '左开放箭头', '2B11': '左开放重箭头',
  '2B1D': '中方点', '2B1E': '白小方块', '2B1F': '黑五边形', '2B20': '白五边形', '2B21': '白六边形',
  '2B22': '黑六边形', '2B23': '横向黑六边形', '2B29': '黑小菱形', '2B2C': '白小菱形',
  '2B2D': '横向白椭圆', '2B2E': '横向黑椭圆', '2B2F': '纵向白椭圆', '2B30': '纵向黑椭圆',
  '2B50': '白色中号星', '2B51': '白色中星（旋转）', '2B52': '白色星轮廓', '2B53': '黑右箭头（重型）',
  '2B54': '白右箭头（重型）', '2B55': '粗大圆圈', '2B56': '带圈oval', '2B57': '带圈上斜oval',
  '2B58': '重圆', '2B59': '重带圈oval',
  // Misc Symbols / pictographs (commonly used)
  '2764': '粗黑心',
  // Enclosed Alphanumerics
  '2460': '带圈数字一', '2461': '带圈数字二', '2462': '带圈数字三', '2463': '带圈数字四',
  '2464': '带圈数字五', '2465': '带圈数字六', '2466': '带圈数字七', '2467': '带圈数字八',
  '2468': '带圈数字九', '2469': '带圈数字十', '246A': '带圈数字十一', '246B': '带圈数字十二',
  '246C': '带圈数字十三', '246D': '带圈数字十四', '246E': '带圈数字十五', '246F': '带圈数字十六',
  '2470': '带圈数字十七', '2471': '带圈数字十八', '2472': '带圈数字十九', '2473': '带圈数字二十',
  '24EB': '负带圈数字十一', '24EC': '负带圈数字十二', '24ED': '负带圈数字十三', '24EE': '负带圈数字十四',
  '24EF': '负带圈数字十五', '24F0': '负带圈数字十六', '24F1': '负带圈数字十七', '24F2': '负带圈数字十八',
  '24F3': '负带圈数字十九', '24F4': '负带圈数字二十', '24F5': '双带圈数字一', '24F6': '双带圈数字二',
  '24F7': '双带圈数字三', '24F8': '双带圈数字四', '24F9': '双带圈数字五', '24FA': '双带圈数字六',
  '24FB': '双带圈数字七', '24FC': '双带圈数字八', '24FD': '双带圈数字九', '24FE': '双带圈数字十',
  '24FF': '带圈数字零（负）', '24EA': '带圈数字零',
  // Box Drawing & Block Elements (most common)
  '2500': '水平细线', '2501': '水平粗线', '2502': '垂直细线', '2503': '垂直粗线',
  '250C': '左上角（细）', '250D': '左上角（上粗）', '250E': '左上角（左粗）', '250F': '左上角（粗）',
  '2510': '右上角（细）', '2514': '左下角（细）', '2518': '右下角（细）', '251C': '左丁字（细）',
  '2524': '右丁字（细）', '252C': '上丁字（细）', '2534': '下丁字（细）', '253C': '十字（细）',
  '2580': '上半块', '2581': '下八分之一块', '2582': '下四分之一块', '2583': '下八分之三块',
  '2584': '下半块', '2585': '下八分之五块', '2586': '下四分之三块', '2587': '下八分之七块',
  '2588': '全块', '2589': '左八分之七块', '258A': '左四分之三块', '258B': '左八分之五块',
  '258C': '左半块', '258D': '左八分之三块', '258E': '左四分之一块', '258F': '左八分之一块',
  '2590': '右半块', '2594': '上八分之一块', '2595': '右八分之一块',
}));

// Multi-word English tokens → Chinese. Keys may contain spaces so that compound
// words like "LEFTWARDS" or "DOUBLE STRUCK" map as units before single-token lookup.
const COMPOUND_TOKENS = new Map(Object.entries({
  'N-ARY': '多元', 'DOUBLE STRUCK': '双线', 'BLACK LETTER': '黑花体', 'SCRIPT CAPITAL': '花体大写',
  'SCRIPT SMALL': '花体小写', 'DOUBLE ARROW': '双线箭头', 'LONG ARROW': '长箭头', 'DASHED ARROW': '虚线箭头',
  'WHITE ARROW': '白色箭头', 'DOUBLE LINE': '双线', 'GREEK CROSS': '希腊十字', 'LATIN CROSS': '拉丁十字',
  'MALTESE CROSS': '马耳他十字', 'STAR OF DAVID': '大卫之星', 'YIN YANG': '阴阳太极',
  'WHEEL OF DHARMA': '法轮', 'PEACE SIGN': '和平符号', 'YIN YANG SYMBOL': '阴阳符号',
  'DOUBLE STRUCK': '双线', 'NABLA': 'nabla（梯度算子）', 'ALEF': '阿列夫',
  'RIGHTWARDS': '向右', 'LEFTWARDS': '向左', 'UPWARDS': '向上', 'DOWNWARDS': '向下',
  'RIGHT POINTING': '右指', 'LEFT POINTING': '左指', 'UP POINTING': '上指', 'DOWN POINTING': '下指',
  'APPOINTING': '指', 'POINTING': '指',
}));

// Single English word → Chinese token. Used after compound substitution.
const TOKEN_NAMES = new Map(Object.entries({
  // Direction
  LEFT: '左', RIGHT: '右', UP: '上', DOWN: '下', NORTH: '北', SOUTH: '南', EAST: '东', WEST: '西',
  TOP: '顶部', BOTTOM: '底部', CENTER: '中心', CENTRE: '中心', MIDDLE: '中', UPPER: '上', LOWER: '下',
  INNER: '内', OUTER: '外', FRONT: '前', BACK: '后',
  // Arrow / motion
  ARROW: '箭头', ARROWS: '箭头', HARPOON: '鱼叉箭头', DASHED: '虚线', DASH: '破折号',
  DOUBLE: '双', TRIPLE: '三', QUADRUPLE: '四', LONG: '长', SHORT: '短', WAVE: '波浪', WAVY: '波浪',
  CURVED: '曲线', CURVE: '曲线', BENT: '弯曲', HOOK: '钩', LOOP: '环', TAIL: '尾', BARB: '倒刺',
  STEM: '杆', CIRCLE: '圆', CIRCLED: '带圈', CIRCULAR: '圆形', RING: '环', SEMICIRCLE: '半圆',
  ROTATED: '旋转', REVERSED: '反向', TURNED: '倒置', INVERTED: '倒置', MIRRORED: '镜像',
  ALTERNATING: '交替',
  // Shape
  SQUARE: '方形', SQUARED: '方形', RECTANGLE: '矩形', TRIANGLE: '三角形', DIAMOND: '菱形',
  HEXAGON: '六边形', PENTAGON: '五边形', OCTAGON: '八角形', LOZENGE: '菱形', RHOMBUS: '菱形',
  STAR: '星', STARS: '星', ASTERISK: '星号', SPARKLE: '闪光', SPARKLES: '闪光', ORNAMENT: '装饰',
  BULLET: '项目符号', DISC: '圆盘', QUAD: '四分', QUADRANT: '象限', SEGMENT: '线段', SEXTANT: '六分仪',
  OCTANT: '八分体', BEAM: '横梁', BARS: '横线', BAR: '横线', LINE: '线', LINES: '线',
  // Weight / style
  HEAVY: '粗', LIGHT: '细', THIN: '细', BOLD: '粗体', BLACK: '黑色', WHITE: '白色', SMALL: '小型',
  MEDIUM: '中号', LARGE: '大型', OUTLINED: '轮廓', OPEN: '开放', CLOSED: '闭合', SOLID: '实心',
  HOLLOW: '空心', NEGATIVE: '反色', POSITIVE: '正', SHADOWED: '阴影', STRIPED: '条纹',
  DOTTED: '点线', DOTS: '点', DOT: '点', DASH: '破折号',
  // Math
  PLUS: '加号', MINUS: '减号', MULTIPLICATION: '乘号', DIVISION: '除号', TIMES: '乘号',
  EQUAL: '等', EQUALS: '等号', THAN: '于', GREATER: '大于', LESS: '小于', INFINITY: '无穷大',
  INTEGRAL: '积分', SUMMATION: '求和', SUM: '求和', PRODUCT: '积', COPRODUCT: '余积',
  ROOT: '根', SQUARE: '平方', CUBE: '立方', ANGLE: '角', PARALLEL: '平行', PERPENDICULAR: '垂直',
  SUBSET: '子集', SUPERSET: '超集', INTERSECTION: '交集', UNION: '并集', ELEMENT: '元素',
  MEMBER: '成员', COMPLEMENT: '补集', EMPTY: '空', PROPORTIONAL: '正比', PROPORTION: '比例',
  RATIO: '比', TILDE: '波浪号', APPROXIMATELY: '约', ASYMPTOTICALLY: '渐近', FACTORIAL: '阶乘',
  INCREMENT: '增量', NABLA: '梯度', DEGREE: '度', DEGREES: '度', OPERATOR: '运算符',
  LOGICAL: '逻辑', AND: '与', OR: '或', NOT: '非', IMPLIES: '蕴含', THEREFORE: '所以',
  BECAUSE: '因为', HOMOTHETIC: '同位', SIN: '正弦', COSINE: '余弦', SINE: '正弦',
  FUNCTION: '函数', TENSOR: '张量', VECTOR: '向量', MATRIX: '矩阵', NORMAL: '法',
  // Punctuation
  PUNCTUATION: '标点', COMMA: '逗号', COLON: '冒号', SEMICOLON: '分号', EXCLAMATION: '感叹号',
  QUESTION: '问号', MARK: '标记', ELLIPSIS: '省略号', DASH: '破折号', HYPHEN: '连字符',
  BRACKET: '括号', BRACKETS: '括号', PARENTHESIS: '圆括号', PARENTHESES: '圆括号',
  PARENTHESIZED: '带括号', BRACE: '花括号', QUOTATION: '引号', GUILLEMET: '书名号',
  SLASH: '斜杠', BACKSLASH: '反斜杠', SOLIDUS: '斜杠', APOSTROPHE: '撇号',
  // Currency
  DOLLAR: '美元', EURO: '欧元', YEN: '日元', POUND: '英镑', RUPEE: '卢比', WON: '韩元',
  RUBLE: '卢布', FRANC: '法郎', PESO: '比索', LIRA: '里拉', SHEQEL: '谢克尔', BAHT: '泰铢',
  CENT: '分', PENCE: '便士', PESO: '比索', GUARANI: '瓜拉尼', HRYVNIA: '格里夫纳',
  LARI: '拉里', DRACHMA: '德拉克马', MANAT: '马纳特', TUGRIK: '图格里克', KIP: '基普',
  CRUZEIRO: '克鲁赛罗', NAIRA: '奈拉', PESETA: '比塞塔', TURKISH: '土耳其',
  BITCOIN: '比特币', CURRENCY: '货币', SIGN: '符号', DONG: '越南盾', SHEQEL: '谢克尔',
  ACRE: '英亩',
  // Nature / misc pictographs
  SUN: '太阳', MOON: '月亮', CLOUD: '云', RAIN: '雨', SNOW: '雪', SNOWFLAKE: '雪花',
  UMBRELLA: '雨伞', FIRE: '火', WATER: '水', LEAF: '叶', FLOWER: '花', FLORETTE: '花蕊',
  EARTH: '地球', MOUNTAIN: '山', WIND: '风', WAVE: '波浪', WARNING: '警告', SNOWMAN: '雪人',
  COMET: '彗星', LIGHTNING: '闪电', CLOUDS: '云', THUNDERSTORM: '雷暴',
  // Status
  CHECK: '勾', CROSS: '叉', BALLOT: '投票', RADIOACTIVE: '放射性', BIOHAZARD: '生物危害',
  PROHIBITED: '禁止', NO: '禁止', ERROR: '错误', STATUS: '状态',
  // UI / keyboard
  KEY: '键', COMMAND: 'Command', OPTION: 'Option', ENTER: '回车', RETURN: '回车',
  BACKSPACE: '退格', DELETE: '删除', EJECT: '弹出', PLAY: '播放', PAUSE: '暂停', POWER: '电源',
  RECORD: '录制', HOME: '主页', END: '结束', TAB: '制表', SHIFT: '上档', CONTROL: 'Control',
  ALT: 'Alt', ESCAPE: 'Esc', PRINT: '打印', ALTERNATIVE: '备用',
  // Music
  MUSIC: '音乐', MUSICAL: '音乐', NOTE: '音符', NOTES: '音符', CLEF: '谱号', REST: '休止符',
  SHARP: '升', FLAT: '降', NATURAL: '还原', BEAMED: '相连', EIGHTH: '八分', QUARTER: '四分',
  SIXTEENTH: '十六分', SIXTY: '六十四', VOICE: '声部', TEMPO: '节拍',
  // Games / chess
  CHESS: '国际象棋', MAHJONG: '麻将', DOMINO: '多米诺', TILE: '牌', CARD: '牌', CARDS: '牌',
  PLAYING: '扑克', DIE: '骰子', KING: '王', QUEEN: '后', ROOK: '车', BISHOP: '象', KNIGHT: '马',
  PAWN: '兵', SPADE: '黑桃', HEART: '红心', CLUB: '梅花', SUIT: '花色', GAME: '游戏', PIECE: '棋子',
  // Tech / office
  TELEPHONE: '电话', PHONE: '电话', ENVELOPE: '信封', PENCIL: '铅笔', PEN: '钢笔', NIB: '笔尖',
  SCISSORS: '剪刀', AIRPLANE: '飞机', AIRCRAFT: '飞机', CLOCK: '时钟', WATCH: '手表',
  GEAR: '齿轮', WRENCH: '扳手', HAMMER: '锤子', ANCHOR: '锚', SCALES: '天平', SCALE: '天平',
  TELEGRAPH: '电报',
  // People / body
  HAND: '手', FIST: '拳', THUMB: '拇指', FINGERS: '手指', INDEX: '食指', FACE: '脸', EYES: '眼睛',
  MOUTH: '嘴', HEAD: '头', PERSON: '人', SMILING: '微笑', FROWNING: '皱眉',
  // Religion / culture
  CROSS: '十字', RELIGIOUS: '宗教', RELIGION: '宗教', CRESCENT: '新月', PEACE: '和平',
  ATOM: '原子', DHARMA: '法', ORTHODOX: '东正教', TRIDENT: '三叉戟', EMBLEM: '徽章',
  // Astronomy / zodiac
  ZODIAC: '黄道', ARIES: '白羊座', TAURUS: '金牛座', GEMINI: '双子座', CANCER: '巨蟹座',
  LEO: '狮子座', VIRGO: '室女座', LIBRA: '天秤座', SCORPIO: '天蝎座', SCORPIUS: '天蝎座',
  SAGITTARIUS: '人马座', CAPRICORN: '摩羯座', AQUARIUS: '宝瓶座', PISCES: '双鱼座',
  PLANET: '行星', ORBIT: '轨道', COMET: '彗星', MERCURY: '水星', VENUS: '金星', MARS: '火星',
  JUPITER: '木星', SATURN: '土星', URANUS: '天王星', NEPTUNE: '海王星', PLUTO: '冥王星',
  EARTH: '地球', ASCENDING: '升', DESCENDING: '降', NODE: '交点', CONJUNCTION: '会合',
  // Box / drawing
  BOX: '方框', DRAWING: '制表', DRAWINGS: '制表', HORIZONTAL: '水平', VERTICAL: '垂直',
  DIAGONAL: '对角', CORNER: '角', TEE: '丁字', CROSS: '十字',
  CROSSED: '交叉', STRAIGHT: '直', STEEP: '陡', SLOPED: '倾斜', SLANTED: '倾斜', TILTED: '倾斜',
  SHALLOW: '浅', UP: '上', DOWN: '下', SIDE: '侧', SIDES: '侧', EDGES: '边', EDGE: '边', POINT: '点',
  TOP: '顶', BOTTOM: '底', BASE: '底', APEX: '顶', SHOULDER: '肩', NECK: '颈', TIP: '尖', HEAD: '头',
  TAIL: '尾', MIDDLE: '中', CENTER: '中心', CENTRE: '中心', BETWEEN: '之间',
  // Motion / orientation
  MOVEMENT: '动作', MOVING: '移动', HEADED: '朝向', HEADING: '朝向', FACING: '朝', POINTING: '指',
  ROTATION: '旋转', SPREADING: '展开', SPREAD: '展开', FANNING: '展开', SQUASH: '挤压',
  BENDING: '弯曲', BENT: '弯', PRESSED: '按压', TOUCHING: '触碰', HITTING: '击打', FLICK: '弹击',
  CONTACT: '接触', HINGE: '铰链', HINGED: '铰接', SWIVEL: '旋转', PIVOT: '枢轴', HINGING: '铰接',
  SPREAD: '展开', APART: '分开', TOGETHER: '并拢', CLOSING: '闭合', OPENING: '打开',
  OUTLINE: '轮廓', OUTLINED: '轮廓', BORDER: '边框', FRAME: '框', FRAMED: '带框', BORDERED: '带框',
  // Number / quantity words
  SINGLE: '单', DOUBLE: '双', TRIPLE: '三重', QUADRUPLE: '四重', MULTIPLE: '多重', PAIR: '对',
  LITTLE: '小', LARGE: '大', BIG: '大', TINY: '微小', HUGE: '巨大', MEDIUM: '中', MEDIUMS: '中',
  LOW: '低', HIGH: '高', UPPER: '上', LOWER: '下', NEUTRAL: '中性', POSITIVE: '正', NEGATIVE: '负',
  HALVED: '半', HALF: '半', FULL: '全', EMPTY: '空', PARTIAL: '部分', INCOMPLETE: '不完全',
  OUTER: '外', INNER: '内', INSIDE: '内', OUTSIDE: '外',
  // Scripts / domains (where a standard Chinese term exists)
  SIGNWRITING: '手语书写', MUSICAL: '音乐', BYZANTINE: '拜占庭', ZNAMENNY: '兹纳缅尼',
  NEUME: '纽姆符', ALCHEMICAL: '炼金', PHAISTOS: '费斯托斯', STRELA: '斯特列拉',
  BALINESE: '巴厘', KHMER: '高棉', TAMIL: '泰米尔', TIBETAN: '藏', HANGUL: '韩文',
  KATAKANA: '片假名', HIRAGANA: '平假名', YI: '彝', TAI: '傣', CHAKMA: '查克马', MEETEI: '曼尼普尔',
  TETRAGRAM: '四线形', HEXAGRAM: '六线形', TRIGRAM: '三线形', PENTAGRAM: '五角星',
  DANDA: '双竖线', LIGATURE: '连字', DIACRITIC: '附加符', ABBREVIATION: '缩写',
  TELEGRAPH: '电报', FUNCTIONAL: '功能', UNIFIED: '统一', PRESENTATION: '呈现', FORMS: '形式',
  SIMPLIFIED: '简体', TRADITIONAL: '繁体', DESCENDING: '降', ASCENDING: '升',
  // Chess / cards detail
  KING: '王', QUEEN: '后', ROOK: '车', BISHOP: '象', KNIGHT: '马', PAWN: '兵',
  TRUMP: '将牌', ACE: 'A', JACK: 'J', JOKER: '王牌', SPADE: '黑桃', HEART: '红心',
  DIAMOND: '方块', CLUB: '梅花', SUIT: '花色',
  // Misc common
  DOT: '点', DOTS: '点', BULLET: '点', DISC: '圆盘', DISK: '圆盘', CIRCLE: '圆', CIRCLES: '圆',
  WAVE: '波浪', WAVES: '波浪', RIPPLE: '涟漪', FLAME: '火焰', DROP: '滴', DROPS: '滴',
  SCROLL: '卷轴', RIBBON: '丝带', ROPE: '绳', KNOT: '结', BRIDGE: '桥', TOWER: '塔', CASTLE: '城堡',
  CROWN: '皇冠', WREATH: '花环', LEAF: '叶', LEAVES: '叶', STEM: '茎', SEED: '种子',
  DAY: '日', NIGHT: '夜', MONTH: '月', YEAR: '年', HOUR: '时', MINUTE: '分', SECOND: '秒',
  SUNRISE: '日出', SUNSET: '日落', DAWN: '黎明', DUSK: '黄昏',
  HEAVY: '粗', LIGHT: '细', THIN: '细', THICK: '粗', NARROW: '窄', WIDE: '宽', BROAD: '宽',
  FILLED: '填充', HOLLOW: '空心', OUTLINED: '轮廓', SOLID: '实心',
  // Braille (handled specially below, but keep token)
  BRAILLE: '盲文', PATTERN: '模式',
  // Signs of life / misc
  HEART: '心', HEARTS: '心', STAR: '星', STARS: '星', FLOWER: '花', FLOWERS: '花', TREE: '树',
  HOUSE: '房屋', DOOR: '门', WINDOW: '窗', KEY: '钥匙', LOCK: '锁', BELL: '铃', WHISTLE: '哨',
  // Music extensions
  BEAM: '横梁', BEAMED: '相连', STEMLESS: '无杆', STEM: '杆', FLAG: '旗', FLAGS: '旗',
  // Misc that appeared
  TWO: '二', THREE: '三', FOUR: '四', FIVE: '五', SIX: '六', SEVEN: '七', EIGHT: '八', NINE: '九',
  ELEVEN: '十一', TWELVE: '十二', SIXTEEN: '十六', THIRTY: '三十', HUNDRED: '百',
  THOUSAND: '千', TEN: '十', THOUSANDS: '千', HUNDREDS: '百',
  FIRST: '首', SECOND: '次', THIRD: '三', LAST: '末', PREVIOUS: '前', NEXT: '后',
  BEGIN: '始', START: '始', END: '终', FINISH: '终', STOP: '止', BEGINNING: '始',
  FORWARD: '向前', BACKWARD: '向后', OUTWARD: '向外', INWARD: '向内',
  UPWARDS: '向上', DOWNWARDS: '向下', LEFTWARDS: '向左', RIGHTWARDS: '向右',
  TOWARDS: '朝', FACING: '面朝', AWAY: '远离',
  INK: '墨', PEN: '笔', PENCIL: '铅笔', ERASER: '橡皮', BRUSH: '画笔', NIB: '笔尖',
  ENVELOPE: '信封', MAIL: '邮件', LETTER: '字母', MESSAGE: '消息', INBOX: '收件箱',
  EYE: '眼', MOUTH: '嘴', NOSE: '鼻', EAR: '耳', HAND: '手', FOOT: '脚', LEG: '腿', ARM: '臂',
  // Subscripts/superscripts extras
  SUBSCRIPT: '下标', SUPERSCRIPT: '上标', RAISED: '上标', LOWERED: '下标',
  // Connectors
  TACK: '钉', TURNSTILE: '旋转门', PITCHFORK: '叉', FORK: '叉',
  NAND: '与非', NOR: '或非', XOR: '异或', XNOR: '同或',
  FACE: '脸', FACES: '脸', INDEX: '食指', OPEN: '开放', CLOSED: '闭合', CLOSE: '闭合',
  ARROWHEAD: '箭头', STILE: '竖线', JOT: '小点', QUAD: '方块', SQUISH: '挤压', BEAM: '横梁',
  POSTAL: '邮政', MAIL: '邮件', FAX: '传真', TELEPHONE: '电话', MOBILE: '移动', ANTENNA: '天线',
  MAP: '地图', LOCATION: '位置', PIN: '定位针', FLAG: '旗', FLAGS: '旗', MARKER: '标记',
  RESTROOM: '洗手间', ELEVATOR: '电梯', STAIRS: '楼梯', ENTRANCE: '入口', EXIT: '出口',
  GAS: '加油', FUEL: '燃料', PUMP: '泵', BICYCLE: '自行车', BUS: '公交', TAXI: '出租车',
  TRAIN: '火车', METRO: '地铁', TRAM: '有轨电车', SHIP: '船', BOAT: '船', SAILBOAT: '帆船',
  ROCKET: '火箭', SATELLITE: '卫星', HELICOPTER: '直升机', TRACTOR: '拖拉机',
  BANK: '银行', HOSPITAL: '医院', SCHOOL: '学校', CHURCH: '教堂', CASTLE: '城堡',
  TENT: '帐篷', CAMPING: '露营', FOUNTAIN: '喷泉', BENCH: '长椅',
  CHEST: '胸', BELLY: '腹', HIP: '臀', THUMB: '拇指', PALM: '手掌', KNUCKLE: '指节',
  INDEX: '食指', MIDDLE: '中指', RING: '无名指', PINKY: '小指', FINGER: '手指', FINGERS: '手指',
  NAIL: '指甲', ELBOW: '肘', SHOULDER: '肩', WRIST: '腕', FIST: '拳头', FISTS: '拳头',
  PINCH: '捏', SNAP: '打响指', WAVE: '挥手', POINT: '指', SCRATCH: '抓', PET: '抚摸', TOUCH: '触碰',
  SHIELD: '盾', SWORD: '剑', DAGGER: '匕首', AXE: '斧', HAMMER: '锤', PICK: '镐', WRENCH: '扳手',
  NUT: '螺母', BOLT: '螺栓', GEAR: '齿轮', MAGNET: '磁铁', COMPASS: '指南针', RULER: '直尺',
  TRIANGLE: '三角', SQUARE: '方', HEXAGON: '六边', PENTAGON: '五边', STAR: '星', CIRCLE: '圆',
  DIAMOND: '菱', HEART: '心', CROSS: '十字', CRESCENT: '新月', CROWN: '冠', RING: '环',
  ATOM: '原子', MOLECULE: '分子', ION: '离子', ELECTRON: '电子', PROTON: '质子', NEUTRON: '中子',
  // Script / letter
  LETTER: '字母', CAPITAL: '大写', SMALL: '小写', LATIN: '拉丁', GREEK: '希腊', ARABIC: '阿拉伯',
  CYRILLIC: '西里尔', HEBREW: '希伯来', LATIN: '拉丁', TELEGRAPH: '电报',
  // Enclosure
  ENCLOSED: '带框', ENCLOSING: '包围', SQUARED: '带方框', NEGATIVE: '反色', OUTLINED: '轮廓',
  // Misc common
  COPYRIGHT: '版权', REGISTERED: '注册', TRADEMARK: '商标', TRADE: '商标', SERVICE: '服务',
  SECTION: '章节', PILCROW: '段落', PARAGRAPH: '段落', DEGREE: '度', PERCENT: '百分号',
  PERMILLE: '千分号', REFERENCE: '参考', NUMERO: '号码', NUMBER: '数字', FIGURE: '图形',
  IDEOGRAPH: '表意字', IDEOGRAPHIC: '表意', RADICAL: '部首', KANGXI: '康熙', CJK: '中日韩',
  STROKE: '笔画', TONE: '声调', ACCENT: '重音', MACRON: '长音', BREVE: '短音', CEDILLA: '下尾',
  DIAERESIS: '分音', OGONEK: '鼻音', TILDE: '波浪', ACUTE: '锐', GRAVE: '钝', CARON: '抑扬',
  CIRCUMFLEX: '抑扬', RING: '圆圈', ABOVE: '上', BELOW: '下', SIDE: '侧',
  LIGHTNING: '闪电', HALVED: '半', SEPARATED: '分隔', JOINED: '相连', CONJOINED: '相连',
  SUPERSCRIPT: '上标', SUBSCRIPT: '下标', FULLWIDTH: '全角', FULL: '全', WIDE: '宽',
  NARROW: '窄', HALF: '半', OUTLINE: '轮廓', INVERTED: '倒', UPSIDE: '倒', DOWN: '下',
  FORM: '形', FORMS: '形', BLOCK: '块', ELEMENTS: '元素', SHADING: '阴影', SHADE: '阴影',
  GREATER: '大于', LESS: '小于', EQUAL: '等', OF: '的', FOR: '于', TO: '至', FROM: '从',
  IN: '内', ON: '上', THE: '', A: '', AN: '', WITH: '带', WITHOUT: '无', TYPE: '型',
  NOTATION: '记号', SYMBOL: '符号', SIGNS: '符号', SPACING: '间隔', MODIFIER: '修饰',
  COMBINING: '组合', FUNCTIONAL: '功能', MISCELLANEOUS: '杂项', SUPPLEMENT: '补充',
  SUPPLEMENTAL: '补充', EXTENDED: '扩展', VARIATION: '变体', SELECTOR: '选择符',
  TAGS: '标签',
  // Number words
  ONE: '一', TWO: '二', THREE: '三', FOUR: '四', FIVE: '五', SIX: '六', SEVEN: '七',
  EIGHT: '八', NINE: '九', TEN: '十', ELEVEN: '十一', TWELVE: '十二', THIRTEEN: '十三',
  FOURTEEN: '十四', FIFTEEN: '十五', TWENTY: '二十', THIRTY: '三十', FORTY: '四十',
  FIFTY: '五十', SIXTY: '六十', SEVENTY: '七十', EIGHTY: '八十', NINETY: '九十', HUNDRED: '百',
  THOUSAND: '千', TEN: '十', POINTED: '瓣', PETALLED: '瓣', FLOWER: '花',
  FIRST: '第一', SECOND: '第二', THIRD: '第三', QUARTER: '四分之一', FULL: '全', HALF: '半',
  EYE: '眼', BALL: '球',
  // Braille
  BRAILLE: '盲文', PATTERN: '模式', DOTS: '点',
  // Religion / culture extra
  STAR: '星', SYMBOLS: '符号', AND: '与', CROSSBONES: '交叉骨', SKULL: '骷髅',
  CRUCIFIX: '十字架', CHI: '希腊字母 Chi', RHO: '希腊字母 Rho', JERUSALEM: '耶路撒冷',
  // Sports
  SAILBOAT: '帆船', TENT: '帐篷', FUEL: '燃料', PUMP: '泵', RESTROOM: '洗手间',
  WATER: '水', CLOSET: '厕所', MEN: '男', WOMAN: '女', BABY: '婴儿', TOILET: '马桶',
  BATH: '浴缸', SHOWER: '淋浴', BICYCLE: '自行车',
  // Block / fraction visual
  EIGHTHS: '八分之一', QUARTERS: '四分之一', HALVES: '二分之一', THREE: '三', SEVENTHS: '七分之一',
  FIFTHS: '五分之一', SIXTHS: '六分之一',
  RUNE: '如尼字母', RUNES: '如尼字母',
  // Colors
  RED: '红', GREEN: '绿', BLUE: '蓝', YELLOW: '黄', BROWN: '棕', BLACK: '黑', WHITE: '白',
  ORANGE: '橙', PURPLE: '紫', PINK: '粉',
}));

// Connective / filler words dropped from a composed name.
const STOP_TOKENS = new Set(['OF', 'FOR', 'TO', 'FROM', 'IN', 'ON', 'THE', 'A', 'AN', 'AND', 'OR', 'WITH', 'AS', 'AT', 'BY', 'INTO', 'OVER', 'UNDER', 'BETWEEN', 'THROUGH', 'TYPE']);

// Generic suffix words (SIGN / MARK / SYMBOL …). They translate, but a name is
// only worth publishing when at least one *distinguishing* (non-generic, non-stop)
// token was also translated — otherwise we'd produce useless duplicates like "符号".
const GENERIC_TOKENS = new Set(['SIGN', 'SIGNS', 'MARK', 'MARKS', 'SYMBOL', 'SYMBOLS', 'PUNCTUATION', 'NOTATION', 'CHARACTER']);

// Final cleanup: collapse repeated suffix markers and trim a single redundant
// trailing "符号" so names read naturally (e.g. "勾号符号" → "勾号").
function tidy(result) {
  return result
    .replace(/(符号|标记|记号){2,}/g, '$1')
    .replace(/(符号|标记|记号)$/, '')
    .trim();
}

function translateDigits(match) {
  const digits = '零一二三四五六七八九';
  const n = Number.parseInt(match, 10);
  if (n < 10) return digits[n];
  if (n < 20) return '十' + (n === 10 ? '' : digits[n - 10]);
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return digits[tens] + '十' + (ones ? digits[ones] : '');
  }
  return match; // leave large numbers as-is
}

export function getChineseName(codePoint, name) {
  const direct = COMMON_NAMES.get(codePoint.toUpperCase());
  if (direct) return direct;

  let text = name;

  // 1) Substitute multi-word compounds first (longest keys win).
  const compoundKeys = [...COMPOUND_TOKENS.keys()].sort((a, b) => b.length - a.length);
  for (const key of compoundKeys) {
    const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    text = text.replace(re, ` ${COMPOUND_TOKENS.get(key)} `);
  }

  // 2) Translate remaining uppercase tokens. Policy: every distinguishing content
  //    token must resolve, otherwise we fall back to English rather than emit a
  //    misleading fragment (e.g. "符号", "标点"). This keeps translations accurate.
  const tokens = text.split(/[^A-Z0-9\u4e00-\u9fff]+/).filter(Boolean);
  const parts = [];
  let distinguishing = 0;
  let untranslatedContent = 0;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const isLast = i === tokens.length - 1;

    // Already-translated (from the compound step) — pass through.
    if (/[\u4e00-\u9fff]/.test(token)) {
      parts.push(token);
      continue;
    }
    if (STOP_TOKENS.has(token)) continue;

    // A trailing bare Latin letter or digit usually *is* the character being
    // encoded (e.g. "CIRCLED LATIN CAPITAL LETTER A", "PARENTHESIZED DIGIT TWO")
    // — preserve it as content rather than dropping it like an article.
    const isTrailingLiteral = isLast && /^[A-Z0-9]{1,3}$/.test(token);
    if (isTrailingLiteral && !TOKEN_NAMES.has(token) && !/^\d+$/.test(token)) {
      parts.push(token);
      distinguishing += 1;
      continue;
    }

    const translated = TOKEN_NAMES.get(token);
    if (translated !== undefined && translated !== '') {
      parts.push(translated);
      if (!GENERIC_TOKENS.has(token)) distinguishing += 1;
      continue;
    }
    if (/^\d+$/.test(token)) {
      parts.push(translateDigits(token));
      distinguishing += 1;
      continue;
    }
    if (GENERIC_TOKENS.has(token)) {
      parts.push(TOKEN_NAMES.get(token));
      continue;
    }
    // Retry singular form for plurals (MARKS→MARK, STARS→STAR …).
    if (token.endsWith('S')) {
      const singular = token.slice(0, -1);
      const sTrans = TOKEN_NAMES.get(singular);
      if (sTrans !== undefined && sTrans !== '') {
        parts.push(sTrans);
        if (!GENERIC_TOKENS.has(singular)) distinguishing += 1;
        continue;
      }
    }

    // An unresolved distinguishing word means the translation would lose the
    // character's identity — reject it so the caller keeps the English name.
    untranslatedContent += 1;
  }

  if (untranslatedContent > 0 || distinguishing === 0) return '';

  return tidy(parts.join(''));
}
