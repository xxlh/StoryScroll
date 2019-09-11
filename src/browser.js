const u = navigator.userAgent, 
	app = navigator.appVersion;


export const trident = u.indexOf('Trident') > -1;			//IE内核
export const presto = u.indexOf('Presto') > -1;				//opera内核
export const webKit = u.indexOf('AppleWebKit') > -1;		//苹果、谷歌内核
export const gecko = u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1;	//火狐内核
export const mobile = !!u.match(/AppleWebKit.*Mobile.*/);	//是否为移动终端
export const ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);	 //ios终端
export const android = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;	//android终端
export const iPhone = u.indexOf('iPhone') > -1;				//是否为iPhone或者QQHD浏览器
export const iPad = u.indexOf('iPad') > -1;					//是否iPad
export const webApp = u.indexOf('Safari') == -1;			//是否web应该程序，没有头部与底部
export const weixin = u.indexOf('MicroMessenger') > -1;		//是否微信 （2015-01-22新增）
export const weibo = u.indexOf('Weibo') > -1;				//是否微博
export const qq = u.match(/\sQQ/i) == " qq";				//是否QQ