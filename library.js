'use strict';
const request = require('request');
const nconf = require("nconf");

const User   = require.main.require("./src/user")// module.parent.require("./user");
const Topics = require.main.require("./src/topics")// module.parent.require("./topics");
const Categories = require.main.require('./src/categories');
let Tokens = {};
const plugin = {};
const url = 'https://new.server.campush.co.il/api/forum' //'http://localhost:4201/api/forum';	

plugin.copyToRemoteServer = function(postData){
		
	// console.log('copyToRemoteServer: ')
	// console.log(postData)
	postData = postData.post
	Topics.getTopicData(postData.tid, function (err, topicData) { //['title', 'slug']
	
		if (err || !topicData.title || !topicData.slug) return console.log("Couldn't find topic data.");

		// Save the data we need.
		let topic = topicData.title;
		let topicSlug = topicData.slug;	

		console.log(`topic slug: ${topicData.slug}`);
		Categories.getCategoryData(postData.cid,function(err,categoryData){
			if(!categoryData) return console.error("Couldn't find category data.");			
			
			User.getUserData(postData.uid,function(err,userData){
				if (!userData) return console.log("Couldn't find username.");
				// console.log(userData)
				// Links always follow this same structure.
				// the site url + "topic/" + the topic slug + "/" + the post id
				let link = nconf.get('url') + "/topic/" + topicSlug + "/" + postData.pid;
		
				let data = Object.assign({},postData)
				data.link = link;
				
				data.username = userData.username;
				data.email = userData.email
				data.topicTitle = topic
				data.categoryName = categoryData.name
				// console.log(data)
				let options = {
					uri: url +'/create',
					method: 'POST',
					headers:{"content-type": "application/json"},				
					json: data
				}
				let usertoken = Tokens[postData.uid]
				if(usertoken){
					options.headers = {
						"content-type": "application/json",
						"Authorization":"Bearer "+usertoken
					}
				}
					
				// console.log(options)
				request(options, function (error, response, body) {
					// console.log('err: ')
					console.log(error)
					if (!error && response.statusCode == 200) {				 
					}
				})	
			})
			
		})

		

	});		
	
	
	
}

plugin.updateRemoteServer = function(data){
	// console.log(data)
	let res = {
		content: data.post.content,
		pid:data.post.pid
	}
	let options = {
		uri: url+'/update',
		method: 'POST',
		headers:{"content-type": "application/json"},				
		json: res
	}
	let usertoken = Tokens[data.post.uid]
	if(usertoken){
		options.headers = {
			"content-type": "application/json",
			"Authorization":"Bearer "+usertoken
		}
	}
		
	// console.log(options)
	request(options, function (error, response, body) {		
		console.log(error)
		if (!error && response.statusCode == 200) {				 
		}
	})	
}

plugin.onDelete = function(data){
	// console.log(data)
	let res = {
		content: data.post.content,
		deleted:1,
		pid:data.post.pid
	}
	let options = {
		uri: url+'/update',
		method: 'POST',
		headers:{"content-type": "application/json"},				
		json: res
	}

	let usertoken = Tokens[data.post.uid]
	if(usertoken){
		options.headers = {
			"content-type": "application/json",
			"Authorization":"Bearer "+usertoken
		}
	}
		
	// console.log(options)
	request(options, function (error, response, body) {		
		console.log(error)
		if (!error && response.statusCode == 200) {				 
		}
	})	
}

plugin.onRestore = function(data){
	// console.log(data)
	let res = {
		content: data.post.content,
		deleted:0,
		pid:data.post.pid
	}
	let options = {
		uri: url+'/update',
		method: 'POST',
		headers:{"content-type": "application/json"},				
		json: res
	}
	
	let usertoken = Tokens[data.post.uid]
	if(usertoken){
		options.headers = {
			"content-type": "application/json",
			"Authorization":"Bearer "+usertoken
		}
	}
		
	// console.log(options)
	request(options, function (error, response, body) {		
		console.log(error)
		if (!error && response.statusCode == 200) {				 
		}
	})	
}

plugin.removeFromRemoteServer = function(data){
	// console.log(data)
	let options = {
		uri: url+'/delete/'+data.post.pid,
		method: 'DELETE'	
	}
	let usertoken = Tokens[data.post.uid]
	if(usertoken){
		options.headers = {		
			"Authorization":"Bearer "+usertoken
		}
	}
		
	request(options, function (error, response, body) {		
		console.log(error)
		if (!error && response.statusCode == 200) {				 
		}
	})	
}

plugin.onUserLogin = function(data){
	let req = data.req
	if (Object.keys(req.cookies).length && 
		req.cookies.hasOwnProperty('token') && req.cookies['token'].length) {
			Tokens[data.uid] = req.cookies['token']
	}
}
plugin.onUserLogout = function(data){
	Tokens[data.uid] = null
}



module.exports = plugin;
