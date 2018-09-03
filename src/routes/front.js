//前端路由
import KoaRouter from 'koa-router'
import controllers from '../controllers'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import {
	SYSTEM
} from '../config'
const router = new KoaRouter()

// 请求接口校验中间件
const checkfn = controllers.common.checkRequestUrl;

/*-------------------------------------首页相关-----------------------------------------------*/

/*首页页面*/
router.get(['/'], async(ctx, next) => {

	let datas = {
		title:'zane 的博客',
		imgBase:SYSTEM.BASEIMG,
		pageNo:1,
		pageSize:30,
		totalNum:0,
		datalist:[],
	}


	let pageNo 			= 	ctx.query.pageNo || 1;
	let pageSize 		= 	datas.pageSize||SYSTEM.PAGESIZE

	// 通过redis获得数据缓存
	let atticleList = await controllers.redis.getHomeData(pageNo,pageSize)

	datas.pageNo 	= 	pageNo
	datas.pageSize 	= 	pageSize
	datas.totalNum  = 	atticleList.totalNum
	datas.datalist  =   atticleList.datalist

	await ctx.render('front/index',{
		datas:datas
	}); 
});

// 归档
router.get(['/file'], async(ctx, next) => {
	let datas = {
		title:'按日期归档',
		imgBase:SYSTEM.BASEIMG,
		dataobj:{},
	}

	let atticleList = await controllers.front.file.getList()||[]

	atticleList.forEach(item=>{
		if(datas.dataobj[item.monthTime]){
			datas.dataobj[item.monthTime].push(item)
		}else{
			datas.dataobj[item.monthTime] = [item]
		}
		
	})
	
	await ctx.render('front/file',{
		datas:datas
	});
})

// 标签
router.get(['/tags'], async(ctx, next) => {
	let datas = {
		title:'标签列表',
		imgBase:SYSTEM.BASEIMG,
		datalist:[],
	}

	datas.datalist = await controllers.front.tags.getList()

	await ctx.render('front/tags',{
		datas:datas
	});
})

// 友链
router.get(['/link'], async(ctx, next) => {
	let datas = {
		title:'友情链接',
		imgBase:SYSTEM.BASEIMG,
		datalist:[],
	}

	datas.datalist = await controllers.front.link.getList()

	await ctx.render('front/link',{
		datas:datas
	});
})

// 关于我
router.get(['/about'], async(ctx, next) => {
	let datas = {
		title:'关于博主',
		imgBase:SYSTEM.BASEIMG,
		aboutme:{},
		commentlist:[],
	}

	// 获得单页面详情
	datas.aboutme 	= await controllers.front.about.getAboutme();
	datas.title 	= datas.aboutme.pageName

	// 获得评论列表
	datas.commentlist = await controllers.front.about.getCommentList(datas.aboutme.id||1)

	await ctx.render('front/about',{
		datas:datas
	});
})

//极验验证 验证
router.post('/api/about/gt/validate-slide', controllers.front.about.gtValidate)

/*详情页面*/
router.get(['/detail/:id'], async(ctx, next) => {

	let datas = {
		title:'',
		describe: '',
		imgBase:SYSTEM.BASEIMG,
		detail:{},
		commentlist:[],
		id:'',
	}

	let id 			=	ctx.params.id || 1
	
	// 通过redis缓存获得详情数据
	let detail      =  await controllers.redis.getDetailData(id)
	
	// 获得评论列表
	let commentlist = await controllers.front.home.getCommentList(id)

	datas.title			=   detail.title
	datas.id  			=   id
	datas.detail 		= 	detail
	datas.commentlist 	= 	commentlist

	await ctx.render('front/detail',{
		datas:datas
	}); 
});

//极验验证 注册
router.get('/api/gt/register-slide', controllers.front.home.gtRegister)

//极验验证 验证
router.post('/api/gt/validate-slide', controllers.front.home.gtValidate)

//每次刷新页面更新浏览次数
router.post('/api/article/addBrowse', controllers.front.home.addBrowse)

/*-------------------------------------搜索结果页-----------------------------------------------*/
router.get(['/search'], async(ctx, next) => {
	let datas = {
		title:'文章搜索列表',
		imgBase:SYSTEM.BASEIMG,
		datalist:[],
		searchtext:null,
		tagid:null,
		dataobj:{}
	}

	datas.searchtext	=	ctx.query.searchtext || ""
	datas.tagid			=   ctx.query.tagid || ""

	let result 			= 	await controllers.front.home.getListForSearch(datas.tagid,datas.searchtext)||[]

	result.forEach(item=>{
		if(datas.dataobj[item.monthTime]){
			datas.dataobj[item.monthTime].push(item)
		}else{
			datas.dataobj[item.monthTime] = [item]
		}
		
	})

	await ctx.render('front/search',{
		datas:datas
	}); 
});


module.exports = router






